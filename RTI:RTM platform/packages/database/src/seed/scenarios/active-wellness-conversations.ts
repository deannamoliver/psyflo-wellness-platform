/**
 * Active wellness coach conversation scenarios
 *
 * Students with active conversations with the wellness coach.
 * These appear in the counselor dashboard under "Active Conversations".
 */

import type { TestScenario } from "../types";

export const activeWellnessConversationsScenarios: TestScenario[] = [
  {
    student: {
      firstName: "Emma",
      lastName: "Johnson",
      grade: 10,
      age: 15,
    },
    activeWellnessConversation: {
      topic: "Stress & Anxiety",
      reason:
        "Student expressed feeling overwhelmed and requested to speak with a wellness coach",
      status: "in_progress",
      lastMessageFrom: "coach",
      studentReply:
        "I've been feeling really stressed lately with all my schoolwork piling up. I don't know how to manage everything.",
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Liam",
      lastName: "Williams",
      grade: 11,
      age: 16,
    },
    activeWellnessConversation: {
      topic: "Academic Pressure",
      reason:
        "Student mentioned persistent anxiety symptoms and wanted support",
      status: "accepted",
      lastMessageFrom: "student",
      studentReply:
        "Thanks for reaching out. I've been having trouble sleeping because I keep worrying about upcoming tests.",
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Sophia",
      lastName: "Brown",
      grade: 9,
      age: 14,
    },
    activeWellnessConversation: {
      topic: "Social Relationships",
      reason: "Student asked for help with stress management techniques",
      status: "accepted",
      lastMessageFrom: "student",
      studentReply:
        "I've been feeling a bit down lately. Some things happened with my friends and I'm not sure how to handle it.",
    },
    alerts: [],
  },
];
