import type { alertStatusEnum } from "@feelwell/database";

export type SafetyRiskLevel = "emergency" | "high" | "moderate" | "low";

export type SafetyAlertType = "phq9_q9_endorsed" | "coach_escalation_report";

export type ActionTaken =
  | "contacted_988"
  | "notified_staff"
  | "contacted_parents"
  | "triggered_gad7"
  | "triggered_phq9"
  | "emergency_services_contacted"
  | "cps_notified"
  | "assessment_performed";

/** Row in the safety alerts table, grouped per student. */
export type SafetyStudentRow = {
  studentId: string;
  studentName: string;
  grade: number | null;
  studentCode: string | null;
  highestRiskLevel: SafetyRiskLevel;
  alerts: SafetyAlertEntry[];
  alertCount: number;
  latestAlertAt: Date;
  actionsTaken: ActionTaken[];
  status: (typeof alertStatusEnum.enumValues)[number];
};

export type SafetyAlertEntry = {
  alertId: string;
  type: SafetyAlertType;
  riskLevel: SafetyRiskLevel;
  createdAt: Date;
  status: (typeof alertStatusEnum.enumValues)[number];
};

/** Summary counts per risk level (counts distinct students, not alerts). */
export type SafetyRiskSummary = {
  emergency: number;
  high: number;
  moderate: number;
  low: number;
};

/** Display labels for action types shown in the Actions Taken column. */
export const ACTION_DISPLAY_LABELS: Record<ActionTaken, string> = {
  contacted_parents: "Parent/Guardian contacted",
  notified_staff: "School notified",
  contacted_988: "988 Lifeline contacted",
  emergency_services_contacted: "Emergency Services contacted",
  cps_notified: "CPS notified",
  assessment_performed: "Assessment performed",
  triggered_gad7: "GAD-7 triggered",
  triggered_phq9: "PHQ-9 triggered",
};

/** Icons for action types (key maps to a visual indicator). */
export const ACTION_ICONS: Record<string, { emoji: string; color: string }> = {
  contacted_parents: { emoji: "👨‍👩‍👧", color: "text-green-600" },
  emergency_services_contacted: { emoji: "📞", color: "text-red-600" },
  notified_staff: { emoji: "🏫", color: "text-blue-600" },
  cps_notified: { emoji: "📋", color: "text-purple-600" },
  assessment_performed: { emoji: "📝", color: "text-orange-600" },
  contacted_988: { emoji: "☎️", color: "text-red-600" },
  triggered_gad7: { emoji: "📊", color: "text-blue-600" },
  triggered_phq9: { emoji: "📊", color: "text-blue-600" },
};

const RISK_PRIORITY: Record<SafetyRiskLevel, number> = {
  emergency: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

/** Returns the highest risk level from a list. */
export function getHighestRiskLevel(
  levels: SafetyRiskLevel[],
): SafetyRiskLevel {
  if (levels.length === 0) return "low";
  return levels.reduce((highest, current) =>
    RISK_PRIORITY[current] < RISK_PRIORITY[highest] ? current : highest,
  );
}

/** Determine risk level for a safety alert based on source, screener type, and stored value. */
export function determineRiskLevel(
  source: string,
  screenerType: string | null,
  storedRiskLevel: SafetyRiskLevel | null,
): SafetyRiskLevel {
  if (
    source === "screener" &&
    (screenerType === "phq_9" || screenerType === "phq_a")
  ) {
    return "high";
  }
  return storedRiskLevel ?? "moderate";
}

/** Display label for safety alert types. */
export function getAlertTypeLabel(type: SafetyAlertType): string {
  switch (type) {
    case "phq9_q9_endorsed":
      return "PHQ-9 Q9 Endorsed";
    case "coach_escalation_report":
      return "Coach Escalation Report";
  }
}
