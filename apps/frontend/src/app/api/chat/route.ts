import { chatSessions } from "@feelwell/database";
import { HumanMessage } from "@langchain/core/messages";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { buildBaseAgentGraph } from "@/lib/langgraph/base-agent";
import { createThreadId } from "@/lib/langgraph/checkpointer";

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

  if (!sessionId || !message) {
    return new Response("Missing sessionId or message", { status: 400 });
  }

  try {
    // Verify session ownership
    const db = await serverDrizzle();
    const userId = db.userId();

    const session = await db.rls(async (tx) =>
      tx.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId),
      }),
    );

    if (!session) {
      return new Response("Session not found", { status: 404 });
    }

    const agent = buildBaseAgentGraph();
    const threadId = createThreadId(userId, sessionId);

    // Stream with thread_id for persistence
    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
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
            // Each chunk is a tuple: [eventType, data]
            const [, data] = chunk;
            if (data?.agent?.messages) {
              const messages = Array.isArray(data.agent.messages)
                ? data.agent.messages
                : [data.agent.messages];

              for (const msg of messages) {
                // Use _getType() which is stable across minification,
                // with constructor.name as a dev-mode fallback
                const isAI =
                  (msg as { _getType?: () => string })?._getType?.() ===
                    "ai" ||
                  msg?.constructor?.name === "AIMessageChunk" ||
                  msg?.constructor?.name === "AIMessage";

                if (isAI && msg.content) {
                  const dataObj = {
                    type: "chunk",
                    content: typeof msg.content === "string" ? msg.content : "",
                    id: msg.id,
                  };
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(dataObj)}\n\n`),
                  );
                }
              }
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
