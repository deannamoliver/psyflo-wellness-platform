/**
 * Anxiety scenario definitions
 *
 * Scenarios for students with anxiety alerts from GAD-Child and GAD-7 screeners.
 */

import type { TestScenario } from "../types";

export const anxietyScenarios: TestScenario[] = [
  // 1. GAD-Child → Anxiety Alert
  {
    student: {
      firstName: "Gadchild",
      lastName: "Anxiety",
      grade: 9,
      age: 14, // GAD-Child age range: 11-17
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 8, // Score >= 5 triggers alert
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-Child screener",
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

  // 2. GAD-7 → Anxiety Alert
  {
    student: {
      firstName: "Gad7",
      lastName: "Anxiety",
      grade: 12,
      age: 18, // GAD-7 age range: 18+
    },
    alerts: [
      {
        screener: {
          type: "gad_7",
          targetScore: 12, // Score >= 10 triggers alert
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
    ],
  },

  // 3. GAD-Child → Moderate Anxiety (In Progress) + therapist referral
  {
    student: {
      firstName: "Tyler",
      lastName: "Davis",
      grade: 10,
      age: 15,
    },
    therapistReferral: {
      reason: "anxiety",
      serviceTypes: ["individual_therapy"],
      additionalContext:
        "Student has been showing signs of social anxiety in class and avoidance of group activities.",
      urgency: "routine",
      insuranceStatus: "has_insurance",
      status: "in_progress",
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 9,
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "in_progress",
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-Child screener",
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
          ],
        },
      },
    ],
  },

  // 4. GAD-7 → Resolved Anxiety + therapist referral (matched/connected)
  {
    student: {
      firstName: "Rachel",
      lastName: "Kim",
      grade: 12,
      age: 18,
    },
    therapistReferral: {
      reason: "anxiety",
      serviceTypes: ["individual_therapy"],
      additionalContext:
        "Experiencing persistent test anxiety affecting academic performance.",
      urgency: "routine",
      insuranceStatus: "has_insurance",
      status: "matched",
      createdAt: new Date(Date.now() - 14 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "gad_7",
          targetScore: 11,
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "resolved",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-7 screener",
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
            {
              type: "note_added",
              description: "Discussed coping strategies",
              noteContent:
                "Student demonstrated good understanding of anxiety management techniques.",
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

  // 5. GAD-Child → Mild Anxiety
  {
    student: {
      firstName: "Alex",
      lastName: "Patel",
      grade: 9,
      age: 14,
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 6,
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-Child screener",
            },
          ],
        },
      },
    ],
  },
];
