import { userSchools } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import { ConversationsWrapper } from "./~lib/conversations-wrapper";

export default async function StudentConversationsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const db = await serverDrizzle();
  const userSchool = await db.admin.query.userSchools.findFirst({
    where: eq(userSchools.userId, db.userId()),
    columns: { role: true },
  });

  if (userSchool?.role !== "wellness_coach") {
    redirect(`/dashboard/counselor/students/${studentId}/overview`);
  }

  return (
    <div className="pt-2">
      <Suspense fallback={<Skeleton className="h-96 w-full bg-white/50" />}>
        <ConversationsWrapper studentId={studentId} />
      </Suspense>
    </div>
  );
}
