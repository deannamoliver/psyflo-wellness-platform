import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { ConversationsWrapper } from "../../../../counselor/students/[studentId]/conversations/~lib/conversations-wrapper";

export default async function AdminStudentConversationsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="pt-2">
      <Suspense fallback={<Skeleton className="h-96 w-full bg-white/50" />}>
        <ConversationsWrapper studentId={studentId} />
      </Suspense>
    </div>
  );
}
