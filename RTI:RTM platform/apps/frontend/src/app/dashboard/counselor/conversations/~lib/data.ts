"server-only";

import {
  profiles,
  schools,
  userSchools,
  users,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, desc, eq, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";

export type ConversationStatus =
  | "needs_coach_reply"
  | "waiting_on_student"
  | "closed"
  | "transferred";

export type ConversationRow = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  school: string;
  grade: number | null;
  status: ConversationStatus;
  lastMessageAt: string;
  hasActiveAlert: boolean;
};

export type ConversationSummary = {
  active: number;
  needsCoachReply: number;
  waitingOnStudent: number;
  closed: number;
};

function deriveStatus(
  handoffStatus: string,
  lastEntryAuthor: string | null,
): ConversationStatus {
  if (handoffStatus === "completed") return "closed";
  if (handoffStatus === "cancelled") return "transferred";
  if (handoffStatus === "in_progress" && lastEntryAuthor === "coach") {
    return "waiting_on_student";
  }
  return "needs_coach_reply";
}

export async function fetchConversations(): Promise<{
  conversations: ConversationRow[];
  summary: ConversationSummary;
  schools: string[];
} | null> {
  const db = await serverDrizzle();
  const coachId = db.userId();

  const coachSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(eq(userSchools.userId, coachId))
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!coachSchool) return null;

  const handoffs = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      user: users,
      profile: profiles,
      schoolName: schools.name,
      lastEntryAuthor: sql<string | null>`(
        SELECT author FROM wellness_coach_chat_entries
        WHERE escalation_id = ${wellnessCoachHandoffs.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastEntryAt: sql<string | null>`(
        SELECT created_at FROM wellness_coach_chat_entries
        WHERE escalation_id = ${wellnessCoachHandoffs.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      hasActiveAlert: sql<boolean>`EXISTS(
        SELECT 1 FROM alerts
        WHERE student_id = ${wellnessCoachHandoffs.studentId}
        AND status != 'resolved'
      )`,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .innerJoin(profiles, eq(wellnessCoachHandoffs.studentId, profiles.id))
    .innerJoin(schools, eq(wellnessCoachHandoffs.schoolId, schools.id))
    .where(
      and(
        eq(wellnessCoachHandoffs.schoolId, coachSchool),
        eq(wellnessCoachHandoffs.acceptedByCoachId, coachId),
      ),
    )
    .orderBy(desc(wellnessCoachHandoffs.updatedAt));

  const conversations: ConversationRow[] = handoffs.map(
    ({
      handoff,
      user,
      profile,
      schoolName,
      lastEntryAuthor,
      lastEntryAt,
      hasActiveAlert,
    }) => ({
      id: handoff.id,
      studentId: user.id,
      studentName: getUserFullName(user),
      studentCode: `ST-${user.id.slice(-4).toUpperCase()}`,
      school: schoolName,
      grade: profile.grade,
      status: deriveStatus(handoff.status, lastEntryAuthor),
      lastMessageAt: lastEntryAt ?? handoff.requestedAt.toISOString(),
      hasActiveAlert: hasActiveAlert ?? false,
    }),
  );

  const summary: ConversationSummary = {
    active: conversations.filter(
      (c) => c.status !== "closed" && c.status !== "transferred",
    ).length,
    needsCoachReply: conversations.filter(
      (c) => c.status === "needs_coach_reply",
    ).length,
    waitingOnStudent: conversations.filter(
      (c) => c.status === "waiting_on_student",
    ).length,
    closed: conversations.filter((c) => c.status === "closed").length,
  };

  const uniqueSchools = [...new Set(conversations.map((c) => c.school))].sort();
  return { conversations, summary, schools: uniqueSchools };
}
