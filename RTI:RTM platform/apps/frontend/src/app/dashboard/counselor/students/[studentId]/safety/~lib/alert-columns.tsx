import {
  alerts,
  coachSafetyReports,
  screenerAlerts,
  screeners,
} from "@feelwell/database";
import { and, desc, eq, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import { determineRiskLevel } from "@/lib/student-alerts/safety-types";
import { AlertColumn } from "./alert-column";

export type SafetyAlert = {
  id: string;
  type: string;
  source: string;
  status: string;
  createdAt: Date;
  assigneeName: string | null;
};

function formatAlertTitle(source: string): string {
  switch (source) {
    case "coach":
      return "Therapist Escalation Report";
    case "screener":
      return "PHQ-9 Question Endorsement";
    default:
      return "Safety Alert";
  }
}

export async function SafetyAlertColumns({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const allAlerts = await db.admin
    .select({
      id: alerts.id,
      type: alerts.type,
      source: alerts.source,
      status: alerts.status,
      createdAt: alerts.createdAt,
      screenerType: screeners.type,
      coachRiskLevel: coachSafetyReports.riskLevel,
    })
    .from(alerts)
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .leftJoin(coachSafetyReports, eq(alerts.id, coachSafetyReports.alertId))
    .where(
      and(
        eq(alerts.studentId, studentId),
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    )
    .orderBy(desc(alerts.createdAt));

  // Deduplicate (joins can produce duplicates)
  const deduped = new Map<string, (typeof allAlerts)[0]>();
  for (const row of allAlerts) {
    if (!deduped.has(row.id)) {
      deduped.set(row.id, row);
    }
  }

  const alertsWithMeta = Array.from(deduped.values()).map((a) => {
    const riskLevel = determineRiskLevel(
      a.source,
      a.screenerType,
      a.coachRiskLevel ?? null,
    );
    const badge = RISK_BADGE_CONFIG[riskLevel];
    return {
      id: a.id,
      type: a.type,
      source: a.source,
      status: a.status,
      createdAt: a.createdAt,
      severity: badge.label,
      severityColor: `${badge.bg} ${badge.text}`,
      title: formatAlertTitle(a.source),
      assigneeName: null as string | null,
    };
  });

  const newAlerts = alertsWithMeta.filter((a) => a.status === "new");
  const inReview = alertsWithMeta.filter((a) => a.status === "in_progress");
  const resolved = alertsWithMeta.filter((a) => a.status === "resolved");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <AlertColumn
        title="New Alerts"
        count={newAlerts.length}
        alerts={newAlerts}
        studentId={studentId}
        emptyMessage="All active alerts displayed"
        buttonLabel="View Full Report"
        badgeColor="red"
      />
      <AlertColumn
        title="Alerts in Review"
        count={inReview.length}
        alerts={inReview}
        studentId={studentId}
        emptyMessage="All in-review alerts displayed"
        buttonLabel="View Full Report"
        badgeColor="yellow"
      />
      <AlertColumn
        title="Resolved Alerts"
        count={resolved.length}
        alerts={resolved.slice(0, 3)}
        studentId={studentId}
        emptyMessage="No resolved alerts"
        buttonLabel="View Details"
        showViewAll={resolved.length > 3}
        badgeColor="green"
      />
    </div>
  );
}
