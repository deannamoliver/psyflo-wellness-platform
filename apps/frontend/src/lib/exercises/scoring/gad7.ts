/**
 * GAD-7 (Generalized Anxiety Disorder 7-item scale) Scoring
 * 
 * The GAD-7 is a 7-item self-report measure of anxiety severity.
 * Each item is scored 0-3 (Not at all, Several days, More than half the days, Nearly every day).
 * Total score range: 0-21
 * 
 * Scoring interpretation:
 * - 0-4: Minimal anxiety
 * - 5-9: Mild anxiety
 * - 10-14: Moderate anxiety
 * - 15-21: Severe anxiety
 */

import type { ScoringResult } from "../types";

export const GAD7_QUESTIONS = [
  { id: "gad7_q1", text: "Feeling nervous, anxious, or on edge" },
  { id: "gad7_q2", text: "Not being able to stop or control worrying" },
  { id: "gad7_q3", text: "Worrying too much about different things" },
  { id: "gad7_q4", text: "Trouble relaxing" },
  { id: "gad7_q5", text: "Being so restless that it's hard to sit still" },
  { id: "gad7_q6", text: "Becoming easily annoyed or irritable" },
  { id: "gad7_q7", text: "Feeling afraid as if something awful might happen" },
];

export const GAD7_OPTIONS = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" },
];

export function scoreGAD7(responses: Record<string, string | number>): ScoringResult {
  let total = 0;
  const flags: string[] = [];

  // Sum up all responses
  for (const question of GAD7_QUESTIONS) {
    const value = responses[question.id];
    if (value !== undefined) {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        total += numValue;
      }
    }
  }

  // Determine severity and interpretation
  let severity: ScoringResult["severity"];
  let interpretation: string;
  const recommendations: string[] = [];

  if (total <= 4) {
    severity = "minimal";
    interpretation = "Minimal anxiety symptoms";
    recommendations.push("Continue monitoring");
  } else if (total <= 9) {
    severity = "mild";
    interpretation = "Mild anxiety symptoms";
    recommendations.push("Watchful waiting; repeat GAD-7 at follow-up");
    recommendations.push("Consider relaxation techniques and lifestyle modifications");
  } else if (total <= 14) {
    severity = "moderate";
    interpretation = "Moderate anxiety symptoms";
    recommendations.push("Treatment plan should be considered");
    recommendations.push("CBT and/or pharmacotherapy");
    flags.push("moderate_anxiety");
  } else {
    severity = "severe";
    interpretation = "Severe anxiety symptoms";
    recommendations.push("Active treatment recommended");
    recommendations.push("Pharmacotherapy and/or intensive psychotherapy");
    recommendations.push("Consider psychiatric consultation");
    flags.push("severe_anxiety");
  }

  return {
    total,
    interpretation,
    severity,
    flags,
    recommendations,
  };
}

// Threshold lines for trend chart visualization
export const GAD7_THRESHOLDS = [
  { value: 5, label: "Mild", color: "#fbbf24" },
  { value: 10, label: "Moderate", color: "#f97316" },
  { value: 15, label: "Severe", color: "#ef4444" },
];
