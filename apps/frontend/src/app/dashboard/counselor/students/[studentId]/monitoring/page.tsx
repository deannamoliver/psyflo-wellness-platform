import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { MonitoringClient } from "./~lib/monitoring-client";

function ChartFallback() {
  return <Skeleton className="h-[400px] w-full rounded-lg bg-white/50" />;
}

export default async function StudentMonitoringPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <Suspense fallback={<ChartFallback />}>
        <MonitoringClient studentId={studentId} />
      </Suspense>
    </div>
  );
}
