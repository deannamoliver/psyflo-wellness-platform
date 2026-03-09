import {
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { publishHandoffEvent } from "@/lib/realtime/publish-handoff-event";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      chatSessionId: string;
      content: string;
      handoffId: string;
    };

    if (!body.handoffId || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Missing handoffId or content" },
        { status: 400 },
      );
    }

    const trimmed = body.content.trim();

    // Publish via WebSocket first for instant delivery
    await publishHandoffEvent(body.handoffId, {
      type: "message.created",
      handoffId: body.handoffId,
      author: "student",
      content: trimmed,
      createdAt: new Date().toISOString(),
    });

    // Persist to DB and update status in parallel
    const db = await serverDrizzle();
    const userId = db.userId();

    await Promise.all([
      db.admin.insert(wellnessCoachChatEntries).values({
        escalationId: body.handoffId,
        content: trimmed,
        author: "student",
        senderUserId: userId,
      }),
      db.admin
        .update(wellnessCoachHandoffs)
        .set({ status: "in_progress" })
        .where(eq(wellnessCoachHandoffs.id, body.handoffId)),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send wellness coach message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
