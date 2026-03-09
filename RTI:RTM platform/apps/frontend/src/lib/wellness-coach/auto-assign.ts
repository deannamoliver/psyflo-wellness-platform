"server-only";

import {
  chatSessions,
  schools,
  userSchools,
  users,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import type { serverDrizzle } from "@/lib/database/drizzle";
import { publishHandoffEvent } from "@/lib/realtime/publish-handoff-event";

type ServerDb = Awaited<ReturnType<typeof serverDrizzle>>;
type DrizzleAdmin = Pick<ServerDb, "admin">;

type AssignResult =
  | {
      status: "with_coach";
      assignedCoachId: string;
      coachFirstName: string | null;
    }
  | { status: "waiting" };

/**
 * Automatically assign a wellness coach to a handoff using the 3-priority algorithm.
 *
 * Priority 1: Same coach as before (if still a valid wellness_coach).
 * Priority 2: Coaches at the handoff's school, lowest active workload.
 * Priority 3: Coaches in the organization, lowest active workload.
 *
 * If a coach is found: updates handoff, chat session, inserts greeting.
 * If no coach found: leaves handoff as pending.
 */
export async function autoAssignCoach(
  handoffId: string,
  db: DrizzleAdmin,
): Promise<AssignResult> {
  // Fetch the handoff to get studentId, schoolId, chatSessionId
  const [handoff] = await db.admin
    .select({
      studentId: wellnessCoachHandoffs.studentId,
      schoolId: wellnessCoachHandoffs.schoolId,
      chatSessionId: wellnessCoachHandoffs.chatSessionId,
    })
    .from(wellnessCoachHandoffs)
    .where(eq(wellnessCoachHandoffs.id, handoffId))
    .limit(1);

  if (!handoff) {
    return { status: "waiting" };
  }

  // --- Priority 1: Previous coach ---
  const coachId =
    (await findPreviousCoach(db, handoff.studentId)) ??
    (await findSchoolCoach(db, handoff.schoolId)) ??
    (await findOrgCoach(db, handoff.schoolId));

  if (!coachId) {
    return { status: "waiting" };
  }

  // --- Assign the coach ---
  await applyAssignment(db, handoffId, handoff.chatSessionId, coachId);

  // Get coach first name
  const coachFirstName = await getCoachFirstName(db, coachId);

  return { status: "with_coach", assignedCoachId: coachId, coachFirstName };
}

/**
 * Priority 1: Find the student's previous coach (if still valid).
 */
async function findPreviousCoach(
  db: DrizzleAdmin,
  studentId: string,
): Promise<string | null> {
  const [prev] = await db.admin
    .select({ acceptedByCoachId: wellnessCoachHandoffs.acceptedByCoachId })
    .from(wellnessCoachHandoffs)
    .where(
      and(
        eq(wellnessCoachHandoffs.studentId, studentId),
        isNotNull(wellnessCoachHandoffs.acceptedByCoachId),
      ),
    )
    .orderBy(desc(wellnessCoachHandoffs.requestedAt))
    .limit(1);

  if (!prev?.acceptedByCoachId) return null;

  // Verify the coach still has a wellness_coach role
  const [valid] = await db.admin
    .select({ userId: userSchools.userId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, prev.acceptedByCoachId),
        eq(userSchools.role, "wellness_coach"),
      ),
    )
    .limit(1);

  return valid ? prev.acceptedByCoachId : null;
}

/**
 * Priority 2: Find a coach at the handoff's school with the lowest workload.
 */
async function findSchoolCoach(
  db: DrizzleAdmin,
  schoolId: string | null,
): Promise<string | null> {
  if (!schoolId) return null;

  const [coach] = await db.admin
    .select({
      userId: userSchools.userId,
      activeCount: sql<number>`(
        SELECT COUNT(*) FROM wellness_coach_handoffs
        WHERE accepted_by_coach_id = ${userSchools.userId}
        AND status IN ('accepted', 'in_progress')
      )`,
    })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "wellness_coach"),
      ),
    )
    .orderBy(sql`(
      SELECT COUNT(*) FROM wellness_coach_handoffs
      WHERE accepted_by_coach_id = ${userSchools.userId}
      AND status IN ('accepted', 'in_progress')
    ) ASC`)
    .limit(1);

  return coach?.userId ?? null;
}

/**
 * Priority 3: Find a coach in the organization with the lowest workload.
 */
async function findOrgCoach(
  db: DrizzleAdmin,
  schoolId: string | null,
): Promise<string | null> {
  if (!schoolId) return null;

  // Get organization ID (if null, the school itself is the org)
  const [school] = await db.admin
    .select({ organizationId: schools.organizationId })
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  const orgId = school?.organizationId ?? schoolId;

  // Find coaches in any school belonging to this org
  const [coach] = await db.admin
    .select({
      userId: userSchools.userId,
      activeCount: sql<number>`(
        SELECT COUNT(*) FROM wellness_coach_handoffs
        WHERE accepted_by_coach_id = ${userSchools.userId}
        AND status IN ('accepted', 'in_progress')
      )`,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        eq(userSchools.role, "wellness_coach"),
        or(eq(userSchools.schoolId, orgId), eq(schools.organizationId, orgId)),
      ),
    )
    .orderBy(sql`(
      SELECT COUNT(*) FROM wellness_coach_handoffs
      WHERE accepted_by_coach_id = ${userSchools.userId}
      AND status IN ('accepted', 'in_progress')
    ) ASC`)
    .limit(1);

  return coach?.userId ?? null;
}

/**
 * Apply the coach assignment: update handoff, chat session, insert greeting.
 */
async function applyAssignment(
  db: DrizzleAdmin,
  handoffId: string,
  chatSessionId: string,
  coachId: string,
): Promise<void> {
  const now = new Date();

  // Update handoff
  await db.admin
    .update(wellnessCoachHandoffs)
    .set({
      acceptedByCoachId: coachId,
      acceptedAt: now,
      status: "accepted",
      updatedAt: now,
    })
    .where(eq(wellnessCoachHandoffs.id, handoffId));

  // Update chat session
  await db.admin
    .update(chatSessions)
    .set({ assignedCoachId: coachId })
    .where(eq(chatSessions.id, chatSessionId));

  await publishHandoffEvent(handoffId, {
    type: "handoff.assigned",
    handoffId,
    assignedCoachId: coachId,
    createdAt: now.toISOString(),
  });

  // Insert coach greeting
  await db.admin.insert(wellnessCoachChatEntries).values({
    escalationId: handoffId,
    content: "Hi! I'm your wellness coach. How can I help you today?",
    author: "coach",
    senderUserId: coachId,
  });

  await publishHandoffEvent(handoffId, {
    type: "message.created",
    handoffId,
    author: "coach",
    createdAt: new Date().toISOString(),
  });
}

/**
 * Look up the coach's first name from user metadata.
 */
async function getCoachFirstName(
  db: DrizzleAdmin,
  coachId: string,
): Promise<string | null> {
  const [coachUser] = await db.admin
    .select({
      firstName: sql<string | null>`${users.rawUserMetaData}->>'first_name'`,
    })
    .from(users)
    .where(eq(users.id, coachId))
    .limit(1);

  return coachUser?.firstName ?? null;
}
