"use server";

import {
  alerts,
  chatSessions,
  emergencyContacts,
  moodCheckIns,
  profiles,
  schools,
  screenerAlerts,
  screeners,
  userSchools,
  users,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  sql,
} from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { RiskLevel } from "@/lib/screener/type";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";
import { getUserFullName } from "@/lib/user/utils";

const RISK_THRESHOLD: RiskLevel = 2;

type SafetyRiskLevel = "emergency" | "high" | "moderate" | "low";

const SAFETY_RISK_PRIORITY: Record<SafetyRiskLevel, number> = {
  emergency: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

function determineSafetyRiskLevel(
  source: string,
  screenerType: string | null,
): SafetyRiskLevel {
  if (
    source === "screener" &&
    (screenerType === "phq_9" || screenerType === "phq_a")
  ) {
    return "high";
  }
  return "moderate";
}

const CSV_HEADERS = [
  "Patient Name",
  "Grade",
  "Safety Alert Level",
  "Anxiety Indicator",
  "Depression Indicator",
  "Last Check-in",
  "Email",
  "Date of Birth",
  "Gender",
  "Pronouns",
  "Ethnicity",
  "Language",
  "Home Address",
  "Patient Code",
  "Account Status",
  "Clinic",
  "District Code",
  "Interests",
  "Learning Styles",
  "Goals",
  "Last Active",
  "Onboarding Completed",
  "Account Created",
  "Total Safety Alerts",
  "Total Check-ins",
  "Total Conversations",
  "Total Support Hours",
  "Primary Emergency Contact Name",
  "Primary Emergency Contact Relation",
  "Primary Emergency Contact Phone",
  "Primary Emergency Contact Email",
] as const;

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatLabel(value: string | null): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function exportStudentsCsv(studentIds: string[]): Promise<string> {
  if (studentIds.length === 0) return "";

  const db = await serverDrizzle();

  const rows = await db.admin
    .select({ user: users, profile: profiles })
    .from(profiles)
    .innerJoin(users, eq(profiles.id, users.id))
    .where(inArray(profiles.id, studentIds));

  const schoolRows = await db.admin
    .select({
      userId: userSchools.userId,
      schoolName: schools.name,
      districtCode: schools.districtCode,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        inArray(userSchools.userId, studentIds),
        eq(userSchools.role, "student"),
      ),
    );

  const schoolMap = new Map(schoolRows.map((r) => [r.userId, r]));

  const lastCheckIns = await db.admin
    .select({
      userId: moodCheckIns.userId,
      lastCheckIn: sql<string>`MAX(${moodCheckIns.createdAt})`,
    })
    .from(moodCheckIns)
    .where(inArray(moodCheckIns.userId, studentIds))
    .groupBy(moodCheckIns.userId);

  const checkInMap = new Map(
    lastCheckIns.map((r) => [r.userId, r.lastCheckIn]),
  );

  const latestScreeners = await db.admin
    .selectDistinctOn([screeners.userId, screeners.type], {
      userId: screeners.userId,
      type: screeners.type,
      score: screeners.score,
    })
    .from(screeners)
    .where(
      and(
        inArray(screeners.userId, studentIds),
        isNotNull(screeners.completedAt),
      ),
    )
    .orderBy(screeners.userId, screeners.type, desc(screeners.completedAt));

  type Indicator = { severity: string };
  const mentalHealthMap = new Map<
    string,
    { anxiety: Indicator | null; depression: Indicator | null }
  >();

  for (const s of latestScreeners) {
    const category: "anxiety" | "depression" | null =
      s.type === "phq_9" || s.type === "phq_a"
        ? "depression"
        : s.type === "gad_7" || s.type === "gad_child"
          ? "anxiety"
          : null;
    if (!category) continue;
    const riskLevel = getRiskLevel({ type: s.type, score: Number(s.score) });
    if (riskLevel < RISK_THRESHOLD) continue;
    const severity = getRiskLevelTitle({ type: s.type, riskLevel });
    if (!severity) continue;
    if (!mentalHealthMap.has(s.userId)) {
      mentalHealthMap.set(s.userId, { anxiety: null, depression: null });
    }
    const entry = mentalHealthMap.get(s.userId)!;
    if (!entry[category]) entry[category] = { severity };
  }

  const safetyAlertRows = await db.admin
    .select({
      studentId: alerts.studentId,
      source: alerts.source,
      screenerType: screeners.type,
    })
    .from(alerts)
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .where(
      and(
        inArray(alerts.studentId, studentIds),
        eq(alerts.type, "safety"),
        ne(alerts.status, "resolved"),
      ),
    );

  const safetyRiskMap = new Map<string, SafetyRiskLevel>();
  for (const a of safetyAlertRows) {
    const level = determineSafetyRiskLevel(a.source, a.screenerType);
    const current = safetyRiskMap.get(a.studentId);
    if (
      !current ||
      SAFETY_RISK_PRIORITY[level] < SAFETY_RISK_PRIORITY[current]
    ) {
      safetyRiskMap.set(a.studentId, level);
    }
  }

  const alertCounts = await db.admin
    .select({ studentId: alerts.studentId, count: count() })
    .from(alerts)
    .where(inArray(alerts.studentId, studentIds))
    .groupBy(alerts.studentId);

  const alertCountMap = new Map(alertCounts.map((r) => [r.studentId, r.count]));

  const checkInCounts = await db.admin
    .select({ userId: moodCheckIns.userId, count: count() })
    .from(moodCheckIns)
    .where(inArray(moodCheckIns.userId, studentIds))
    .groupBy(moodCheckIns.userId);

  const checkInCountMap = new Map(
    checkInCounts.map((r) => [r.userId, r.count]),
  );

  const conversationCounts = await db.admin
    .select({ userId: chatSessions.userId, count: count() })
    .from(chatSessions)
    .where(inArray(chatSessions.userId, studentIds))
    .groupBy(chatSessions.userId);

  const conversationCountMap = new Map(
    conversationCounts.map((r) => [r.userId, r.count]),
  );

  const supportCounts = await db.admin
    .select({
      studentId: wellnessCoachHandoffs.studentId,
      count: count(),
    })
    .from(wellnessCoachHandoffs)
    .where(inArray(wellnessCoachHandoffs.studentId, studentIds))
    .groupBy(wellnessCoachHandoffs.studentId);

  const supportCountMap = new Map(
    supportCounts.map((r) => [r.studentId, r.count]),
  );

  const contactRows = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        inArray(emergencyContacts.studentId, studentIds),
        isNull(emergencyContacts.deletedAt),
        eq(emergencyContacts.tag, "primary"),
      ),
    );

  const contactMap = new Map(contactRows.map((r) => [r.studentId!, r]));

  const csvRows = rows.map(({ user, profile }) => {
    const id = user.id;
    const school = schoolMap.get(id);
    const mh = mentalHealthMap.get(id);

    const values: string[] = [
      getUserFullName(user),
      profile.grade != null ? String(profile.grade) : "",
      safetyRiskMap.get(id) ? formatLabel(safetyRiskMap.get(id)!) : "",
      mh?.anxiety?.severity ?? "",
      mh?.depression?.severity ?? "",
      formatDate(checkInMap.get(id) ?? null),
      user.email ?? "",
      formatDate(profile.dateOfBirth),
      formatLabel(profile.gender),
      profile.pronouns ?? "",
      formatLabel(profile.ethnicity),
      formatLabel(profile.language),
      profile.homeAddress ?? "",
      profile.studentCode ?? "",
      formatLabel(profile.accountStatus),
      school?.schoolName ?? "",
      school?.districtCode ?? "",
      profile.interests.join("; "),
      profile.learningStyles.join("; "),
      profile.goals.join("; "),
      formatDate(profile.lastActiveAt),
      formatDate(profile.onboardingCompletedAt),
      formatDate(profile.createdAt),
      String(alertCountMap.get(id) ?? 0),
      String(checkInCountMap.get(id) ?? 0),
      String(conversationCountMap.get(id) ?? 0),
      String(supportCountMap.get(id) ?? 0),
      contactMap.get(id)?.name ?? "",
      contactMap.get(id)?.relation ?? "",
      contactMap.get(id)?.primaryPhone ?? "",
      contactMap.get(id)?.primaryEmail ?? "",
    ];

    return values.map(escapeCsvField).join(",");
  });

  return [CSV_HEADERS.join(","), ...csvRows].join("\n");
}
