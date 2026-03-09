import { NextResponse } from "next/server";
import { createChatSession, getChatSessions } from "@/lib/chat/api";

export async function GET() {
  try {
    const sessions = await getChatSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const session = await createChatSession();
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 },
    );
  }
}
