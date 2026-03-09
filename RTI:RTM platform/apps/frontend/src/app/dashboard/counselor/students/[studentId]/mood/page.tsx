import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { EmotionTimelineChart } from "./~lib/emotion-timeline-chart";
import { Stats } from "./~lib/stats";

function ChartFallback() {
  return <Skeleton className="h-[450px] w-full rounded-lg bg-white/50" />;
}

export default async function StudentWellnessTrendsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="space-y-6">
      <Suspense>
        <Stats studentId={studentId} />
      </Suspense>

      <Suspense fallback={<ChartFallback />}>
        <EmotionTimelineChart studentId={studentId} />
      </Suspense>

      {/* Temporarily hidden - Mood Check-In History with Calendar */}
      {/* <div className="space-y-4">
        <Large className="font-normal">Mood Check-In History</Large>
        <Suspense>
          <MoodCalendar studentId={studentId} />
        </Suspense>
      </div> */}
    </div>
  );
}
