import { userSchools, wellnessCoachHandoffs } from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { autoAssignCoach } from "@/lib/wellness-coach/auto-assign";

type EscalateRequestBody = {
  chatSessionId: string;
  reason: string;
  topic: string;
  otherDetail?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EscalateRequestBody;

    if (
      !body.chatSessionId ||
      typeof body.reason !== "string" ||
      typeof body.topic !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid chatSessionId, reason, or topic" },
        { status: 400 },
      );
    }

    const reason = body.reason.trim();
    const topic = body.topic.trim();
    const otherDetail =
      typeof body.otherDetail === "string" && body.otherDetail.trim().length > 0
        ? body.otherDetail.trim().slice(0, 500)
        : null;

    if (!reason || !topic) {
      return NextResponse.json(
        { error: "Reason and topic are required" },
        { status: 400 },
      );
    }

    const db = await serverDrizzle();
    const userId = db.userId();

    // Get student's school (nullable)
    const userSchool = await db.admin
      .select({ schoolId: userSchools.schoolId })
      .from(userSchools)
      .where(
        and(eq(userSchools.userId, userId), eq(userSchools.role, "student")),
      )
      .limit(1)
      .then((res) => res[0]);

    const [handoff] = await db.admin
      .insert(wellnessCoachHandoffs)
      .values({
        chatSessionId: body.chatSessionId,
        studentId: userId,
        schoolId: userSchool?.schoolId ?? null,
        reason,
        topic,
        otherDetail,
        status: "pending",
      })
      .returning();

    if (!handoff) {
      return NextResponse.json(
        { error: "Failed to create handoff" },
        { status: 500 },
      );
    }

    // Auto-assign a wellness coach immediately
    const assignResult = await autoAssignCoach(handoff.id, db);

    return NextResponse.json({
      ok: true,
      escalationId: handoff.id,
      ...assignResult,
    });
  } catch (error) {
    console.error("Failed to create wellness coach handoff:", error);
    return NextResponse.json(
      { error: "Failed to create handoff" },
      { status: 500 },
    );
  }
}
