/**
 * Server-side data fetching: per-student subtype breakdown for the skills table.
 */

import {
  profiles,
  screenerSessions,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import { SEL_SUBTYPE_ORDER, toFourPointScale } from "./config";
import type { SkillsStudentTableRow } from "./types";

const SEL_SUBTYPES = [...SEL_SUBTYPE_ORDER];

export async function getStudentTableData(
  schoolId: string,
): Promise<SkillsStudentTableRow[]> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      studentId: users.id,
      rawUserMetaData: users.rawUserMetaData,
      grade: profiles.grade,
      subtype: screenerSessions.subtype,
      totalScore: sql<number>`SUM(${screenerSessions.score})::real`,
      totalMaxScore: sql<number>`SUM(${screenerSessions.maxScore})::real`,
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
      and(eq(userSchools.schoolId, schoolId), eq(userSchools.role, "student")),
    )
    .groupBy(
      users.id,
      users.rawUserMetaData,
      profiles.grade,
      screenerSessions.subtype,
    );

  // Pivot: group by student, collect subtype scores
  const studentMap = new Map<
    string,
    {
      name: string;
      grade: number | null;
      subtypeScores: Record<string, number>;
      totalScore: number;
      totalMaxScore: number;
    }
  >();

  for (const r of rows) {
    const existing = studentMap.get(r.studentId) ?? {
      name: getUserFullNameFromMetaData(r.rawUserMetaData),
      grade: r.grade,
      subtypeScores: {},
      totalScore: 0,
      totalMaxScore: 0,
    };
    existing.subtypeScores[r.subtype] = toFourPointScale(
      r.totalScore,
      r.totalMaxScore,
    );
    existing.totalScore += r.totalScore;
    existing.totalMaxScore += r.totalMaxScore;
    studentMap.set(r.studentId, existing);
  }

  return Array.from(studentMap.entries()).map(([studentId, data]) => ({
    studentId,
    studentName: data.name,
    grade: data.grade,
    subtypeScores: data.subtypeScores,
    overallScore: toFourPointScale(data.totalScore, data.totalMaxScore),
  }));
}
