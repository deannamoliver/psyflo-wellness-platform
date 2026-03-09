import { NextResponse } from "next/server";
import { getChatSession } from "@/lib/chat/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const session = await getChatSession(sessionId);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 },
    );
  }
}
