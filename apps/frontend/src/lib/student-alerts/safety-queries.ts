import {
  alertActions,
  alerts,
  alertTimelineEntries,
  chatAlerts,
  coachSafetyReports,
  profiles,
  screenerAlerts,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import {
  type ActionTaken,
  determineRiskLevel,
  getHighestRiskLevel,
  type SafetyAlertEntry,
  type SafetyAlertType,
  type SafetyRiskSummary,
  type SafetyStudentRow,
} from "./safety-types";

type SafetyQueryParams = {
  schoolId: string;
};

/** Determine alert display type based on source and screener data. */
function classifyAlertType(
  source: string,
  screenerType: string | null,
): SafetyAlertType {
  if (
    source === "screener" &&
    (screenerType === "phq_9" || screenerType === "phq_a")
  ) {
    return "phq9_q9_endorsed";
  }
  return "coach_escalation_report";
}

/** Compute aggregated student status (new > in_progress > resolved). */
function computeStatus(statuses: string[]): "new" | "in_progress" | "resolved" {
  if (statuses.includes("new")) return "new";
  if (statuses.includes("in_progress")) return "in_progress";
  return "resolved";
}

/** Fetch safety alerts grouped by student for the safety alerts page. */
export async function getSafetyAlerts(
  params: SafetyQueryParams,
): Promise<{ rows: SafetyStudentRow[]; summary: SafetyRiskSummary }> {
  const db = await serverDrizzle();

  // Fetch all safety-type alerts for the school
  const data = await db.admin
    .select()
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id))
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .leftJoin(chatAlerts, eq(alerts.id, chatAlerts.alertId))
    .leftJoin(coachSafetyReports, eq(alerts.id, coachSafetyReports.alertId))
    .where(
      and(
        eq(userSchools.schoolId, params.schoolId),
        // Safety alerts: coach/chat escalations + PHQ Q9 endorsements
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    );

  // Get all alert IDs to fetch actions
  const alertIds = data.map((row) => row.alerts.id);
  const actionsData =
    alertIds.length > 0
      ? await db.admin
          .select({
            alertId: alertTimelineEntries.alertId,
            actionType: alertActions.type,
          })
          .from(alertActions)
          .innerJoin(
            alertTimelineEntries,
            eq(alertActions.timelineEntryId, alertTimelineEntries.id),
          )
          .where(inArray(alertTimelineEntries.alertId, alertIds))
      : [];

  // Group actions by alert ID
  const actionsByAlert = new Map<string, Set<ActionTaken>>();
  for (const action of actionsData) {
    if (!actionsByAlert.has(action.alertId)) {
      actionsByAlert.set(action.alertId, new Set());
    }
    actionsByAlert.get(action.alertId)?.add(action.actionType);
  }

  // Group by student
  const studentMap = new Map<
    string,
    {
      studentName: string;
      grade: number | null;
      studentCode: string | null;
      alerts: SafetyAlertEntry[];
      actionsTaken: Set<ActionTaken>;
      statuses: string[];
    }
  >();

  for (const row of data) {
    const studentId = row.profiles.id;
    const alertType = classifyAlertType(
      row.alerts.source,
      row.screeners?.type ?? null,
    );
    const riskLevel = determineRiskLevel(
      row.alerts.source,
      row.screeners?.type ?? null,
      row.coach_safety_reports?.riskLevel ?? null,
    );

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        studentName: getUserFullName(row.users),
        grade: row.profiles.grade,
        studentCode: null,
        alerts: [],
        actionsTaken: new Set(),
        statuses: [],
      });
    }

    const student = studentMap.get(studentId)!;
    student.alerts.push({
      alertId: row.alerts.id,
      type: alertType,
      riskLevel,
      createdAt: row.alerts.createdAt,
      status: row.alerts.status,
    });
    student.statuses.push(row.alerts.status);

    // Collect actions for this alert
    const alertActionsSet = actionsByAlert.get(row.alerts.id);
    if (alertActionsSet) {
      for (const action of alertActionsSet) {
        student.actionsTaken.add(action);
      }
    }
  }

  // Transform to rows
  const rows: SafetyStudentRow[] = Array.from(studentMap.entries()).map(
    ([studentId, student]) => {
      const riskLevels = student.alerts.map((a) => a.riskLevel);
      return {
        studentId,
        studentName: student.studentName,
        grade: student.grade,
        studentCode: student.studentCode,
        highestRiskLevel: getHighestRiskLevel(riskLevels),
        alerts: student.alerts.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ),
        alertCount: student.alerts.length,
        latestAlertAt: new Date(
          Math.max(...student.alerts.map((a) => a.createdAt.getTime())),
        ),
        actionsTaken: Array.from(student.actionsTaken),
        status: computeStatus(student.statuses),
      };
    },
  );

  // Compute summary from all rows
  const summary = computeSummary(rows);

  // Return all rows - filtering and sorting is done client-side for instant response
  return { rows, summary };
}

function computeSummary(rows: SafetyStudentRow[]): SafetyRiskSummary {
  const summary: SafetyRiskSummary = {
    emergency: 0,
    high: 0,
    moderate: 0,
    low: 0,
  };
  for (const row of rows) {
    summary[row.highestRiskLevel]++;
  }
  return summary;
}
