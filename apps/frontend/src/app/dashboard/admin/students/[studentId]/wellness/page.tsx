import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { MoodHistoryCard } from "../../../../counselor/students/[studentId]/wellness/~lib/mood-history-card";
import { MoodTrendsChart } from "../../../../counselor/students/[studentId]/wellness/~lib/mood-trends-chart";
import { WellnessStats } from "../../../../counselor/students/[studentId]/wellness/~lib/wellness-stats";

function ChartFallback() {
  return <Skeleton className="h-[400px] w-full rounded-lg bg-white/50" />;
}

export default async function AdminStudentWellnessPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <Suspense
        fallback={
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-white/50" />
            ))}
          </div>
        }
      >
        <WellnessStats studentId={studentId} />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartFallback />}>
          <MoodTrendsChart studentId={studentId} />
        </Suspense>
        <MoodHistoryCard studentId={studentId} />
      </div>
    </div>
  );
}
