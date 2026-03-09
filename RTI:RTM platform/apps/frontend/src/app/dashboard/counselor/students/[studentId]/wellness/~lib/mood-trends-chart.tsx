import { moodCheckIns } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";

const MOOD_COLORS: Record<string, string> = {
  happy: "bg-yellow-400",
  sad: "bg-blue-500",
  calm: "bg-green-400",
  excited: "bg-green-600",
  proud: "bg-red-500",
  angry: "bg-pink-500",
  worried: "bg-blue-400",
  lonely: "bg-red-400",
  afraid: "bg-orange-500",
  disgusted: "bg-yellow-600",
  surprised: "bg-purple-500",
  bad: "bg-gray-500",
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
  const color = MOOD_COLORS[emotion.toLowerCase()] ?? "bg-gray-400";

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
      <span className="max-w-12 truncate text-center text-gray-600 text-xs">
        {titleCase(emotion, { delimiter: "_" })}
      </span>
    </div>
  );
}

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

  const counts: Record<string, number> = {};
  for (const m of moods) {
    if (m.emotion) {
      counts[m.emotion] = (counts[m.emotion] || 0) + 1;
    }
  }

  const moodCounts: MoodCount[] = Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

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
          Based on student self-reported check-ins.
        </Muted>
      </CardHeader>
      <CardContent>
        <MoodTrendsData studentId={studentId} />
      </CardContent>
    </Card>
  );
}
