import { chatSessions, users, wellnessCoachHandoffs } from "@feelwell/database";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const db = await serverDrizzle();
    const userId = db.userId();

    // Verify session exists and user owns it
    const [session] = await db.admin
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [acceptedHandoff] = await db.admin
      .select({ id: wellnessCoachHandoffs.id })
      .from(wellnessCoachHandoffs)
      .where(
        and(
          eq(wellnessCoachHandoffs.chatSessionId, sessionId),
          inArray(wellnessCoachHandoffs.status, [
            "accepted",
            "in_progress",
            "completed",
          ]),
        ),
      )
      .orderBy(desc(wellnessCoachHandoffs.acceptedAt))
      .limit(1);

    // If assigned coach, we're in coach mode (not waiting)
    if (session.assignedCoachId) {
      const [coachUser] = await db.admin
        .select({
          firstName: sql<
            string | null
          >`${users.rawUserMetaData}->>'first_name'`,
        })
        .from(users)
        .where(eq(users.id, session.assignedCoachId))
        .limit(1);

      return NextResponse.json({
        status: "with_coach",
        assignedCoachId: session.assignedCoachId,
        coachFirstName: coachUser?.firstName ?? null,
        handoffId: acceptedHandoff?.id ?? null,
      });
    }

    // Check for pending handoff
    const [handoff] = await db.admin
      .select()
      .from(wellnessCoachHandoffs)
      .where(
        and(
          eq(wellnessCoachHandoffs.chatSessionId, sessionId),
          eq(wellnessCoachHandoffs.status, "pending"),
        ),
      )
      .orderBy(desc(wellnessCoachHandoffs.requestedAt))
      .limit(1);

    if (handoff) {
      return NextResponse.json({
        status: "waiting",
        escalationId: handoff.id,
        requestedAt: handoff.requestedAt,
      });
    }

    return NextResponse.json({ status: "none" });
  } catch (error) {
    console.error("Failed to get wellness coach status:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 },
    );
  }
}
