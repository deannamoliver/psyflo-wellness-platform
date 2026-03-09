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
import { AlertDetailClient } from "./~lib/alert-detail-client";
import { getAdminAlertDetail, getConversationForHandoff } from "./~lib/queries";

async function AlertDetailContent({ alertId }: { alertId: string }) {
  const alert = await getAdminAlertDetail(alertId);
  if (!alert) notFound();

  let conversation = null;
  if (alert.handoffId) {
    conversation = await getConversationForHandoff(alert.handoffId);
  }

  return <AlertDetailClient alert={alert} conversation={conversation} />;
}

export default async function AdminAlertDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard/admin/safety-monitor"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Safety Monitor
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Alert Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        }
      >
        <AlertDetailContent alertId={alertId} />
      </Suspense>
    </div>
  );
}
