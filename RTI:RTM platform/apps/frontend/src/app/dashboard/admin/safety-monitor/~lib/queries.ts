import {
  alerts,
  coachSafetyReports,
  profiles,
  schools,
  screenerAlerts,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import type {
  AdminAlertType,
  AdminRiskLevel,
  AdminSafetyAlert,
  AdminSafetySummary,
} from "./types";

/** Classify alert type for display based on source and category data. */
function classifyAlertType(
  source: string,
  alertType: string,
  screenerType: string | null,
  coachCategory: string | null,
): AdminAlertType {
  if (
    source === "screener" &&
    (screenerType === "phq_9" || screenerType === "phq_a")
  ) {
    return "phq9_q9_endorsed";
  }
  if (coachCategory) {
    const map: Record<string, AdminAlertType> = {
      harm_to_self: "self_harm",
      harm_to_others: "harm_to_others",
      abuse_neglect: "abuse_neglect",
      other_safety: "other",
    };
    return map[coachCategory] ?? "other";
  }
  const typeMap: Record<string, AdminAlertType> = {
    harm_to_self: "self_harm",
    safety: "self_harm",
    harm_to_others: "harm_to_others",
    abuse_neglect: "abuse_neglect",
  };
  return typeMap[alertType] ?? "other";
}

/** Determine risk level for a safety alert. */
function determineRiskLevel(
  source: string,
  screenerType: string | null,
  storedRiskLevel: string | null,
): AdminRiskLevel {
  if (
    source === "screener" &&
    (screenerType === "phq_9" || screenerType === "phq_a")
  ) {
    return "high";
  }
  if (
    storedRiskLevel &&
    ["emergency", "high", "moderate", "low"].includes(storedRiskLevel)
  ) {
    return storedRiskLevel as AdminRiskLevel;
  }
  return "moderate";
}

function computeSummary(safetyAlerts: AdminSafetyAlert[]): AdminSafetySummary {
  const summary: AdminSafetySummary = {
    emergency: 0,
    high: 0,
    moderate: 0,
    low: 0,
    inReview: 0,
  };
  for (const alert of safetyAlerts) {
    summary[alert.riskLevel]++;
    if (alert.status === "in_progress") {
      summary.inReview++;
    }
  }
  return summary;
}

/** Count emergency + high risk safety alerts for the sidebar badge. */
export async function getUrgentAlertCount(): Promise<number> {
  const { summary } = await getAdminSafetyAlerts();
  return summary.emergency + summary.high;
}

/** Fetch all safety alerts across all organizations for the admin dashboard. */
export async function getAdminSafetyAlerts(): Promise<{
  alerts: AdminSafetyAlert[];
  summary: AdminSafetySummary;
}> {
  const db = await serverDrizzle();

  const data = await db.admin
    .select()
    .from(alerts)
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id))
    .leftJoin(
      userSchools,
      and(
        eq(alerts.studentId, userSchools.userId),
        eq(userSchools.role, "student"),
      ),
    )
    .leftJoin(schools, eq(userSchools.schoolId, schools.id))
    .leftJoin(coachSafetyReports, eq(alerts.id, coachSafetyReports.alertId))
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .where(
      or(
        eq(alerts.source, "coach"),
        and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
      ),
    );

  // Deduplicate by alert ID (student may have multiple school entries)
  const seen = new Set<string>();
  const uniqueData = data.filter((row) => {
    if (seen.has(row.alerts.id)) return false;
    seen.add(row.alerts.id);
    return true;
  });

  // Fetch coach names for coach-submitted reports
  const coachIds = [
    ...new Set(
      uniqueData
        .map((r) => r.coach_safety_reports?.submittedByCoachId)
        .filter((id): id is string => id != null),
    ),
  ];
  const coachMap = new Map<string, string>();
  if (coachIds.length > 0) {
    const coaches = await db.admin
      .select()
      .from(users)
      .where(inArray(users.id, coachIds));
    for (const coach of coaches) {
      coachMap.set(coach.id, getUserFullName(coach));
    }
  }

  const safetyAlerts: AdminSafetyAlert[] = uniqueData.map((row) => {
    const alertType = classifyAlertType(
      row.alerts.source,
      row.alerts.type,
      row.screeners?.type ?? null,
      row.coach_safety_reports?.category ?? null,
    );
    const riskLevel = determineRiskLevel(
      row.alerts.source,
      row.screeners?.type ?? null,
      row.coach_safety_reports?.riskLevel ?? null,
    );
    const coachId = row.coach_safety_reports?.submittedByCoachId;
    return {
      alertId: row.alerts.id,
      studentId: row.profiles.id,
      studentName: getUserFullName(row.users),
      grade: row.profiles.grade,
      studentCode: row.profiles.studentCode ?? null,
      schoolName: row.schools?.name ?? "Unknown School",
      schoolId: row.schools?.id ?? null,
      districtCode: row.schools?.districtCode ?? null,
      alertType,
      riskLevel,
      submittedByName: coachId
        ? (coachMap.get(coachId) ?? "Unknown")
        : "System",
      submittedByRole: coachId ? "Therapist" : "System",
      createdAt: row.alerts.createdAt,
      status: row.alerts.status,
      handoffId: row.coach_safety_reports?.handoffId ?? null,
      source: row.alerts.source,
      type: row.alerts.type,
    };
  });

  safetyAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { alerts: safetyAlerts, summary: computeSummary(safetyAlerts) };
}
