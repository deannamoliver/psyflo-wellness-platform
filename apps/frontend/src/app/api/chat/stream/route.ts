import { chatSessions } from "@feelwell/database";
import { HumanMessage } from "@langchain/core/messages";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { EXPLORE_TOPICS } from "@/app/dashboard/student/home/~lib/sidebar-data";
import { serverDrizzle } from "@/lib/database/drizzle";
import { createThreadId } from "@/lib/langgraph/checkpointer";
import { getMainGraph } from "@/lib/langgraph/main-graph";

// LangChain message type
interface LangChainMessage {
  _getType?: () => string;
  constructor?: {
    name?: string;
  };
  id?: string;
  content?: string | unknown;
}

// Stream chunk type
interface StreamChunkData {
  agent?: {
    messages?: LangChainMessage | LangChainMessage[];
  };
  risk_protocol?: {
    messages?: LangChainMessage | LangChainMessage[];
  };
  base_agent?: {
    messages?: LangChainMessage | LangChainMessage[];
  };
  handover_to_coach?: {
    messages?: LangChainMessage | LangChainMessage[];
    shouldShutdown?: boolean;
  };
  inform_user_to_wait?: {
    messages?: LangChainMessage | LangChainMessage[];
    shouldShutdown?: boolean;
  };
}

/**
 * Forces the route to be treated as dynamic by the Next.js framework.
 *
 * This export is used in Next.js App Router to indicate that the route should
 * not be statically optimized and must always be rendered dynamically on the server.
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering#opting-into-dynamic-rendering
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const message = searchParams.get("message");
  const expertTopicParam = searchParams.get("expertTopic");
  const expertTopicParentParam = searchParams.get("expertTopicParent");

  if (!sessionId || !message) {
    return new Response("Missing sessionId or message", { status: 400 });
  }

  try {
    // Verify session ownership
    const db = await serverDrizzle();
    const userId = db.userId();

    const session = await db.admin.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId),
    });

    if (!session) {
      return new Response("Session not found", { status: 404 });
    }

    // Verify ownership
    if (session.userId !== userId) {
      return new Response("Unauthorized", { status: 403 });
    }

    // If session is handed off to a coach, don't invoke the AI agent
    if (session.assignedCoachId) {
      return new Response("Session is with a wellness coach", { status: 400 });
    }

    const agent = await getMainGraph();
    const threadId = createThreadId(userId, sessionId);

    // Build explore topic context for the system prompt
    let exploreTopic: string | null = null;
    const allSubtopics = EXPLORE_TOPICS.flatMap((t) =>
      (t.subcategories ?? []).map((s) => ({ ...s, parentTitle: t.title })),
    );
    if (expertTopicParam && expertTopicParentParam) {
      // First message: client sends both params
      const sub = allSubtopics.find((s) => s.title === expertTopicParam);
      const desc = sub?.description ?? "";
      exploreTopic = `${expertTopicParentParam} > ${expertTopicParam}${desc ? `: ${desc}` : ""}`;
    } else if (session.subject) {
      // Subsequent messages: fall back to session subject stored in DB
      const sub = allSubtopics.find((s) => s.title === session.subject);
      if (sub) {
        exploreTopic = `${sub.parentTitle} > ${sub.title}: ${sub.description}`;
      }
    }

    // Stream with thread_id for persistence
    const stream = await agent.stream(
      {
        messages: [new HumanMessage(message)],
        chatSessionId: sessionId,
        userId: userId,
        exploreTopic,
      },
      {
        streamMode: ["updates"],
        configurable: { thread_id: threadId },
      },
    );

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // The stream yields tuples like: ["updates", { agent: { messages: [...] } }]
            const [, raw] = chunk as [string, StreamChunkData];

            // Extract messages from any subagent (agent, risk_protocol, base_agent, or handover)
            const messagesData =
              raw?.agent ??
              raw?.risk_protocol ??
              raw?.base_agent ??
              raw?.handover_to_coach ??
              raw?.inform_user_to_wait;

            // Check if the handover node signaled a shutdown
            const shouldShutdown =
              raw?.handover_to_coach?.shouldShutdown ??
              raw?.inform_user_to_wait?.shouldShutdown ??
              false;

            if (messagesData?.messages) {
              const messages = Array.isArray(messagesData.messages)
                ? messagesData.messages
                : [messagesData.messages];

              console.log(
                "[STREAM] Processing update with messages:",
                messages.map((m) => ({
                  type: m?._getType?.() ?? m?.constructor?.name,
                  id: m?.id,
                  contentLength:
                    typeof m?.content === "string" ? m.content.length : 0,
                })),
              );

              for (const msg of messages) {
                // Use _getType() which is stable across minification,
                // with constructor.name as a dev-mode fallback
                const isAI =
                  msg?._getType?.() === "ai" ||
                  msg?.constructor?.name === "AIMessageChunk" ||
                  msg?.constructor?.name === "AIMessage";

                if (isAI && msg.content) {
                  const data = {
                    type: "chunk",
                    content: typeof msg.content === "string" ? msg.content : "",
                    id: msg.id,
                  };
                  console.log("[STREAM] Sending chunk:", {
                    id: data.id,
                    contentLength: data.content.length,
                  });
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
                  );
                }
              }
            }

            if (shouldShutdown) {
              console.log(
                "[STREAM] Shutdown signaled from handover node. Terminating stream.",
              );
              // TODO: Update the session with the appropriate column that exists in chatSessions table
              // .set({ status: "handed_over" }) should be replaced with the actual column name
              break; // Exit the loop to terminate the stream
            }
          }

          controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
