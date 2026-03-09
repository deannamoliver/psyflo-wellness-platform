import { moodCheckIns } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { MoodCalendarClient } from "./mood-calendar-client";

export async function MoodCalendar({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const checkInData = await db.admin
    .select({
      id: moodCheckIns.id,
      date: moodCheckIns.createdAt,
      mood: moodCheckIns.universalEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(50);

  const moodData = checkInData
    .map((item) =>
      item.mood == null
        ? null
        : {
            id: item.id,
            date: item.date,
            mood: item.mood,
          },
    )
    .filter((item) => item !== null);

  return <MoodCalendarClient moodData={moodData} />;
}
