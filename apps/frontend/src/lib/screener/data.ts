"server-only";

import { TZDate } from "@date-fns/tz";
import {
  screenerSessionResponses,
  screenerSessions,
  screeners,
} from "@feelwell/database";
import { endOfDay, startOfDay } from "date-fns";
import { and, asc, eq, gte, isNotNull, isNull, lte } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserTimezone } from "@/lib/user/server-utils";

export async function getOngoingResponses({
  studentId,
}: {
  studentId: string;
}): Promise<
  {
    id: string;
    questionCode: string;
    answerCode: string | null;
    startAt: Date;
  }[]
> {
  const db = await serverDrizzle();

  return await db.admin
    .select({
      id: screenerSessionResponses.id,
      questionCode: screenerSessionResponses.questionCode,
      answerCode: screenerSessionResponses.answerCode,
      startAt: screenerSessions.startAt,
    })
    .from(screeners)
    .innerJoin(screenerSessions, eq(screeners.id, screenerSessions.screenerId))
    .innerJoin(
      screenerSessionResponses,
      eq(screenerSessions.id, screenerSessionResponses.sessionId),
    )
    .where(
      and(
        eq(screeners.userId, studentId),
        lte(screenerSessions.startAt, new Date()),
        isNull(screenerSessions.completedAt),
      ),
    )
    .orderBy(
      asc(screenerSessions.startAt),
      asc(screenerSessions.part),
      asc(screenerSessions.subtype),
      asc(screeners.type),
      asc(screenerSessionResponses.ordinal),
    );
}

export async function getCurrUserOngoingResponses() {
  const db = await serverDrizzle();
  return await getOngoingResponses({ studentId: db.userId() });
}

/** Returns true if the current user completed any screener session today (in their timezone). */
export async function didCompleteWellnessCheckToday(): Promise<boolean> {
  const db = await serverDrizzle();
  const userTimezone = await getUserTimezone();
  const now = new TZDate(new Date(), userTimezone);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const result = await db.admin
    .select({ id: screenerSessions.id })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .where(
      and(
        eq(screeners.userId, db.userId()),
        isNotNull(screenerSessions.completedAt),
        gte(screenerSessions.completedAt, todayStart),
        lte(screenerSessions.completedAt, todayEnd),
      ),
    )
    .limit(1);

  return result.length > 0;
}
