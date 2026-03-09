"server-only";

import { TZDate } from "@date-fns/tz";
import { moodCheckIns } from "@feelwell/database";
import { isSameDay, startOfDay, subDays } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserTimezone } from "@/lib/user/server-utils";

export async function getCheckInStreak() {
  const db = await serverDrizzle();

  // Limit query for performance - 100 recent check-ins should be enough for streak calc
  const checkIns = await db.admin
    .select({
      createdAt: moodCheckIns.createdAt,
    } as const)
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, db.userId()))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(100);

  if (checkIns.length === 0) return 0;

  const userTimezone = await getUserTimezone();

  const now = new Date();
  const localToday = startOfDay(new TZDate(now, userTimezone));

  const eventDates = Array.from(
    new Set(
      checkIns.map((ts) =>
        startOfDay(new TZDate(new Date(ts.createdAt), userTimezone)).getTime(),
      ),
    ),
  ).sort((a, b) => b - a);

  if (eventDates.length === 0) return 0;

  let streak = 0;
  const mostRecent = new Date(eventDates[0] ?? 0);

  // If most recent event is today, start from today, else from yesterday
  let checkDate = isSameDay(mostRecent, localToday)
    ? localToday
    : subDays(localToday, 1);

  for (const ts of eventDates) {
    const d = new Date(ts);

    if (isSameDay(d, checkDate)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (d < checkDate) {
      break;
    }
  }

  return streak;
}
