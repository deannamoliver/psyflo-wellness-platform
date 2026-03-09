import { chatSessions } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { updateSessionTitle } from "@/lib/chat/api";
import { serverDrizzle } from "@/lib/database/drizzle";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const { title, subject } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 },
      );
    }

    // Verify session ownership
    const db = await serverDrizzle();
    const userId = db.userId();

    const session = await db.admin.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify ownership
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update title and optionally subject
    await updateSessionTitle(sessionId, title, subject);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating session title:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
