/**
 * Depression scenario definitions
 *
 * Scenarios for students with depression alerts from PHQ-A and PHQ-9 screeners.
 */

import type { TestScenario } from "../types";

export const depressionScenarios: TestScenario[] = [
  // 1. PHQ-A → Depression Alert
  {
    student: {
      firstName: "Phqa",
      lastName: "Depression",
      grade: 10,
      age: 15, // PHQ-A age range: 11-17
    },
    moodCheckIns: [
      {
        universalEmotion: "sad",
        specificEmotion: "lonely",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
      {
        universalEmotion: "sad",
        specificEmotion: "empty",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 15, // High score to trigger alert (risk level 3+)
          specificAnswers: [{ questionCode: "PHQA_9", answerCode: "0" }],
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-A screener",
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
            },
          ],
        },
      },
    ],
  },

  // 2. PHQ-9 → Depression Alert
  {
    student: {
      firstName: "Phq9",
      lastName: "Depression",
      grade: 12,
      age: 18, // PHQ-9 age range: 18+
    },
    moodCheckIns: [
      {
        universalEmotion: "sad",
        specificEmotion: "hurt",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 15, // High score to trigger alert
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "0" }],
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-9 screener",
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
            },
          ],
        },
      },
    ],
  },

  // 3. PHQ-A → Moderate Depression (In Progress) + therapist referral (submitted)
  {
    student: {
      firstName: "Sarah",
      lastName: "Mitchell",
      grade: 11,
      age: 16,
    },
    therapistReferral: {
      reason: "depression",
      serviceTypes: ["individual_therapy"],
      additionalContext:
        "Persistent low mood and withdrawal from peers over the past month.",
      urgency: "urgent",
      insuranceStatus: "has_insurance",
      status: "submitted",
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    moodCheckIns: [
      {
        universalEmotion: "bad",
        specificEmotion: "overwhelmed",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
      {
        universalEmotion: "sad",
        specificEmotion: "let_down",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 12,
          specificAnswers: [{ questionCode: "PHQA_9", answerCode: "0" }],
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "in_progress",
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-A screener",
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              statusChange: {
                from: "new",
                to: "in_progress",
              },
            },
            {
              type: "note_added",
              description: "Initial meeting scheduled",
              noteContent:
                "Meeting set for tomorrow to discuss support options.",
            },
          ],
        },
      },
    ],
  },

  // 4. PHQ-9 → Resolved Depression + therapist referral (completed/closed)
  {
    student: {
      firstName: "David",
      lastName: "Chen",
      grade: 12,
      age: 18,
    },
    therapistReferral: {
      reason: "depression",
      serviceTypes: ["individual_therapy", "psychiatric_services"],
      additionalContext:
        "Experienced a traumatic event outside of school. Family has been notified and is supportive.",
      urgency: "urgent",
      insuranceStatus: "has_insurance",
      status: "completed",
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 11,
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "0" }],
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "resolved",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-9 screener",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
            {
              type: "emergency_action",
              description: "Contacted parents",
              action: "contacted_parents",
            },
            {
              type: "status_changed",
              description: "Status changed from New to Resolved",
              statusChange: {
                from: "new",
                to: "resolved",
              },
            },
          ],
        },
      },
    ],
  },

  // 5. PHQ-A → Mild Depression
  {
    student: {
      firstName: "Jessica",
      lastName: "Brown",
      grade: 9,
      age: 14,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 8,
          specificAnswers: [{ questionCode: "PHQA_9", answerCode: "0" }],
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-A screener",
            },
          ],
        },
      },
    ],
  },
];
