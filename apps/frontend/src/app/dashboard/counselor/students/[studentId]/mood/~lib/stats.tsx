import { moodCheckIns } from "@feelwell/database";
import { formatDistanceToNow } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { CalendarIcon, SmileIcon } from "lucide-react";
import { Suspense } from "react";
import { StatsCard } from "@/lib/analytics/stats-card";
import { serverDrizzle } from "@/lib/database/drizzle";

function titleCaseEmotion(emotion: string): string {
  return emotion
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Get color class for each emotion to match the chart
function getEmotionColorClass(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case "happy":
      return "text-green-500";
    case "surprised":
      return "text-purple-500";
    case "disgusted":
      return "text-yellow-500";
    case "afraid":
      return "text-orange-500";
    case "angry":
      return "text-red-500";
    case "sad":
      return "text-blue-500";
    case "bad":
      return "text-gray-500";
    default:
      return "text-muted-foreground";
  }
}

function Fallback() {
  return (
    <div className="h-24 w-full animate-pulse rounded-lg border bg-muted" />
  );
}

async function CurrentMood({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const latestMood = await db.admin
    .select({
      universalEmotion: moodCheckIns.universalEmotion,
      createdAt: moodCheckIns.createdAt,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(1);

  const currentMoodEmotion = latestMood[0]?.universalEmotion;
  const currentMood = currentMoodEmotion
    ? titleCaseEmotion(currentMoodEmotion)
    : "No data";
  const currentMoodDate = latestMood[0]?.createdAt || new Date();
  const colorClass = currentMoodEmotion
    ? getEmotionColorClass(currentMoodEmotion)
    : "text-muted-foreground";

  return (
    <StatsCard
      title="Most Recent Mood"
      icon={
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <SmileIcon className="h-4 w-4" />
        </span>
      }
      value={currentMood}
      valueClassName={colorClass}
      change={3}
      increaseSentiment="neutral"
      message={`${formatDistanceToNow(currentMoodDate)} ago`}
    />
  );
}

async function CheckIns({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const checkInsCount = await db.admin
    .select({ count: moodCheckIns.id })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .then((result) => result.length);

  return (
    <StatsCard
      title="Check-Ins"
      icon={
        <span className="rounded-lg bg-destructive/10 p-2 text-destructive">
          <CalendarIcon className="h-4 w-4" />
        </span>
      }
      value={checkInsCount.toString()}
      change={3}
      increaseSentiment="neutral"
      message=" "
    />
  );
}

async function MostCommonMood({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  // Get the last 30 check-ins to match the chart
  const recentCheckIns = await db.admin
    .select({
      emotion: moodCheckIns.universalEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(30);

  // Count frequency of each emotion in the last 30 check-ins
  const emotionCounts = recentCheckIns.reduce(
    (acc, checkIn) => {
      if (checkIn.emotion) {
        acc[checkIn.emotion] = (acc[checkIn.emotion] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find the most common emotion
  const mostCommonEntry = Object.entries(emotionCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const mostCommonEmotion = mostCommonEntry ? mostCommonEntry[0] : null;
  const mostCommonMood = mostCommonEmotion
    ? titleCaseEmotion(mostCommonEmotion)
    : "No data";

  const totalRecentCheckIns = recentCheckIns.length;
  const message =
    totalRecentCheckIns > 0
      ? `Of last ${totalRecentCheckIns} check-in${totalRecentCheckIns !== 1 ? "s" : ""}`
      : " ";

  const colorClass = mostCommonEmotion
    ? getEmotionColorClass(mostCommonEmotion)
    : "text-muted-foreground";

  return (
    <StatsCard
      title="Most Common Mood"
      icon={
        <span className="rounded-lg bg-success/10 p-2 text-success">
          <SmileIcon className="h-4 w-4" />
        </span>
      }
      value={mostCommonMood}
      valueClassName={colorClass}
      change={5}
      increaseSentiment="good"
      message={message}
    />
  );
}

export function Stats({ studentId }: { studentId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Suspense fallback={<Fallback />}>
        <CurrentMood studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <MostCommonMood studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <CheckIns studentId={studentId} />
      </Suspense>
    </div>
  );
}
