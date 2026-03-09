import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { MoodTrendsChart } from "../../../../counselor/students/[studentId]/wellness/~lib/mood-trends-chart";
import { WellnessActivityClient } from "../../../../counselor/students/[studentId]/wellness/~lib/wellness-activity-client";

function ChartFallback() {
  return <Skeleton className="h-[400px] w-full rounded-lg bg-white/50" />;
}

export default async function PatientWellnessPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      {/* Row 1: Self-Care Summary + Mood Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WellnessActivityClient studentId={patientId} showSummaryOnly />
        <Suspense fallback={<ChartFallback />}>
          <MoodTrendsChart studentId={patientId} />
        </Suspense>
      </div>

      {/* Row 2: Journaling, Breathing, Meditation */}
      <WellnessActivityClient studentId={patientId} showActivitiesOnly />
    </div>
  );
}
