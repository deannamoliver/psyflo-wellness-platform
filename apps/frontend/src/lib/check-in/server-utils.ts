"server-only";

import { TZDate } from "@date-fns/tz";
import { moodCheckIns } from "@feelwell/database";
import { addDays, isBefore, set } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserTimezone } from "@/lib/user/server-utils";

export async function getLastCheckInTime(): Promise<Date | null> {
  const db = await serverDrizzle();
  return await db.admin
    .select({ createdAt: moodCheckIns.createdAt })
    .from(moodCheckIns)
    .orderBy(desc(moodCheckIns.createdAt))
    .where(eq(moodCheckIns.userId, db.userId()))
    .limit(1)
    .then((result) => result[0]?.createdAt ?? null);
}

export async function canCheckIn(): Promise<
  | {
      value: true;
      nextAvailableTime: null;
    }
  | {
      value: false;
      nextAvailableTime: Date;
    }
> {
  const [lastCheckInTime, userTimezone] = await Promise.all([
    getLastCheckInTime(),
    getUserTimezone(),
  ]);

  if (lastCheckInTime === null) {
    return {
      value: true,
      nextAvailableTime: null,
    };
  }

  const lastUserCheckIn = new TZDate(lastCheckInTime, userTimezone);
  const nowInUserTZ = new TZDate(new Date(), userTimezone);

  let resetTime = set(nowInUserTZ, {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  if (isBefore(nowInUserTZ, resetTime)) {
    resetTime = addDays(resetTime, -1);
  }

  if (lastUserCheckIn > resetTime) {
    const nextAvailableInUserTZ = addDays(resetTime, 1);

    const nextAvailableUTC = new Date(
      nextAvailableInUserTZ.withTimeZone("UTC"),
    );

    return {
      value: false,
      nextAvailableTime: nextAvailableUTC,
    };
  }

  return { value: true, nextAvailableTime: null };
}
