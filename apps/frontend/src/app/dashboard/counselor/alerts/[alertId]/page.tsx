import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/lib/core-ui/breadcrumb";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import ActionsContainer from "./~lib/actions-container";
import AlertSummary from "./~lib/alert-summary";
import AlertTimeline from "./~lib/alert-timeline";
import StudentInfo from "./~lib/student-info";

function PageBreadcrumb() {
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
          <BreadcrumbPage>Details</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function AlertDetailsPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;

  return (
    <PageContainer>
      <PageContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <PageBreadcrumb />
          <Suspense>
            <ActionsContainer alertId={alertId} />
          </Suspense>
        </div>
        <StudentInfo alertId={alertId} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AlertSummary alertId={alertId} className="col-span-2" />
        </div>
        <AlertTimeline alertId={alertId} />
      </PageContent>
    </PageContainer>
  );
}
