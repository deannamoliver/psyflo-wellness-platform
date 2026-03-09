import { NextResponse } from "next/server";
import { getExecutionTrace } from "@/lib/chat/api";

/**
 * Test endpoint to fetch execution trace for a session
 * GET /api/chat/trace/[sessionId]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    // Fetch execution trace
    const trace = await getExecutionTrace(sessionId);

    // Return formatted JSON for inspection
    return NextResponse.json(
      {
        success: true,
        trace,
        summary: {
          sessionId: trace.sessionId,
          threadId: trace.threadId,
          totalTurns: trace.turns.length,
          totalCheckpoints: trace.totalCheckpoints,
          uniqueNodes: trace.uniqueNodes,
          turns: trace.turns.map((turn) => ({
            turnNumber: turn.turnNumber,
            userMessage: `${turn.userMessage?.substring(0, 50)}...` || null,
            nodeCount: turn.nodes.length,
            nodes: turn.nodes.map((n) => n.nodeName),
            durationMs: turn.durationMs,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching execution trace:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
