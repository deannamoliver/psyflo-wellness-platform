import {
  profiles,
  screeners,
  type screenerTypeEnum,
  userSchools,
  users,
} from "@feelwell/database";
import { subYears } from "date-fns";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

// ── Chart time-series types ──────────────────────────────────────────

export type AssessmentTimeSeriesRow = {
  period: string;
  screenerType: ScreenerType;
  grade: number | null;
  avgPct: number;
  count: number;
};

// ── Table row types ──────────────────────────────────────────────────

export type AssessmentTableRow = {
  screenerId: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  grade: number | null;
  screenerType: ScreenerType;
  assessmentLabel: string;
  score: number;
  maxScore: number;
  severityLabel: string;
  change: number | null; // score change vs previous of same type
  completedAt: Date;
};

function getAssessmentLabel(type: ScreenerType): string {
  switch (type) {
    case "phq_9":
      return "PHQ-9";
    case "phq_a":
      return "PHQ-A";
    case "gad_7":
      return "GAD-7";
    case "gad_child":
      return "GAD-7, Child";
    case "sel":
      return "SEL";
  }
}

// ── Time series data ─────────────────────────────────────────────────

export async function getAssessmentTrendsTimeSeries(
  schoolId: string,
): Promise<AssessmentTimeSeriesRow[]> {
  const db = await serverDrizzle();
  const oneYearAgo = subYears(new Date(), 1);

  const rows = await db.admin
    .select({
      period: sql<string>`date_trunc('day', ${screeners.completedAt})::date::text`,
      screenerType: screeners.type,
      grade: profiles.grade,
      avgScore: sql<number>`avg(${screeners.score})::real`,
      avgMaxScore: sql<number>`avg(${screeners.maxScore})::real`,
      count: sql<number>`count(*)::int`,
    })
    .from(screeners)
    .innerJoin(userSchools, eq(screeners.userId, userSchools.userId))
    .innerJoin(profiles, eq(screeners.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(screeners.completedAt),
        gte(screeners.completedAt, oneYearAgo),
        sql`${screeners.type} != 'sel'`,
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${screeners.completedAt})::date`,
      screeners.type,
      profiles.grade,
    );

  return rows.map((r) => ({
    period: r.period,
    screenerType: r.screenerType as ScreenerType,
    grade: r.grade,
    avgPct:
      r.avgMaxScore > 0 ? Math.round((r.avgScore / r.avgMaxScore) * 100) : 0,
    count: r.count,
  }));
}

// ── Table data ───────────────────────────────────────────────────────

export async function getAssessmentTableData(
  schoolId: string,
): Promise<AssessmentTableRow[]> {
  const db = await serverDrizzle();

  // Fetch all completed screeners for this school (excluding SEL)
  const rows = await db.admin
    .select({
      screenerId: screeners.id,
      userId: screeners.userId,
      type: screeners.type,
      score: screeners.score,
      maxScore: screeners.maxScore,
      lastScore: screeners.lastScore,
      completedAt: screeners.completedAt,
      rawUserMetaData: users.rawUserMetaData,
      grade: profiles.grade,
    })
    .from(screeners)
    .innerJoin(users, eq(screeners.userId, users.id))
    .innerJoin(
      userSchools,
      and(
        eq(screeners.userId, userSchools.userId),
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
      ),
    )
    .innerJoin(profiles, eq(screeners.userId, profiles.id))
    .where(
      and(isNotNull(screeners.completedAt), sql`${screeners.type} != 'sel'`),
    )
    .orderBy(desc(screeners.completedAt));

  return rows.map((row) => {
    const type = row.type as ScreenerType;
    const riskLevel = getRiskLevel({ type, score: row.score });
    const severityLabel = getRiskLevelTitle({ type, riskLevel }) ?? "Unknown";

    const change =
      row.lastScore != null ? Math.round(row.score - row.lastScore) : null;

    return {
      screenerId: row.screenerId,
      studentId: row.userId,
      studentName: getUserFullNameFromMetaData(row.rawUserMetaData),
      studentCode: `ST-${row.userId.slice(-4).toUpperCase()}`,
      grade: row.grade,
      screenerType: type,
      assessmentLabel: getAssessmentLabel(type),
      score: row.score,
      maxScore: row.maxScore,
      severityLabel,
      change,
      completedAt: row.completedAt!,
    };
  });
}
