/**
 * No-alerts scenario definitions
 *
 * Scenarios for students without alerts (low scores or no screeners).
 * These represent the healthy baseline population.
 */

import type { TestScenario } from "../types";

export const noAlertsScenarios: TestScenario[] = [
  // Students with low screener scores (below threshold) - Grade 9
  {
    student: {
      firstName: "Emily",
      lastName: "Jensen",
      grade: 9,
      age: 14,
    },
    moodCheckIns: [
      {
        universalEmotion: "happy",
        specificEmotion: "joyful",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 3, // Low score, no alert
        },
      },
    ],
  },
  {
    student: {
      firstName: "Liam",
      lastName: "Martinez",
      grade: 9,
      age: 14,
    },
    moodCheckIns: [
      {
        universalEmotion: "happy",
        specificEmotion: "confident",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
    ],
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 2, // Low score, no alert
        },
      },
    ],
  },
  {
    student: {
      firstName: "Olivia",
      lastName: "Garcia",
      grade: 9,
      age: 15,
    },
    moodCheckIns: [
      {
        universalEmotion: "surprised",
        specificEmotion: "excited",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      },
    ],
    alerts: [], // No screeners at all
  },

  // Grade 10 students
  {
    student: {
      firstName: "Noah",
      lastName: "Rodriguez",
      grade: 10,
      age: 15,
    },
    therapistReferral: {
      reason: "family_issues",
      serviceTypes: ["family_therapy"],
      additionalContext:
        "Parents going through divorce; student is struggling to cope.",
      urgency: "routine",
      insuranceStatus: "unknown",
      status: "matched",
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Ava",
      lastName: "Wilson",
      grade: 10,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 3,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Ethan",
      lastName: "Anderson",
      grade: 10,
      age: 15,
    },
    therapistReferral: {
      reason: "behavioral",
      serviceTypes: ["individual_therapy"],
      additionalContext:
        "Frequent outbursts in class and difficulty managing anger.",
      urgency: "routine",
      insuranceStatus: "uninsured",
      status: "submitted",
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
    alerts: [], // No screeners
  },
  {
    student: {
      firstName: "Sophia",
      lastName: "Thomas",
      grade: 10,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 2,
        },
      },
      {
        screener: {
          type: "gad_child",
          targetScore: 1,
        },
      },
    ],
  },

  // Grade 11 students
  {
    student: {
      firstName: "Mason",
      lastName: "Taylor",
      grade: 11,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 5,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Isabella",
      lastName: "Moore",
      grade: 11,
      age: 17,
    },
    therapistReferral: {
      reason: "grief_loss",
      serviceTypes: ["individual_therapy"],
      additionalContext:
        "Recently lost a grandparent; showing signs of prolonged grief.",
      urgency: "routine",
      insuranceStatus: "has_insurance",
      status: "in_progress",
      createdAt: new Date(Date.now() - 7 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Lucas",
      lastName: "Jackson",
      grade: 11,
      age: 16,
    },
    alerts: [], // No screeners
  },
  {
    student: {
      firstName: "Mia",
      lastName: "Martin",
      grade: 11,
      age: 17,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 3,
        },
      },
    ],
  },

  // Grade 12 students (18+, using adult screeners)
  {
    student: {
      firstName: "Charlotte",
      lastName: "Lee",
      grade: 12,
      age: 18,
    },
    therapistReferral: {
      reason: "substance_use",
      serviceTypes: ["individual_therapy", "psychiatric_services"],
      additionalContext:
        "Reports of vaping and possible substance experimentation.",
      urgency: "urgent",
      insuranceStatus: "unknown",
      status: "matched",
      createdAt: new Date(Date.now() - 14 * 86400000),
    },
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "James",
      lastName: "Perez",
      grade: 12,
      age: 18,
    },
    alerts: [
      {
        screener: {
          type: "gad_7",
          targetScore: 5,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Amelia",
      lastName: "Thompson",
      grade: 12,
      age: 17,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Benjamin",
      lastName: "White",
      grade: 12,
      age: 18,
    },
    therapistReferral: {
      reason: "other",
      serviceTypes: ["psychiatric_services"],
      additionalContext:
        "Family requested cancellation; pursuing private care.",
      urgency: "routine",
      insuranceStatus: "has_insurance",
      status: "cancelled",
      createdAt: new Date(Date.now() - 15 * 86400000),
    },
    alerts: [], // No screeners
  },
  {
    student: {
      firstName: "Harper",
      lastName: "Harris",
      grade: 12,
      age: 18,
    },
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 3,
        },
      },
      {
        screener: {
          type: "gad_7",
          targetScore: 6,
        },
      },
    ],
  },

  // Additional diverse students across grades
  {
    student: {
      firstName: "Elijah",
      lastName: "Sanchez",
      grade: 9,
      age: 14,
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Evelyn",
      lastName: "Clark",
      grade: 10,
      age: 15,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 2,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Alexander",
      lastName: "Ramirez",
      grade: 11,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 3,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Abigail",
      lastName: "Lewis",
      grade: 12,
      age: 18,
    },
    alerts: [
      {
        screener: {
          type: "phq_9",
          targetScore: 5,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Michael",
      lastName: "Robinson",
      grade: 9,
      age: 15,
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Emily",
      lastName: "Walker",
      grade: 10,
      age: 16,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Daniel",
      lastName: "Hall",
      grade: 11,
      age: 17,
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 2,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Elizabeth",
      lastName: "Allen",
      grade: 12,
      age: 18,
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Matthew",
      lastName: "Young",
      grade: 9,
      age: 14,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 3,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Sofia",
      lastName: "Hernandez",
      grade: 10,
      age: 15,
    },
    alerts: [
      {
        screener: {
          type: "gad_child",
          targetScore: 4,
        },
      },
    ],
  },
  {
    student: {
      firstName: "Joseph",
      lastName: "King",
      grade: 11,
      age: 16,
    },
    alerts: [],
  },
  {
    student: {
      firstName: "Avery",
      lastName: "Wright",
      grade: 12,
      age: 17,
    },
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 5,
        },
      },
    ],
  },
];
