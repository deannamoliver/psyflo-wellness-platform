"server-only";

import {
  alerts,
  profiles,
  schools,
  users,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";

export type LiveSessionRow = {
  id: string;
  studentName: string;
  studentGrade: number | null;
  organization: string;
  location: string;
  coachName: string;
  coachIsAdmin: boolean;
  startedAt: string;
  hasActiveSafetyReview: boolean;
};

export type HistorySessionRow = {
  id: string;
  studentName: string;
  studentGrade: number | null;
  organization: string;
  location: string;
  coachName: string;
  startedAt: string;
  endedAt: string | null;
  duration: string;
  status: "completed" | "transferred";
  hasActiveSafetyReview: boolean;
};

export type ConversationsPageData = {
  liveSessions: LiveSessionRow[];
  historySessions: HistorySessionRow[];
  organizations: string[];
  locations: string[];
  coaches: string[];
};

function computeDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export async function fetchLiveSessionCount(): Promise<number> {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: sql<number>`count(*)` })
    .from(wellnessCoachHandoffs)
    .where(inArray(wellnessCoachHandoffs.status, ["accepted", "in_progress"]));
  return Number(result[0]?.count ?? 0);
}

export async function fetchAdminConversations(): Promise<ConversationsPageData> {
  const db = await serverDrizzle();

  // Fetch active handoffs (in_progress or accepted)
  const liveHandoffs = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      studentUser: users,
      profile: profiles,
      schoolName: schools.name,
      coachUser: {
        id: sql<string>`coach_user.id`,
        rawUserMetaData: sql<
          Record<string, unknown>
        >`coach_user.raw_user_meta_data`,
      },
      coachPlatformRole: sql<string | null>`coach_profile.platform_role`,
      alertStatus: alerts.status,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .innerJoin(profiles, eq(wellnessCoachHandoffs.studentId, profiles.id))
    .innerJoin(schools, eq(wellnessCoachHandoffs.schoolId, schools.id))
    .leftJoin(
      sql`auth.users as coach_user`,
      sql`coach_user.id = ${wellnessCoachHandoffs.acceptedByCoachId}`,
    )
    .leftJoin(
      sql`profiles as coach_profile`,
      sql`coach_profile.id = ${wellnessCoachHandoffs.acceptedByCoachId}`,
    )
    .leftJoin(alerts, eq(wellnessCoachHandoffs.alertId, alerts.id))
    .where(inArray(wellnessCoachHandoffs.status, ["accepted", "in_progress"]))
    .orderBy(desc(wellnessCoachHandoffs.requestedAt));

  const liveSessions: LiveSessionRow[] = liveHandoffs.map((row) => ({
    id: row.handoff.id,
    studentName: getUserFullName(row.studentUser),
    studentGrade: row.profile.grade,
    organization: row.schoolName,
    location: row.schoolName,
    coachName: row.coachUser?.rawUserMetaData
      ? getUserFullName(row.coachUser as typeof users.$inferSelect)
      : "Unassigned",
    coachIsAdmin: row.coachPlatformRole === "admin",
    startedAt: (
      row.handoff.acceptedAt ?? row.handoff.requestedAt
    ).toISOString(),
    hasActiveSafetyReview:
      row.alertStatus === "new" || row.alertStatus === "in_progress",
  }));

  // Fetch completed/cancelled handoffs for history
  const historyHandoffs = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      studentUser: users,
      profile: profiles,
      schoolName: schools.name,
      coachUser: {
        id: sql<string>`coach_user.id`,
        rawUserMetaData: sql<
          Record<string, unknown>
        >`coach_user.raw_user_meta_data`,
      },
      closedAt: sql<string | null>`(
        SELECT created_at FROM conversation_events
        WHERE handoff_id = ${wellnessCoachHandoffs.id}
        AND event_type IN ('closed', 'transferred')
        ORDER BY created_at DESC LIMIT 1
      )`,
      alertStatus: alerts.status,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .innerJoin(profiles, eq(wellnessCoachHandoffs.studentId, profiles.id))
    .innerJoin(schools, eq(wellnessCoachHandoffs.schoolId, schools.id))
    .leftJoin(
      sql`auth.users as coach_user`,
      sql`coach_user.id = ${wellnessCoachHandoffs.acceptedByCoachId}`,
    )
    .leftJoin(alerts, eq(wellnessCoachHandoffs.alertId, alerts.id))
    .where(inArray(wellnessCoachHandoffs.status, ["completed", "cancelled"]))
    .orderBy(desc(wellnessCoachHandoffs.updatedAt));

  const historySessions: HistorySessionRow[] = historyHandoffs.map((row) => {
    const startDate = row.handoff.acceptedAt ?? row.handoff.requestedAt;
    const endDate = row.closedAt
      ? new Date(row.closedAt)
      : row.handoff.updatedAt;

    return {
      id: row.handoff.id,
      studentName: getUserFullName(row.studentUser),
      studentGrade: row.profile.grade,
      organization: row.schoolName,
      location: row.schoolName,
      coachName: row.coachUser?.rawUserMetaData
        ? getUserFullName(row.coachUser as typeof users.$inferSelect)
        : "Unassigned",
      startedAt: startDate.toISOString(),
      endedAt: endDate ? endDate.toISOString() : null,
      duration: endDate ? computeDuration(startDate, endDate) : "N/A",
      status: row.handoff.status === "cancelled" ? "transferred" : "completed",
      hasActiveSafetyReview:
        row.alertStatus === "new" || row.alertStatus === "in_progress",
    };
  });

  // Collect unique filter options
  const allRows = [...liveSessions, ...historySessions];
  const organizations = [...new Set(allRows.map((r) => r.organization))].sort();
  const locations = [...new Set(allRows.map((r) => r.location))].sort();
  const coaches = [
    ...new Set(
      allRows.map((r) => r.coachName).filter((n) => n !== "Unassigned"),
    ),
  ].sort();

  return { liveSessions, historySessions, organizations, locations, coaches };
}
