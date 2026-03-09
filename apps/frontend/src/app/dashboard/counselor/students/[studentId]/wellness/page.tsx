import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { MoodTrendsChart } from "./~lib/mood-trends-chart";
import { WellnessActivityClient } from "./~lib/wellness-activity-client";

function ChartFallback() {
  return <Skeleton className="h-[400px] w-full rounded-lg bg-white/50" />;
}

export default async function StudentWellnessPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      {/* Row 1: Self-Care Summary + Mood Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WellnessActivityClient studentId={studentId} showSummaryOnly />
        <Suspense fallback={<ChartFallback />}>
          <MoodTrendsChart studentId={studentId} />
        </Suspense>
      </div>

      {/* Row 2: Journaling, Breathing, Meditation */}
      <WellnessActivityClient studentId={studentId} showActivitiesOnly />
    </div>
  );
}
