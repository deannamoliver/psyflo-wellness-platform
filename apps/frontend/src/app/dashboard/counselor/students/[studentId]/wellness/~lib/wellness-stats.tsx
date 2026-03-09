import { moodCheckIns } from "@feelwell/database";
import { desc, eq, sql } from "drizzle-orm";
import {
  CalendarDaysIcon,
  CalendarIcon,
  SmileIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { H2 } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";

function StatCard({
  title,
  icon,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <Card className="gap-2 bg-white py-3 font-dm shadow-sm">
      <CardHeader className="flex items-center justify-between pb-0">
        <CardTitle className="font-normal text-gray-500 text-sm">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-0">
        <H2 className="font-semibold text-xl">{value}</H2>
      </CardContent>
    </Card>
  );
}

async function TodaysMood({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const latest = await db.admin
    .select({ emotion: moodCheckIns.universalEmotion })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(1)
    .then((res) => res[0]?.emotion ?? null);

  return (
    <StatCard
      title="Today's Mood"
      icon={<SmileIcon className="h-5 w-5 text-green-500" />}
      value={latest ? titleCase(latest, { delimiter: "_" }) : "-"}
    />
  );
}

async function MostCommonMood({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const moods = await db.admin
    .select({ emotion: moodCheckIns.universalEmotion })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(30);

  const counts: Record<string, number> = {};
  for (const m of moods) {
    if (m.emotion) counts[m.emotion] = (counts[m.emotion] || 0) + 1;
  }
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];

  return (
    <StatCard
      title="Most Common Mood"
      icon={<TrendingUpIcon className="h-5 w-5 text-indigo-500" />}
      value={top ? titleCase(top[0], { delimiter: "_" }) : "-"}
    />
  );
}

async function TotalCheckIns({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: sql<number>`count(*)` })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCard
      title="Total Check-Ins"
      icon={<CalendarIcon className="h-5 w-5 text-purple-500" />}
      value={result.toString()}
    />
  );
}

async function LongestStreak({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const dates = await db.admin
    .select({
      date: sql<string>`date(${moodCheckIns.createdAt})`,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(sql`date(${moodCheckIns.createdAt})`);

  const uniqueDates = [...new Set(dates.map((d) => d.date))];
  let maxStreak = 0;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]!);
    const curr = new Date(uniqueDates[i]!);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current++;
    } else {
      maxStreak = Math.max(maxStreak, current);
      current = 1;
    }
  }
  maxStreak = Math.max(maxStreak, current);

  return (
    <StatCard
      title="Longest Streak"
      icon={<CalendarDaysIcon className="h-5 w-5 text-blue-500" />}
      value={uniqueDates.length > 0 ? maxStreak.toString() : "0"}
    />
  );
}

function Fallback() {
  return <Skeleton className="h-24 flex-1 bg-white/50" />;
}

export function WellnessStats({ studentId }: { studentId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Suspense fallback={<Fallback />}>
        <TodaysMood studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <MostCommonMood studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <TotalCheckIns studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <LongestStreak studentId={studentId} />
      </Suspense>
    </div>
  );
}
