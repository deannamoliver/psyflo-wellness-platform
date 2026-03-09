/**
 * Safety scenario definitions
 *
 * Scenarios for students with safety alerts from PHQ-A/PHQ-9 Question 9 (suicidal ideation).
 */

import type { TestScenario } from "../types";

export const safetyScenarios: TestScenario[] = [
  // 1. PHQ-A with Question 9 → Safety Alert
  {
    student: {
      firstName: "Phqa",
      lastName: "Safety",
      grade: 10,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 10,
          // Specifically answer question 9 (suicidal ideation) with score > 0
          specificAnswers: [{ questionCode: "PHQA_9", answerCode: "2" }], // Score of 2
        },
        alert: {
          type: "safety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Safety concern identified in PHQ-A screener",
            },
            {
              type: "emergency_action",
              description: "Contacted 988",
              action: "contacted_988",
            },
          ],
        },
      },
    ],
  },

  // 2. PHQ-9 with Question 9 → Safety Alert
  {
    student: {
      firstName: "Phq9",
      lastName: "Safety",
      grade: 12,
      age: 18,
    },
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 12,
          // Specifically answer question 9 (suicidal ideation) with score > 0
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "3" }], // Score of 3
        },
        alert: {
          type: "safety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Safety concern identified in PHQ-9 screener",
            },
            {
              type: "emergency_action",
              description: "Contacted 988",
              action: "contacted_988",
            },
          ],
        },
      },
    ],
  },
];
