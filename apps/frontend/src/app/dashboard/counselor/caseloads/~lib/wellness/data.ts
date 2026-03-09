import { moodCheckIns, profiles, userSchools, users } from "@feelwell/database";
import { startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import type { inferParserType } from "nuqs/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getTimeZone } from "@/lib/time-server-utils";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import type { searchParamsParsers } from "../parsers";

function orderBy(sParams: inferParserType<typeof searchParamsParsers>) {
  switch (sParams.sortBy) {
    case "newest-first":
      return desc(moodCheckIns.createdAt);
    case "oldest-first":
      return asc(moodCheckIns.createdAt);
    case "student-name-a-z":
      return asc(sql`(users.raw_user_meta_data->>'first_name')`);
    case "grade-low-high":
      return asc(profiles.grade);
    default:
      return desc(moodCheckIns.createdAt);
  }
}

async function getClientStartOfDay() {
  const timezone = await getTimeZone();
  const clientNow = toZonedTime(new Date(), timezone);
  return fromZonedTime(startOfDay(clientNow), timezone);
}

export async function getStudents(
  schoolId: string,
  sParams: inferParserType<typeof searchParamsParsers>,
) {
  const db = await serverDrizzle();
  const createdAt = await getClientStartOfDay();

  return await db.admin
    .select({
      id: users.id,
      metaData: users.rawUserMetaData,
      grade: profiles.grade,
      universalEmotion: moodCheckIns.universalEmotion,
      specificEmotion: moodCheckIns.specificEmotion,
      createdAt: moodCheckIns.createdAt,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .innerJoin(moodCheckIns, eq(users.id, moodCheckIns.userId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(moodCheckIns.universalEmotion),
        gte(moodCheckIns.createdAt, createdAt),
        sParams.gradeLevel !== null
          ? eq(profiles.grade, sParams.gradeLevel)
          : undefined,
      ),
    )
    .orderBy(orderBy(sParams))
    .then((res) =>
      res.map((student) => ({
        id: student.id,
        name: getUserFullNameFromMetaData(student.metaData),
        grade: student.grade,
        avatar: null,
        universalEmotion: student.universalEmotion,
        actionAt: student.createdAt,
      })),
    );
}

export async function getUniversalEmotionAggregates(
  schoolId: string,
  sParams: inferParserType<typeof searchParamsParsers>,
) {
  const db = await serverDrizzle();
  const createdAt = await getClientStartOfDay();

  const results = await db.admin
    .select({
      emotion: moodCheckIns.universalEmotion,
      count: sql<number>`count(distinct ${moodCheckIns.userId})::int`,
    })
    .from(moodCheckIns)
    .innerJoin(userSchools, eq(moodCheckIns.userId, userSchools.userId))
    .innerJoin(profiles, eq(moodCheckIns.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(moodCheckIns.universalEmotion),
        gte(moodCheckIns.createdAt, createdAt),
        sParams.gradeLevel !== null
          ? eq(profiles.grade, sParams.gradeLevel)
          : undefined,
      ),
    )
    .orderBy(desc(sql<number>`count(distinct ${moodCheckIns.userId})::int`))
    .groupBy(moodCheckIns.universalEmotion);

  return results.filter((result) => result.emotion !== null) as Array<{
    emotion: string;
    count: number;
  }>;
}

export async function getSpecificEmotionAggregates(
  schoolId: string,
  sParams: inferParserType<typeof searchParamsParsers>,
) {
  const db = await serverDrizzle();
  const createdAt = await getClientStartOfDay();

  const results = await db.admin
    .select({
      emotion: moodCheckIns.specificEmotion,
      count: sql<number>`count(distinct ${moodCheckIns.userId})::int`,
    })
    .from(moodCheckIns)
    .innerJoin(userSchools, eq(moodCheckIns.userId, userSchools.userId))
    .innerJoin(profiles, eq(moodCheckIns.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(moodCheckIns.specificEmotion),
        gte(moodCheckIns.createdAt, createdAt),
        sParams.gradeLevel !== null
          ? eq(profiles.grade, sParams.gradeLevel)
          : undefined,
      ),
    )
    .orderBy(desc(sql<number>`count(distinct ${moodCheckIns.userId})::int`))
    .groupBy(moodCheckIns.specificEmotion);

  return results.filter((result) => result.emotion !== null) as Array<{
    emotion: string;
    count: number;
  }>;
}
