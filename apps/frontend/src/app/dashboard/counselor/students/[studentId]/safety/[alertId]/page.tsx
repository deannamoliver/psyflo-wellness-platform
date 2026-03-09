import {
  alerts,
  coachSafetyReports,
  profiles,
  screenerAlerts,
  screeners,
  users,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  determineRiskLevel,
  type SafetyRiskLevel,
} from "@/lib/student-alerts/safety-types";
import { getUserFullName, getUserFullNameFromMetaData } from "@/lib/user/utils";
import { AlertReportActions } from "./~lib/alert-report-actions";
import { AlertReportCard } from "./~lib/alert-report-card";
import { AlertReportContent } from "./~lib/alert-report-content";
import { ScreenerContent } from "./~lib/screener-content";

function borderColor(type: string): string {
  switch (type) {
    case "safety":
      return "border-l-red-500";
    case "harm_to_others":
      return "border-l-red-400";
    case "depression":
      return "border-l-yellow-500";
    case "anxiety":
      return "border-l-orange-500";
    default:
      return "border-l-gray-400";
  }
}

export default async function SafetyAlertDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; alertId: string }>;
}) {
  const { studentId, alertId } = await params;
  const db = await serverDrizzle();

  const alert = await db.admin
    .select()
    .from(alerts)
    .where(eq(alerts.id, alertId))
    .limit(1)
    .then((res) => res[0]);

  if (!alert) notFound();

  // Get student name and grade for resolve modal
  const studentRecord = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  const studentName = studentRecord
    ? getUserFullName(studentRecord.user)
    : "Unknown Student";
  const studentGrade = studentRecord?.profile.grade ?? null;

  // Get coach name and risk level if this is a coach-submitted report
  let coachName: string | undefined;
  let storedRiskLevel: SafetyRiskLevel | null = null;
  if (alert.source === "coach" || alert.source === "chat") {
    const result = await db.admin
      .select({
        metaData: users.rawUserMetaData,
        riskLevel: coachSafetyReports.riskLevel,
      })
      .from(coachSafetyReports)
      .innerJoin(users, eq(users.id, coachSafetyReports.submittedByCoachId))
      .where(eq(coachSafetyReports.alertId, alertId))
      .limit(1)
      .then((res) => res[0] ?? null);

    if (result) {
      coachName = getUserFullNameFromMetaData(result.metaData);
      storedRiskLevel = result.riskLevel;
    }
  }

  // Get screener type for screener-source alerts
  let screenerType: string | null = null;
  if (alert.source === "screener") {
    const screenerResult = await db.admin
      .select({ type: screeners.type })
      .from(screenerAlerts)
      .innerJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
      .where(eq(screenerAlerts.alertId, alertId))
      .limit(1)
      .then((res) => res[0] ?? null);
    screenerType = screenerResult?.type ?? null;
  }

  const riskLevel = determineRiskLevel(
    alert.source,
    screenerType,
    storedRiskLevel,
  );

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Link
        href={`/dashboard/counselor/students/${studentId}/safety`}
        className="mb-3 flex w-fit items-center gap-1 font-dm font-medium text-primary text-sm hover:text-primary/80"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span>Back to Safety Alert</span>
      </Link>

      <div
        className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${borderColor(alert.type)} border-l-4`}
      >
        <AlertReportCard
          alert={alert}
          coachName={coachName}
          riskLevel={riskLevel}
        >
          <Suspense
            fallback={
              <div className="border-gray-200 border-t p-6">
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            {alert.source === "chat" || alert.source === "coach" ? (
              <AlertReportContent alertId={alertId} alertType={alert.type} />
            ) : (
              <ScreenerContent alertId={alertId} alertType={alert.type} />
            )}
          </Suspense>

          <AlertReportActions
            alertId={alertId}
            status={alert.status}
            source={alert.source as "chat" | "screener" | "coach"}
            student={{ name: studentName, grade: studentGrade }}
          />
        </AlertReportCard>
      </div>
    </div>
  );
}
