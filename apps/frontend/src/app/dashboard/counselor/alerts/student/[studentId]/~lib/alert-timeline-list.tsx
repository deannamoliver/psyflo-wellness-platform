import {
  alerts,
  coachSafetyReports,
  screenerAlerts,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, desc, eq, or } from "drizzle-orm";
import { Suspense } from "react";
import { AlertReportContent } from "@/app/dashboard/counselor/students/[studentId]/safety/[alertId]/~lib/alert-report-content";
import { ScreenerContent } from "@/app/dashboard/counselor/students/[studentId]/safety/[alertId]/~lib/screener-content";
import type { ResolveAlertStudentInfo } from "@/lib/alerts/resolve-alert-modal";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  determineRiskLevel,
  type SafetyRiskLevel,
} from "@/lib/student-alerts/safety-types";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import { AlertTimelineActions } from "./alert-timeline-actions";
import { AlertTimelineItem } from "./alert-timeline-item";
import { ResolvedAlertSection } from "./resolved-alert-section";

export async function AlertTimelineList({
  studentId,
  schoolId,
  student,
}: {
  studentId: string;
  schoolId: string;
  student: ResolveAlertStudentInfo;
}) {
  const db = await serverDrizzle();

  // Fetch all alerts for this student ordered by creation date (newest first)
  const studentAlerts = await db.admin
    .select({
      alerts: alerts,
      userSchools: userSchools,
      screenerType: screeners.type,
    })
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .where(
      and(
        eq(alerts.studentId, studentId),
        eq(userSchools.schoolId, schoolId),
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    )
    .orderBy(desc(alerts.createdAt));

  if (studentAlerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 text-sm">
        No alerts found for this student.
      </div>
    );
  }

  // Deduplicate alerts (join can produce duplicates)
  const alertMap = new Map<string, (typeof studentAlerts)[0]>();
  for (const row of studentAlerts) {
    if (!alertMap.has(row.alerts.id)) {
      alertMap.set(row.alerts.id, row);
    }
  }
  const uniqueAlerts = Array.from(alertMap.values());

  // Fetch coach names and risk levels for all alerts
  const coachNameMap = new Map<string, string>();
  const coachRiskLevelMap = new Map<string, SafetyRiskLevel>();
  const alertIds = uniqueAlerts.map((a) => a.alerts.id);
  for (const alertId of alertIds) {
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
      coachNameMap.set(alertId, getUserFullNameFromMetaData(result.metaData));
      coachRiskLevelMap.set(alertId, result.riskLevel);
    }
  }

  const unresolvedAlerts = uniqueAlerts.filter(
    (a) => a.alerts.status !== "resolved",
  );
  const unresolvedAlertIds = unresolvedAlerts.map((a) => a.alerts.id);

  return (
    <div className="space-y-6">
      {/* Section header with bulk actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-xl">Alert Timeline</h2>
        {unresolvedAlerts.length > 0 && (
          <AlertTimelineActions
            studentId={studentId}
            unresolvedAlertIds={unresolvedAlertIds}
            student={student}
          />
        )}
      </div>

      {/* Alert items */}
      <div className="space-y-6">
        {uniqueAlerts.map((row, idx) => {
          const alert = row.alerts;
          const coachName = coachNameMap.get(alert.id);
          const riskLevel = determineRiskLevel(
            alert.source,
            row.screenerType,
            coachRiskLevelMap.get(alert.id) ?? null,
          );

          return (
            <AlertTimelineItem
              key={alert.id}
              alert={{
                id: alert.id,
                type: alert.type,
                source: alert.source,
                status: alert.status,
                createdAt: alert.createdAt,
                coachName,
                riskLevel,
              }}
              student={student}
              defaultExpanded={idx === 0}
            >
              <Suspense
                fallback={
                  <div className="border-gray-200 border-t p-6">
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                {alert.source === "coach" ? (
                  <AlertReportContent
                    alertId={alert.id}
                    alertType={alert.type}
                  />
                ) : (
                  <ScreenerContent alertId={alert.id} alertType={alert.type} />
                )}
              </Suspense>

              {alert.status === "resolved" && (
                <Suspense
                  fallback={
                    <div className="border-gray-200 border-t p-6">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  }
                >
                  <ResolvedAlertSection alertId={alert.id} />
                </Suspense>
              )}
            </AlertTimelineItem>
          );
        })}
      </div>
    </div>
  );
}
