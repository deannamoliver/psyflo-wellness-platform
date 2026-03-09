import { userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/lib/core-ui/breadcrumb";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import { getStudentWithAllAlerts } from "@/lib/student-alerts/queries";
import { AlertTimelineList } from "./~lib/alert-timeline-list";
import { StudentHeader } from "./~lib/student-header";

function PageBreadcrumb({
  studentName: _studentName,
}: {
  studentName: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/counselor/alerts">
            Alerts
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>View Details</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function StudentAlertDetailsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const db = await serverDrizzle();
  const counselorId = db.userId();

  // Get current user's school ID (counselor or wellness coach)
  const schoolId = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, counselorId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!schoolId) {
    notFound();
  }

  // Get student data to verify they exist and have alerts
  const studentData = await getStudentWithAllAlerts({ studentId, schoolId });

  if (!studentData) {
    notFound();
  }

  return (
    <PageContainer>
      <PageContent className="flex flex-col gap-6">
        <PageBreadcrumb studentName={studentData.student.name} />

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <StudentHeader studentId={studentId} schoolId={schoolId} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <AlertTimelineList
            studentId={studentId}
            schoolId={schoolId}
            student={{
              name: studentData.student.name,
              grade: studentData.student.gradeLevel ?? null,
            }}
          />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
