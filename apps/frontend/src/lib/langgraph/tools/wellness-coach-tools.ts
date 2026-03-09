/**
 * Wellness Coach Handoff Database Tools
 *
 * Creates wellness_coach_handoffs records from within LangGraph nodes.
 * Used by the handover_to_coach node to create automatic risk-protocol handoffs.
 */

import { userSchools, wellnessCoachHandoffs } from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { autoAssignCoach } from "@/lib/wellness-coach/auto-assign";

/**
 * Create a wellness coach handoff triggered by the risk protocol.
 *
 * Mirrors the manual escalate API route but uses fixed reason/topic
 * and marks origin as "risk_protocol".
 */
export async function createWellnessCoachHandoff(params: {
  chatSessionId: string;
  alertId?: string | null;
}): Promise<{ handoffId: string; success: boolean }> {
  const db = await serverDrizzle();
  const studentId = db.userId();

  // Get student's school (same lookup as /api/wellness-coach/escalate)
  const userSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  const [handoff] = await db.admin
    .insert(wellnessCoachHandoffs)
    .values({
      chatSessionId: params.chatSessionId,
      studentId,
      schoolId: userSchool?.schoolId ?? null,
      reason: "Automatic response",
      topic: "Safety concerns",
      alertId: params.alertId ?? null,
      origin: "risk_protocol",
      status: "pending",
    })
    .returning();

  if (!handoff) {
    throw new Error("Failed to create wellness coach handoff");
  }

  // Auto-assign a wellness coach immediately
  const assignResult = await autoAssignCoach(handoff.id, db);

  console.log("[DB] Created risk-protocol wellness coach handoff:", {
    handoffId: handoff.id,
    chatSessionId: params.chatSessionId,
    studentId,
    alertId: params.alertId ?? null,
    assignStatus: assignResult.status,
  });

  return { handoffId: handoff.id, success: true };
}
