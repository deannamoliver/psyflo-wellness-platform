import { moodCheckIns } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";

// New mood scale: Great, Good, Okay, Not Great, Struggling
const MOOD_COLORS: Record<string, string> = {
  great: "bg-emerald-500",
  good: "bg-green-400",
  okay: "bg-amber-400",
  "not great": "bg-orange-500",
  struggling: "bg-red-500",
  // Legacy mappings for backward compatibility
  happy: "bg-emerald-500",
  excited: "bg-emerald-500",
  proud: "bg-green-400",
  calm: "bg-green-400",
  surprised: "bg-amber-400",
  sad: "bg-orange-500",
  worried: "bg-orange-500",
  lonely: "bg-orange-500",
  angry: "bg-red-500",
  afraid: "bg-red-500",
  disgusted: "bg-red-500",
  bad: "bg-red-500",
};

// Map legacy emotions to new scale for display
const MOOD_SCALE_MAP: Record<string, string> = {
  happy: "Great",
  excited: "Great",
  proud: "Good",
  calm: "Good",
  surprised: "Okay",
  sad: "Not Great",
  worried: "Not Great",
  lonely: "Not Great",
  angry: "Struggling",
  afraid: "Struggling",
  disgusted: "Struggling",
  bad: "Struggling",
  great: "Great",
  good: "Good",
  okay: "Okay",
  "not great": "Not Great",
  struggling: "Struggling",
};

type MoodCount = {
  emotion: string;
  count: number;
};

function MoodBar({
  emotion,
  count,
  maxCount,
}: {
  emotion: string;
  count: number;
  maxCount: number;
}) {
  const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const emotionLower = emotion.toLowerCase();
  const color = MOOD_COLORS[emotionLower] ?? "bg-gray-400";
  // Use mapped scale label if available, otherwise use original
  const displayLabel = MOOD_SCALE_MAP[emotionLower] ?? titleCase(emotion, { delimiter: "_" });

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-medium text-gray-700 text-xs">{count}</span>
      <div className="flex h-40 w-10 items-end">
        <div
          className={`w-full rounded-t ${color}`}
          style={{
            height: `${heightPercent}%`,
            minHeight: count > 0 ? "4px" : "0",
          }}
        />
      </div>
      <span className="max-w-14 truncate text-center text-gray-600 text-xs">
        {displayLabel}
      </span>
    </div>
  );
}

// Define the order for the new scale
const SCALE_ORDER = ["Great", "Good", "Okay", "Not Great", "Struggling"];

async function MoodTrendsData({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const moods = await db.admin
    .select({
      emotion: moodCheckIns.universalEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(100);

  // Aggregate by the new scale labels
  const scaleCounts: Record<string, number> = {
    "Great": 0,
    "Good": 0,
    "Okay": 0,
    "Not Great": 0,
    "Struggling": 0,
  };

  for (const m of moods) {
    if (m.emotion) {
      const scaleLabel = MOOD_SCALE_MAP[m.emotion.toLowerCase()] ?? "Okay";
      scaleCounts[scaleLabel] = (scaleCounts[scaleLabel] || 0) + 1;
    }
  }

  const moodCounts: MoodCount[] = SCALE_ORDER
    .map((label) => ({ emotion: label.toLowerCase(), count: scaleCounts[label] || 0 }))
    .filter((m) => m.count > 0);

  const maxCount = Math.max(...moodCounts.map((m) => m.count), 1);

  if (moodCounts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Muted>No mood data available.</Muted>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-around gap-2 pt-4">
      {moodCounts.map((mood) => (
        <MoodBar
          key={mood.emotion}
          emotion={mood.emotion}
          count={mood.count}
          maxCount={maxCount}
        />
      ))}
    </div>
  );
}

export function MoodTrendsChart({ studentId }: { studentId: string }) {
  return (
    <Card className="gap-3 bg-white font-dm shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="font-semibold text-base">Mood Trends</CardTitle>
          <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <Muted className="text-xs">
          Based on check-ins this billing period.
        </Muted>
      </CardHeader>
      <CardContent>
        <MoodTrendsData studentId={studentId} />
      </CardContent>
    </Card>
  );
}
