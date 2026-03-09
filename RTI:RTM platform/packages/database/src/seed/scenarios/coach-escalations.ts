/**
 * Coach escalation report scenarios
 *
 * Scenarios for safety reports submitted by wellness coaches, not from chat/screeners.
 * These create coach_safety_reports records with detailed action information.
 */

import type { TestScenario } from "../types";

export const coachEscalationScenarios: TestScenario[] = [
  // 1. Coach Escalation Report - Self-Harm Risk (matches the image)
  {
    student: {
      firstName: "Alex",
      lastName: "Martinez",
      grade: 10,
      age: 15,
    },
    moodCheckIns: [
      {
        universalEmotion: "sad",
        specificEmotion: "empty",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    alerts: [
      {
        alert: {
          type: "safety",
          source: "coach",
          status: "in_progress",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description:
                "Student expressed thoughts of self-harm during PE class. Coach noticed cuts on forearms and student appeared withdrawn. Student refused to talk about it initially but later admitted to struggling with depression and suicidal ideation.",
            },
            {
              type: "emergency_action",
              description:
                "Phone call • Mother • Maria Rodriguez • 1:35 PM\nParent will pick up student immediately",
              action: "contacted_parents",
            },
            {
              type: "emergency_action",
              description: "1:40 PM • Dispatched Crisis Team",
              action: "emergency_services_contacted",
            },
            {
              type: "emergency_action",
              description:
                "Phone call • Principal Johnson • 1:32 PM\nNo answer, left message",
              action: "notified_staff",
            },
            {
              type: "emergency_action",
              description: "1:40 PM • Report #36259 • Physical Abuse",
              action: "cps_notified",
            },
            {
              type: "emergency_action",
              description: "",
              action: "assessment_performed",
            },
          ],
          chatAlert: {
            triggeringStatement: "I just want to do",
            conversationContext:
              "Student expressed thoughts of self-harm during PE class. Coach noticed cuts on forearms and student appeared withdrawn. Student refused to talk about it initially but later admitted to struggling with depression and suicidal ideation.",
            shutdownRiskType: "direct",
            isShutdown: true,
            cssrState: {
              q1: true,
              q2: true,
              q3: true,
              q4: true,
              q5: true,
              q6: true,
            },
          },
        },
      },
    ],
  },
];
