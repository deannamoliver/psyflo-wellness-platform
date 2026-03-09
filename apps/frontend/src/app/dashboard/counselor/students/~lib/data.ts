"server-only";

import {
  alerts,
  coachSafetyReports,
  moodCheckIns,
  profiles,
  screenerAlerts,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, desc, eq, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { RiskLevel } from "@/lib/screener/type";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";
import {
  determineRiskLevel,
  getHighestRiskLevel,
  type SafetyRiskLevel,
} from "@/lib/student-alerts/safety-types";
import { getUserFullName } from "@/lib/user/utils";

export type MentalHealthIndicator = {
  category: "anxiety" | "depression";
  severity: string;
  riskLevel: RiskLevel;
};

export type StudentRow = {
  id: string;
  name: string;
  grade: number | null;
  safetyRisk: SafetyRiskLevel | null;
  mentalHealth: MentalHealthIndicator[];
  lastCheckIn: string | null;
};

/** Threshold: risk level >= 2 means "Mild" or above (warrants attention). */
const RISK_THRESHOLD: RiskLevel = 2;

export async function fetchAllStudents(): Promise<StudentRow[] | null> {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const counselorSchoolId = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(eq(userSchools.userId, counselorId))
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!counselorSchoolId) return null;

  const students = await db.admin
    .select({
      user: users,
      profile: profiles,
    })
    .from(profiles)
    .innerJoin(userSchools, eq(profiles.id, userSchools.userId))
    .innerJoin(users, eq(profiles.id, users.id))
    .where(
      and(
        eq(userSchools.schoolId, counselorSchoolId),
        eq(userSchools.role, "student"),
      ),
    );

  const studentIds = students.map((s) => s.user.id);

  // Fetch last check-ins
  const lastCheckIns =
    studentIds.length > 0
      ? await db.admin
          .select({
            userId: moodCheckIns.userId,
            lastCheckIn: sql<string>`MAX(${moodCheckIns.createdAt})`,
          })
          .from(moodCheckIns)
          .where(inArray(moodCheckIns.userId, studentIds))
          .groupBy(moodCheckIns.userId)
      : [];

  // Fetch latest completed screener per student per type
  const latestScreeners =
    studentIds.length > 0
      ? await db.admin
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
          .orderBy(
            screeners.userId,
            screeners.type,
            desc(screeners.completedAt),
          )
      : [];

  // Build mental health indicators per student
  const mentalHealthMap = new Map<string, MentalHealthIndicator[]>();

  for (const s of latestScreeners) {
    const category: "anxiety" | "depression" | null =
      s.type === "phq_9" || s.type === "phq_a"
        ? "depression"
        : s.type === "gad_7" || s.type === "gad_child"
          ? "anxiety"
          : null;

    if (!category) continue;

    const riskLevel = getRiskLevel({ type: s.type, score: Number(s.score) });

    // Only include if above threshold (Mild or above)
    if (riskLevel < RISK_THRESHOLD) continue;

    const severity = getRiskLevelTitle({ type: s.type, riskLevel });
    if (!severity) continue;

    if (!mentalHealthMap.has(s.userId)) {
      mentalHealthMap.set(s.userId, []);
    }

    const indicators = mentalHealthMap.get(s.userId)!;
    // Only keep one indicator per category (most recent due to query ordering)
    if (!indicators.some((i) => i.category === category)) {
      indicators.push({ category, severity, riskLevel });
    }
  }

  // Fetch unresolved safety alerts per student: all coach alerts + screener alerts with type 'safety'
  const safetyAlertRows =
    studentIds.length > 0
      ? await db.admin
          .select({
            studentId: alerts.studentId,
            source: alerts.source,
            screenerType: screeners.type,
            coachReportRiskLevel: coachSafetyReports.riskLevel,
          })
          .from(alerts)
          .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
          .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
          .leftJoin(
            coachSafetyReports,
            eq(alerts.id, coachSafetyReports.alertId),
          )
          .where(
            and(
              inArray(alerts.studentId, studentIds),
              ne(alerts.status, "resolved"),
              or(
                eq(alerts.source, "coach"),
                and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
              ),
            ),
          )
      : [];

  // Build highest safety risk per student
  const safetyRiskMap = new Map<string, SafetyRiskLevel>();
  for (const a of safetyAlertRows) {
    const coachLevel =
      a.coachReportRiskLevel != null
        ? (a.coachReportRiskLevel as SafetyRiskLevel)
        : null;
    const level = determineRiskLevel(a.source, a.screenerType, coachLevel);
    const current = safetyRiskMap.get(a.studentId);
    if (!current) {
      safetyRiskMap.set(a.studentId, level);
    } else {
      safetyRiskMap.set(a.studentId, getHighestRiskLevel([current, level]));
    }
  }

  return students.map(({ user, profile }) => ({
    id: user.id,
    name: getUserFullName(user),
    grade: profile.grade,
    safetyRisk: safetyRiskMap.get(user.id) ?? null,
    mentalHealth: mentalHealthMap.get(user.id) ?? [],
    lastCheckIn:
      lastCheckIns.find(({ userId }) => userId === user.id)?.lastCheckIn ??
      null,
  }));
}
