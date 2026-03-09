/**
 * SEL skills tab configuration: subtype labels, ordering, colors, and score helpers.
 *
 * Scores use a 1.0-4.0 scale derived from the SEL screener answer codes.
 * Performance thresholds: Strong >= 3.0, Developing >= 2.0, Needs Support < 2.0.
 */

export type PerformanceLevel = "strong" | "developing" | "needs_support";

export const SEL_SUBTYPE_ORDER = [
  "sel_self_awareness_self_concept",
  "sel_self_awareness_emotion_knowledge",
  "sel_social_awareness",
  "sel_self_management_emotion_regulation",
  "sel_self_management_goal_management",
  "sel_self_management_school_work",
  "sel_relationship_skills",
  "sel_responsible_decision_making",
] as const;

export const SEL_SUBTYPE_LABELS: Record<string, string> = {
  sel_self_awareness_self_concept: "Self-Awareness: Self-Concept",
  sel_self_awareness_emotion_knowledge: "Self-Awareness: Emotion Knowledge",
  sel_social_awareness: "Social Awareness",
  sel_self_management_emotion_regulation: "Self-Management: Emotion Regulation",
  sel_self_management_goal_management: "Self-Management: Goal Management",
  sel_self_management_school_work: "Self-Management: School Work",
  sel_relationship_skills: "Relationship Skills",
  sel_responsible_decision_making: "Responsible Decision-Making",
};

/** Short column labels for the skills student table. */
export const SEL_SUBTYPE_SHORT_LABELS: Record<string, string> = {
  sel_self_awareness_self_concept: "Self-Concept",
  sel_self_awareness_emotion_knowledge: "Emotion Knowledge",
  sel_social_awareness: "Social Awareness",
  sel_self_management_emotion_regulation: "Emotion Regulation",
  sel_self_management_goal_management: "Goal Management",
  sel_self_management_school_work: "School Work",
  sel_relationship_skills: "Relationship Skills",
  sel_responsible_decision_making: "Responsible Decision-Making",
};

export const SEL_SUBTYPE_COLORS: Record<string, string> = {
  sel_self_awareness_self_concept: "#3b82f6",
  sel_self_awareness_emotion_knowledge: "#6366f1",
  sel_social_awareness: "#10b981",
  sel_self_management_emotion_regulation: "#f59e0b",
  sel_self_management_goal_management: "#8b5cf6",
  sel_self_management_school_work: "#ec4899",
  sel_relationship_skills: "#14b8a6",
  sel_responsible_decision_making: "#f97316",
};

export function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 3.0) return "strong";
  if (score >= 2.0) return "developing";
  return "needs_support";
}

export function getPerformanceLevelLabel(level: PerformanceLevel): string {
  switch (level) {
    case "strong":
      return "Strong";
    case "developing":
      return "Developing";
    case "needs_support":
      return "Needs Support";
  }
}

export function getPerformanceLevelColor(level: PerformanceLevel): string {
  switch (level) {
    case "strong":
      return "#22c55e";
    case "developing":
      return "#eab308";
    case "needs_support":
      return "#ef4444";
  }
}

/** Convert raw session score + maxScore to the 1.0-4.0 scale. */
export function toFourPointScale(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return (score / maxScore) * 4.0;
}
