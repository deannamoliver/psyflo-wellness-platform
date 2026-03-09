/**
 * Progression scenario definitions
 *
 * Scenarios for students showing improvement or decline over time with multiple screeners.
 */

import type { TestScenario } from "../types";

export const progressionScenarios: TestScenario[] = [
  // 1. Student with Multiple Instances of Same Screener (GAD-7 taken 3 times) - Showing Improvement
  {
    student: {
      firstName: "Repeat",
      lastName: "Screener",
      grade: 12,
      age: 18,
    },
    alerts: [
      // GAD-7 Instance 1 - 3 weeks ago, SEVERE, RESOLVED
      {
        screener: {
          type: "gad_7",
          targetScore: 16, // Severe anxiety
          completedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "resolved",
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description: "Anxiety concern identified in GAD-7 screener",
              createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            },
            {
              type: "emergency_action",
              description: "Notified staff",
              action: "notified_staff",
              createdAt: new Date(
                Date.now() - 21 * 24 * 60 * 60 * 1000 + 1000 * 60 * 60,
              ), // 1 hour later
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
              statusChange: {
                from: "new",
                to: "in_progress",
              },
            },
            {
              type: "note_added",
              description: "Initial counseling session",
              noteContent:
                "Student expressed feeling overwhelmed with college applications and family expectations. Started cognitive behavioral techniques.",
              createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
            },
            {
              type: "emergency_action",
              description: "Triggered follow-up GAD-7",
              action: "triggered_gad7",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Triggered 2nd screener
            },
            {
              type: "status_changed",
              description: "Status changed from In Progress to Resolved",
              createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
              statusChange: {
                from: "in_progress",
                to: "resolved",
              },
            },
          ],
        },
      },
      // GAD-7 Instance 2 - 2 weeks ago, MODERATE, RESOLVED
      {
        screener: {
          type: "gad_7",
          targetScore: 12, // Moderate anxiety (improvement!)
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "resolved",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description: "Follow-up anxiety concern in GAD-7 screener",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
            {
              type: "note_added",
              description: "Progress check-in",
              noteContent:
                "Student showing improvement. Reports using coping strategies effectively. Still some anxiety around exams but manageable.",
              createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
              statusChange: {
                from: "new",
                to: "in_progress",
              },
            },
            {
              type: "emergency_action",
              description: "Triggered follow-up GAD-7",
              action: "triggered_gad7",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Triggered 3rd screener
            },
            {
              type: "status_changed",
              description: "Status changed from In Progress to Resolved",
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              statusChange: {
                from: "in_progress",
                to: "resolved",
              },
            },
          ],
        },
      },
      // GAD-7 Instance 3 - 1 day ago, MILD, NEW
      {
        screener: {
          type: "gad_7",
          targetScore: 8, // Mild anxiety (continued improvement!)
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        alert: {
          type: "anxiety",
          source: "screener",
          status: "new",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description:
                "Continued monitoring - mild anxiety in GAD-7 screener",
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
              type: "note_added",
              description: "Routine follow-up",
              noteContent:
                "Student continues to improve. Anxiety levels decreasing steadily. Will continue monitoring but intervention seems effective.",
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            },
          ],
        },
      },
    ],
  },
];
