/**
 * Multi-alert scenario definitions
 *
 * Scenarios for students with multiple concurrent alerts and mixed statuses.
 */

import type { TestScenario } from "../types";

export const multiAlertScenarios: TestScenario[] = [
  // 1. Student with Multiple Alerts (GAD-7 Anxiety + PHQ-9 Q9 Endorsed safety)
  {
    student: {
      firstName: "Multi",
      lastName: "Alerts",
      grade: 12,
      age: 18,
    },
    alerts: [
      // GAD-7 Anxiety Alert
      {
        screener: {
          type: "gad_7",
          targetScore: 14, // Moderate anxiety
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-7 screener",
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
            },
          ],
        },
      },
      // Single PHQ-9 completion: Q9 > 0 → safety alert only (no depression alert)
      {
        screener: {
          type: "phq_9",
          targetScore: 16,
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "2" }],
        },
        alert: {
          type: "safety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description:
                "Safety concern identified in PHQ-9 screener (Question 9 endorsed)",
            },
            {
              type: "emergency_action",
              description: "Contacted 988",
              action: "contacted_988",
            },
            {
              type: "emergency_action",
              description: "Contacted parents",
              action: "contacted_parents",
            },
          ],
        },
      },
      // Completed screeners with no alerts (regular assessments only)
      {
        screener: {
          type: "gad_7",
          targetScore: 3,
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        },
      },
      {
        screener: {
          type: "gad_7",
          targetScore: 6,
          completedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        },
      },
      {
        screener: {
          type: "phq_9",
          targetScore: 5,
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "0" }],
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      },
      {
        screener: {
          type: "phq_9",
          targetScore: 7,
          specificAnswers: [{ questionCode: "PHQ9_9", answerCode: "0" }],
          completedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 4 weeks ago
        },
      },
    ],
  },

  // 2. Student with Mixed Statuses (Resolved + New)
  {
    student: {
      firstName: "Mixed",
      lastName: "Status",
      grade: 10,
      age: 15,
    },
    alerts: [
      // PHQ-A Depression Alert - RESOLVED (Q9 = 0, so depression not safety)
      {
        screener: {
          type: "phq_a",
          targetScore: 12,
          specificAnswers: [{ questionCode: "PHQA_9", answerCode: "0" }],
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        alert: {
          type: "depression",
          source: "screener",
          status: "resolved",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          timeline: [
            {
              type: "alert_generated",
              description: "Depression concern identified in PHQ-A screener",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
              createdAt: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000 * 60 * 30,
              ), // 6.5 days ago
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
              statusChange: {
                from: "new",
                to: "in_progress",
              },
            },
            {
              type: "note_added",
              description: "Met with student to discuss coping strategies",
              noteContent:
                "Had a productive conversation with student. Discussed breathing exercises and journaling. Student seemed receptive and agreed to check in next week.",
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
            {
              type: "note_added",
              description: "Follow-up check-in",
              noteContent:
                "Student reports feeling better. Has been using journaling daily and says it helps. Will continue to monitor.",
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            },
            {
              type: "status_changed",
              description: "Status changed from In Progress to Resolved",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              statusChange: {
                from: "in_progress",
                to: "resolved",
              },
            },
          ],
        },
      },
      // GAD-Child Anxiety Alert - NEW (just happened)
      {
        screener: {
          type: "gad_child",
          targetScore: 10,
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "new",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-Child screener",
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
              createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
            },
          ],
        },
      },
    ],
  },
];
