import { NextResponse } from "next/server";
import { markSessionAsRead } from "@/lib/chat/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    await markSessionAsRead(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking session as read:", error);
    return NextResponse.json(
      { error: "Failed to mark session as read" },
      { status: 500 },
    );
  }
}
