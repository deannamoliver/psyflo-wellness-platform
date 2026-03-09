import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { EmergencyContacts } from "../../../../counselor/students/[studentId]/overview/~lib/emergency-contacts";
import { OverviewStats } from "../../../../counselor/students/[studentId]/overview/~lib/overview-stats";
import { PersonalInformation } from "../../../../counselor/students/[studentId]/overview/~lib/personal-info";
import { RecentActivities } from "../../../../counselor/students/[studentId]/overview/~lib/recent-activities";

function CardSkeleton() {
  return <Skeleton className="h-64 w-full rounded-lg bg-white/50" />;
}

export default async function AdminStudentOverviewPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-6 lg:col-span-3">
          <div className="shrink-0">
            <Suspense fallback={<CardSkeleton />}>
              <PersonalInformation studentId={studentId} />
            </Suspense>
          </div>
          <div className="shrink-0">
            <Suspense
              fallback={<Skeleton className="h-24 w-full bg-white/50" />}
            >
              <OverviewStats studentId={studentId} />
            </Suspense>
          </div>
          <div className="min-h-0 flex-1">
            <Suspense fallback={<CardSkeleton />}>
              <RecentActivities studentId={studentId} />
            </Suspense>
          </div>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<CardSkeleton />}>
            <EmergencyContacts studentId={studentId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
