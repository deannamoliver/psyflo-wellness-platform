import { moodCheckIns, profiles, userSchools, users } from "@feelwell/database";
import { subYears } from "date-fns";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";

export type TimeSeriesRow = {
  period: string;
  emotion: string;
  grade: number | null;
  count: number;
};

export type StudentBreakdown = {
  id: string;
  name: string;
  grade: number | null;
  totalCheckIns: number;
  lastCheckInAt: Date;
  lastCheckInEmotion: string;
  emotionCounts: Record<string, number>;
};

export async function getMoodTrendsTimeSeries(
  schoolId: string,
): Promise<TimeSeriesRow[]> {
  const db = await serverDrizzle();
  const oneYearAgo = subYears(new Date(), 1);

  const rows = await db.admin
    .select({
      period: sql<string>`date_trunc('day', ${moodCheckIns.createdAt})::date::text`,
      emotion: moodCheckIns.universalEmotion,
      grade: profiles.grade,
      count: sql<number>`count(*)::int`,
    })
    .from(moodCheckIns)
    .innerJoin(userSchools, eq(moodCheckIns.userId, userSchools.userId))
    .innerJoin(profiles, eq(moodCheckIns.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(moodCheckIns.universalEmotion),
        gte(moodCheckIns.createdAt, oneYearAgo),
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${moodCheckIns.createdAt})::date`,
      moodCheckIns.universalEmotion,
      profiles.grade,
    );

  return rows
    .filter((r) => r.emotion !== null)
    .map((r) => ({
      period: r.period,
      emotion: r.emotion as string,
      grade: r.grade,
      count: r.count,
    }));
}

export async function getStudentMoodBreakdowns(
  schoolId: string,
): Promise<StudentBreakdown[]> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      userId: moodCheckIns.userId,
      metaData: users.rawUserMetaData,
      grade: profiles.grade,
      emotion: moodCheckIns.universalEmotion,
      createdAt: moodCheckIns.createdAt,
    })
    .from(moodCheckIns)
    .innerJoin(users, eq(moodCheckIns.userId, users.id))
    .innerJoin(userSchools, eq(moodCheckIns.userId, userSchools.userId))
    .innerJoin(profiles, eq(moodCheckIns.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(moodCheckIns.universalEmotion),
      ),
    )
    .orderBy(desc(moodCheckIns.createdAt));

  const studentMap = new Map<string, StudentBreakdown>();

  for (const row of rows) {
    if (!row.emotion) continue;

    let student = studentMap.get(row.userId);
    if (!student) {
      student = {
        id: row.userId,
        name: getUserFullNameFromMetaData(row.metaData),
        grade: row.grade,
        totalCheckIns: 0,
        lastCheckInAt: row.createdAt!,
        lastCheckInEmotion: row.emotion,
        emotionCounts: {},
      };
      studentMap.set(row.userId, student);
    }

    student.totalCheckIns++;
    student.emotionCounts[row.emotion] =
      (student.emotionCounts[row.emotion] ?? 0) + 1;
  }

  return Array.from(studentMap.values());
}
