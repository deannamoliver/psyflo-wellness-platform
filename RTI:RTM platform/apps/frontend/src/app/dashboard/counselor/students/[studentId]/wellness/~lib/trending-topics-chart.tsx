import { wellnessCoachHandoffs } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";

const TOPIC_COLORS: Record<string, string> = {
  anxiety: "bg-yellow-400",
  relationships: "bg-blue-700",
  friendships: "bg-green-500",
  family: "bg-pink-500",
  "test taking": "bg-cyan-500",
  academic: "bg-indigo-500",
  bullying: "bg-red-500",
  depression: "bg-purple-500",
  stress: "bg-orange-500",
};

type TopicCount = {
  topic: string;
  count: number;
};

function TopicBar({
  topic,
  count,
  maxCount,
}: {
  topic: string;
  count: number;
  maxCount: number;
}) {
  const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const color = TOPIC_COLORS[topic.toLowerCase()] ?? "bg-gray-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-medium text-gray-700 text-xs">{count}</span>
      <div className="flex h-40 w-12 items-end">
        <div
          className={`w-full rounded-t ${color}`}
          style={{
            height: `${heightPercent}%`,
            minHeight: count > 0 ? "4px" : "0",
          }}
        />
      </div>
      <span className="max-w-14 truncate text-center text-gray-600 text-xs">
        {titleCase(topic, { delimiter: "_" })}
      </span>
    </div>
  );
}

export async function TrendingTopicsChart({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  const handoffs = await db.admin
    .select({ topic: wellnessCoachHandoffs.topic })
    .from(wellnessCoachHandoffs)
    .where(eq(wellnessCoachHandoffs.studentId, studentId));

  const counts: Record<string, number> = {};
  for (const h of handoffs) {
    if (h.topic) {
      const normalized = h.topic.toLowerCase().trim();
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }

  const topicCounts: TopicCount[] = Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const maxCount = Math.max(...topicCounts.map((t) => t.count), 1);

  return (
    <Card className="gap-3 bg-white font-dm shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="font-semibold text-base">
            Trending Topics
          </CardTitle>
          <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <Muted className="text-xs">
          Based on student self-selected chat topics
        </Muted>
      </CardHeader>
      <CardContent>
        {topicCounts.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <Muted>No topic data available.</Muted>
          </div>
        ) : (
          <div className="flex items-end justify-around gap-2 pt-4">
            {topicCounts.map((topic) => (
              <TopicBar
                key={topic.topic}
                topic={topic.topic}
                count={topic.count}
                maxCount={maxCount}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
