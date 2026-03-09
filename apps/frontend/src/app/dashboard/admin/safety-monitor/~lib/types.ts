/** Risk levels for the admin safety monitor. */
export type AdminRiskLevel = "emergency" | "high" | "moderate" | "low";

/** Alert status values. */
export type AdminAlertStatus = "new" | "in_progress" | "resolved";

/** Classified alert type for display. */
export type AdminAlertType =
  | "self_harm"
  | "harm_to_others"
  | "abuse_neglect"
  | "phq9_q9_endorsed"
  | "other";

/** A single safety alert row in the admin view. */
export type AdminSafetyAlert = {
  alertId: string;
  studentId: string;
  studentName: string;
  grade: number | null;
  studentCode: string | null;
  schoolName: string;
  schoolId: string | null;
  districtCode: string | null;
  alertType: AdminAlertType;
  riskLevel: AdminRiskLevel;
  submittedByName: string;
  submittedByRole: string;
  createdAt: Date;
  status: AdminAlertStatus;
  handoffId: string | null;
  source: string;
  type: string;
};

/** Summary counts for the stat cards. */
export type AdminSafetySummary = {
  emergency: number;
  high: number;
  moderate: number;
  low: number;
  inReview: number;
};

/** Display labels for alert types. */
export const ALERT_TYPE_LABELS: Record<AdminAlertType, string> = {
  self_harm: "Self-Harm",
  harm_to_others: "Harm to Others",
  abuse_neglect: "Abuse/Neglect",
  phq9_q9_endorsed: "PHQ9 Q9 Endorsed",
  other: "Other",
};
