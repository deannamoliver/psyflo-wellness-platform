import { moodCheckIns } from "@feelwell/database";
import { subDays } from "date-fns";
import { and, eq, gt, sql } from "drizzle-orm";
import { CalendarIcon } from "lucide-react";
import { Suspense } from "react";
import { StatsCard } from "@/lib/analytics/stats-card";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";

async function ActiveDays({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const value = await db.admin
    .select({
      activeDays: sql<number>`count(distinct date(${moodCheckIns.createdAt}))`,
    })
    .from(moodCheckIns)
    .where(
      and(
        eq(moodCheckIns.userId, studentId),
        gt(moodCheckIns.createdAt, subDays(new Date(), 30)),
      ),
    )
    .then((result) => result[0]?.activeDays ?? 0);

  return (
    <StatsCard
      title="Active Days"
      icon={
        <span className="rounded-lg bg-destructive/10 p-2 text-destructive">
          <CalendarIcon className="h-4 w-4" />
        </span>
      }
      value={value.toString()}
      increaseSentiment="neutral"
      message="Past 30 days"
      tooltip="Days where the student completed at least one mood check-in"
    />
  );
}

function Fallback() {
  return <Skeleton className="h-36 w-full border bg-white/50 shadow-sm" />;
}

export function Stats({ studentId }: { studentId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
      <Suspense fallback={<Fallback />}>
        <ActiveDays studentId={studentId} />
      </Suspense>
    </div>
  );
}
