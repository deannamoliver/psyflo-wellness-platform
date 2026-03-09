/**
 * Server-side data fetching for the Skills (SEL) tab.
 *
 * Provides school-wide aggregated SEL data: subtype averages, per-question
 * averages, student-level scores, and time-series for the progress chart.
 */

import {
  profiles,
  screenerSessionResponses,
  screenerSessions,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { subYears } from "date-fns";
import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import { SEL_SUBTYPE_ORDER, toFourPointScale } from "./config";

export type {
  QuestionAverage,
  SkillsStudent,
  SkillsStudentTableRow,
  SkillsTimeSeriesRow,
  SubtypeAverage,
} from "./types";

import type {
  QuestionAverage,
  SkillsStudent,
  SkillsTimeSeriesRow,
  SubtypeAverage,
} from "./types";

const SEL_SUBTYPES = [...SEL_SUBTYPE_ORDER];

// ── 1. Subtype averages ──────────────────────────────────────────────

export async function getSubtypeAverages(
  schoolId: string,
  gradeLevel: number | null,
): Promise<SubtypeAverage[]> {
  const db = await serverDrizzle();
  const gl = gradeLevel;

  const rows = await db.admin
    .select({
      subtype: screenerSessions.subtype,
      totalScore: sql<number>`SUM(${screenerSessions.score})::real`,
      totalMaxScore: sql<number>`SUM(${screenerSessions.maxScore})::real`,
      studentCount: sql<number>`COUNT(DISTINCT ${users.id})::int`,
    })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .innerJoin(users, eq(screeners.userId, users.id))
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        inArray(screenerSessions.subtype, SEL_SUBTYPES),
        isNotNull(screenerSessions.completedAt),
        gl != null ? eq(profiles.grade, gl) : undefined,
      ),
    )
    .groupBy(screenerSessions.subtype);

  return rows.map((r) => ({
    subtype: r.subtype,
    avgScore: toFourPointScale(r.totalScore, r.totalMaxScore),
    studentCount: r.studentCount,
  }));
}

// ── 2. Question-level averages ───────────────────────────────────────

export async function getQuestionAverages(
  schoolId: string,
  gradeLevel: number | null,
): Promise<QuestionAverage[]> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      questionCode: screenerSessionResponses.questionCode,
      subtype: screenerSessions.subtype,
      avgScore: sql<number>`AVG(${screenerSessionResponses.answerCode}::numeric)::real`,
    })
    .from(screenerSessionResponses)
    .innerJoin(
      screenerSessions,
      eq(screenerSessionResponses.sessionId, screenerSessions.id),
    )
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .innerJoin(users, eq(screeners.userId, users.id))
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        inArray(screenerSessions.subtype, SEL_SUBTYPES),
        isNotNull(screenerSessions.completedAt),
        isNotNull(screenerSessionResponses.answerCode),
        gradeLevel != null ? eq(profiles.grade, gradeLevel) : undefined,
      ),
    )
    .groupBy(screenerSessionResponses.questionCode, screenerSessions.subtype);

  return rows.map((r) => ({
    questionCode: r.questionCode,
    subtype: r.subtype,
    avgScore: r.avgScore,
  }));
}

// ── 3. Student-level SEL scores ──────────────────────────────────────

export async function getStudentSelScores(
  schoolId: string,
  gradeLevel: number | null,
): Promise<SkillsStudent[]> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      id: users.id,
      rawUserMetaData: users.rawUserMetaData,
      grade: profiles.grade,
      totalScore: sql<number>`SUM(${screenerSessions.score})::real`,
      totalMaxScore: sql<number>`SUM(${screenerSessions.maxScore})::real`,
      latestCompletedAt: sql<Date>`MAX(${screeners.completedAt})`,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .innerJoin(
      screeners,
      and(eq(users.id, screeners.userId), isNotNull(screeners.completedAt)),
    )
    .innerJoin(
      screenerSessions,
      and(
        eq(screeners.id, screenerSessions.screenerId),
        inArray(screenerSessions.subtype, SEL_SUBTYPES),
        isNotNull(screenerSessions.completedAt),
      ),
    )
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        gradeLevel != null ? eq(profiles.grade, gradeLevel) : undefined,
      ),
    )
    .groupBy(users.id, users.rawUserMetaData, profiles.grade);

  return rows.map((r) => ({
    id: r.id,
    name: getUserFullNameFromMetaData(r.rawUserMetaData),
    grade: r.grade,
    avgScore: toFourPointScale(r.totalScore, r.totalMaxScore),
    completedAt: r.latestCompletedAt ?? new Date(),
  }));
}

// ── 4. Time series for progress chart ────────────────────────────────

export async function getSelTimeSeries(
  schoolId: string,
): Promise<SkillsTimeSeriesRow[]> {
  const db = await serverDrizzle();
  const oneYearAgo = subYears(new Date(), 1);

  const rows = await db.admin
    .select({
      period: sql<string>`date_trunc('day', ${screenerSessions.completedAt})::date::text`,
      subtype: screenerSessions.subtype,
      grade: profiles.grade,
      totalScore: sql<number>`SUM(${screenerSessions.score})::real`,
      totalMaxScore: sql<number>`SUM(${screenerSessions.maxScore})::real`,
      count: sql<number>`COUNT(DISTINCT ${users.id})::int`,
    })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .innerJoin(users, eq(screeners.userId, users.id))
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        inArray(screenerSessions.subtype, SEL_SUBTYPES),
        isNotNull(screenerSessions.completedAt),
        gte(screenerSessions.completedAt, oneYearAgo),
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${screenerSessions.completedAt})::date`,
      screenerSessions.subtype,
      profiles.grade,
    );

  return rows.map((r) => ({
    period: r.period,
    subtype: r.subtype,
    grade: r.grade,
    avgScore: toFourPointScale(r.totalScore, r.totalMaxScore),
    count: r.count,
  }));
}
