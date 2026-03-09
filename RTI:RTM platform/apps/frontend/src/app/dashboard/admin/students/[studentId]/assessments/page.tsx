import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { H3 } from "@/lib/core-ui/typography";
import { AssessmentSummary } from "../../../../counselor/students/[studentId]/assessments/~lib/assessment-summary";
import { ScoreTrendsData } from "../../../../counselor/students/[studentId]/assessments/~lib/score-trends-data";

export default async function AdminStudentAssessmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <H3 className="font-semibold text-lg">Recent Assessment Summary</H3>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-white/50" />
            ))}
          </div>
        }
      >
        <AssessmentSummary studentId={studentId} />
      </Suspense>

      <Suspense
        fallback={
          <Skeleton className="h-[350px] w-full rounded-lg bg-white/50" />
        }
      >
        <ScoreTrendsData studentId={studentId} />
      </Suspense>
    </div>
  );
}
