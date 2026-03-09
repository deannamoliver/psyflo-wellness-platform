import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { SafetyAlertColumns } from "./~lib/alert-columns";

export default async function StudentSafetyPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Safety Alerts</h3>
        <p className="mt-0.5 text-sm text-gray-500">Track and manage safety-related alerts for this patient</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl bg-white/50" />}>
        <SafetyAlertColumns studentId={studentId} />
      </Suspense>
    </div>
  );
}
