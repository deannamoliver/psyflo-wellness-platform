/**
 * PHQ-9 (Patient Health Questionnaire-9) Scoring
 * 
 * The PHQ-9 is a 9-item self-report measure of depression severity.
 * Each item is scored 0-3 (Not at all, Several days, More than half the days, Nearly every day).
 * Total score range: 0-27
 * 
 * Scoring interpretation:
 * - 0-4: Minimal depression
 * - 5-9: Mild depression
 * - 10-14: Moderate depression
 * - 15-19: Moderately severe depression
 * - 20-27: Severe depression
 * 
 * Question 9 specifically asks about suicidal ideation and should trigger an alert if > 0.
 */

import type { ScoringResult } from "../types";

export const PHQ9_QUESTIONS = [
  { id: "phq9_q1", text: "Little interest or pleasure in doing things" },
  { id: "phq9_q2", text: "Feeling down, depressed, or hopeless" },
  { id: "phq9_q3", text: "Trouble falling or staying asleep, or sleeping too much" },
  { id: "phq9_q4", text: "Feeling tired or having little energy" },
  { id: "phq9_q5", text: "Poor appetite or overeating" },
  { id: "phq9_q6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
  { id: "phq9_q7", text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
  { id: "phq9_q8", text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual" },
  { id: "phq9_q9", text: "Thoughts that you would be better off dead or of hurting yourself in some way" },
];

export const PHQ9_OPTIONS = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" },
];

export interface PHQ9Result extends ScoringResult {
  suicidalIdeation: boolean;
}

export function scorePHQ9(responses: Record<string, string | number>): PHQ9Result {
  let total = 0;
  const flags: string[] = [];

  // Sum up all responses
  for (const question of PHQ9_QUESTIONS) {
    const value = responses[question.id];
    if (value !== undefined) {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        total += numValue;
      }
    }
  }

  // Check for suicidal ideation (question 9)
  const q9Value = responses["phq9_q9"];
  const q9Numeric = typeof q9Value === "string" ? parseInt(q9Value, 10) : (q9Value ?? 0);
  const suicidalIdeation = q9Numeric > 0;

  if (suicidalIdeation) {
    flags.push("suicidal_ideation");
  }

  // Determine severity and interpretation
  let severity: ScoringResult["severity"];
  let interpretation: string;
  const recommendations: string[] = [];

  if (total <= 4) {
    severity = "minimal";
    interpretation = "Minimal depression symptoms";
    recommendations.push("Continue monitoring");
  } else if (total <= 9) {
    severity = "mild";
    interpretation = "Mild depression symptoms";
    recommendations.push("Watchful waiting; repeat PHQ-9 at follow-up");
    recommendations.push("Consider counseling or lifestyle modifications");
  } else if (total <= 14) {
    severity = "moderate";
    interpretation = "Moderate depression symptoms";
    recommendations.push("Treatment plan should be considered");
    recommendations.push("Counseling and/or pharmacotherapy");
  } else if (total <= 19) {
    severity = "moderately-severe";
    interpretation = "Moderately severe depression symptoms";
    recommendations.push("Active treatment recommended");
    recommendations.push("Pharmacotherapy and/or psychotherapy");
  } else {
    severity = "severe";
    interpretation = "Severe depression symptoms";
    recommendations.push("Immediate initiation of pharmacotherapy");
    recommendations.push("Consider psychiatric consultation");
    flags.push("severe_depression");
  }

  if (suicidalIdeation) {
    recommendations.unshift("PRIORITY: Assess suicidal ideation immediately");
  }

  return {
    total,
    interpretation,
    severity,
    suicidalIdeation,
    flags,
    recommendations,
  };
}

// Threshold lines for trend chart visualization
export const PHQ9_THRESHOLDS = [
  { value: 5, label: "Mild", color: "#fbbf24" },
  { value: 10, label: "Moderate", color: "#f97316" },
  { value: 15, label: "Mod-Severe", color: "#ef4444" },
  { value: 20, label: "Severe", color: "#dc2626" },
];
