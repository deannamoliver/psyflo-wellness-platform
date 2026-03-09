import { moodCheckIns } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { EmotionTimelineChartClient } from "./emotion-timeline-chart-client";

export async function EmotionTimelineChart({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  // Get total count of check-ins
  const totalCountResult = await db.admin
    .select({
      count: moodCheckIns.id,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId));

  const totalCount = totalCountResult.length;

  const checkInData = await db.admin
    .select({
      id: moodCheckIns.id,
      date: moodCheckIns.createdAt,
      emotion: moodCheckIns.universalEmotion,
      specificEmotion: moodCheckIns.specificEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(30);

  const emotionData = checkInData
    .filter(
      (item): item is typeof item & { emotion: string } =>
        item.emotion !== null,
    )
    .map((item) => ({
      id: item.id,
      date: item.date,
      emotion: item.emotion,
      specificEmotion: item.specificEmotion,
    }));

  if (emotionData.length === 0) {
    return null;
  }

  return (
    <EmotionTimelineChartClient
      emotionData={emotionData}
      totalCount={totalCount}
    />
  );
}
