import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { SafetyAlertColumns } from "../../../../counselor/students/[studentId]/safety/~lib/alert-columns";

export default async function AdminStudentSafetyPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="pt-2">
      <Suspense fallback={<Skeleton className="h-96 w-full bg-white/50" />}>
        <SafetyAlertColumns studentId={studentId} />
      </Suspense>
    </div>
  );
}
