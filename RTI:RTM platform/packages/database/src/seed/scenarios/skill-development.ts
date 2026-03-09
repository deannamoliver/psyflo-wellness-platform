/**
 * Skill development scenario definitions
 *
 * Scenarios for students with SEL screener data to populate skill development charts.
 * These show students with varying progression in different SEL domains over time.
 */

import type { TestScenario } from "../types";

export const skillDevelopmentScenarios: TestScenario[] = [
  // Student with strong progression across all domains (3 SEL screeners over time)
  {
    student: {
      firstName: "Maya",
      lastName: "Chen",
      grade: 10,
      age: 15,
    },
    moodCheckIns: [
      {
        universalEmotion: "happy",
        specificEmotion: "confident",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    selScreeners: [
      {
        completedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000), // ~20 weeks ago
        domainScores: {
          sel_self_awareness_self_concept: 2.0,
          sel_self_awareness_emotion_knowledge: 2.5,
          sel_social_awareness: 2.0,
          sel_self_management_emotion_regulation: 2.0,
          sel_self_management_goal_management: 2.5,
          sel_self_management_school_work: 2.0,
          sel_relationship_skills: 2.5,
          sel_responsible_decision_making: 2.0,
        },
      },
      {
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // ~10 weeks ago
        domainScores: {
          sel_self_awareness_self_concept: 2.5,
          sel_self_awareness_emotion_knowledge: 3.0,
          sel_social_awareness: 2.5,
          sel_self_management_emotion_regulation: 2.5,
          sel_self_management_goal_management: 3.0,
          sel_self_management_school_work: 2.5,
          sel_relationship_skills: 3.0,
          sel_responsible_decision_making: 2.5,
        },
      },
      {
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        domainScores: {
          sel_self_awareness_self_concept: 3.5,
          sel_self_awareness_emotion_knowledge: 3.5,
          sel_social_awareness: 3.0,
          sel_self_management_emotion_regulation: 3.5,
          sel_self_management_goal_management: 3.5,
          sel_self_management_school_work: 3.0,
          sel_relationship_skills: 3.5,
          sel_responsible_decision_making: 3.0,
        },
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 4, // Low mental health concerns
        },
      },
    ],
  },

  // Student with mixed progression (strong in some areas, weaker in others)
  {
    student: {
      firstName: "Jordan",
      lastName: "Smith",
      grade: 11,
      age: 16,
    },
    moodCheckIns: [
      {
        universalEmotion: "bad",
        specificEmotion: "stressed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    selScreeners: [
      {
        completedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.0,
          sel_self_awareness_emotion_knowledge: 2.5,
          sel_social_awareness: 3.0,
          sel_self_management_emotion_regulation: 2.0, // Weaker area
          sel_self_management_goal_management: 2.0, // Weaker area
          sel_self_management_school_work: 2.5,
          sel_relationship_skills: 3.5,
          sel_responsible_decision_making: 3.0,
        },
      },
      {
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.0,
          sel_self_awareness_emotion_knowledge: 2.5,
          sel_social_awareness: 3.5,
          sel_self_management_emotion_regulation: 2.0, // Still struggling
          sel_self_management_goal_management: 2.5, // Slight improvement
          sel_self_management_school_work: 2.5,
          sel_relationship_skills: 3.5,
          sel_responsible_decision_making: 3.0,
        },
      },
      {
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.0,
          sel_self_awareness_emotion_knowledge: 3.0,
          sel_social_awareness: 3.5,
          sel_self_management_emotion_regulation: 2.5, // Some improvement
          sel_self_management_goal_management: 3.0, // Improvement
          sel_self_management_school_work: 3.0,
          sel_relationship_skills: 4.0,
          sel_responsible_decision_making: 3.5,
        },
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 8, // Moderate depression
        },
      },
    ],
  },

  // Student with high baseline (already strong)
  {
    student: {
      firstName: "Aisha",
      lastName: "Patel",
      grade: 12,
      age: 17,
    },
    moodCheckIns: [
      {
        universalEmotion: "happy",
        specificEmotion: "peaceful",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
    ],
    selScreeners: [
      {
        completedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.5,
          sel_self_awareness_emotion_knowledge: 3.5,
          sel_social_awareness: 3.5,
          sel_self_management_emotion_regulation: 3.0,
          sel_self_management_goal_management: 3.5,
          sel_self_management_school_work: 3.5,
          sel_relationship_skills: 4.0,
          sel_responsible_decision_making: 3.5,
        },
      },
      {
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.5,
          sel_self_awareness_emotion_knowledge: 4.0,
          sel_social_awareness: 3.5,
          sel_self_management_emotion_regulation: 3.5,
          sel_self_management_goal_management: 4.0,
          sel_self_management_school_work: 3.5,
          sel_relationship_skills: 4.0,
          sel_responsible_decision_making: 4.0,
        },
      },
      {
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 4.0,
          sel_self_awareness_emotion_knowledge: 4.0,
          sel_social_awareness: 4.0,
          sel_self_management_emotion_regulation: 4.0,
          sel_self_management_goal_management: 4.0,
          sel_self_management_school_work: 4.0,
          sel_relationship_skills: 4.0,
          sel_responsible_decision_making: 4.0,
        },
      },
    ],
    alerts: [],
  },

  // Student with recent data only (2 screeners)
  {
    student: {
      firstName: "Carlos",
      lastName: "Rodriguez",
      grade: 9,
      age: 14,
    },
    moodCheckIns: [
      {
        universalEmotion: "happy",
        specificEmotion: "curious",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
    ],
    selScreeners: [
      {
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 2.5,
          sel_self_awareness_emotion_knowledge: 2.5,
          sel_social_awareness: 2.5,
          sel_self_management_emotion_regulation: 2.5,
          sel_self_management_goal_management: 2.5,
          sel_self_management_school_work: 2.5,
          sel_relationship_skills: 2.5,
          sel_responsible_decision_making: 2.5,
        },
      },
      {
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.0,
          sel_self_awareness_emotion_knowledge: 3.0,
          sel_social_awareness: 3.0,
          sel_self_management_emotion_regulation: 3.0,
          sel_self_management_goal_management: 3.0,
          sel_self_management_school_work: 3.0,
          sel_relationship_skills: 3.0,
          sel_responsible_decision_making: 3.0,
        },
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 5,
        },
      },
    ],
  },

  // Student showing decline (needs intervention)
  {
    student: {
      firstName: "Emma",
      lastName: "Thompson",
      grade: 10,
      age: 15,
    },
    moodCheckIns: [
      {
        universalEmotion: "sad",
        specificEmotion: "lonely",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
    ],
    selScreeners: [
      {
        completedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 3.0,
          sel_self_awareness_emotion_knowledge: 3.0,
          sel_social_awareness: 3.0,
          sel_self_management_emotion_regulation: 3.0,
          sel_self_management_goal_management: 3.0,
          sel_self_management_school_work: 3.0,
          sel_relationship_skills: 3.0,
          sel_responsible_decision_making: 3.0,
        },
      },
      {
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 2.5,
          sel_self_awareness_emotion_knowledge: 2.5,
          sel_social_awareness: 2.5,
          sel_self_management_emotion_regulation: 2.0,
          sel_self_management_goal_management: 2.5,
          sel_self_management_school_work: 2.0,
          sel_relationship_skills: 2.5,
          sel_responsible_decision_making: 2.5,
        },
      },
      {
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        domainScores: {
          sel_self_awareness_self_concept: 2.0,
          sel_self_awareness_emotion_knowledge: 2.0,
          sel_social_awareness: 2.0,
          sel_self_management_emotion_regulation: 1.5,
          sel_self_management_goal_management: 2.0,
          sel_self_management_school_work: 1.5,
          sel_relationship_skills: 2.0,
          sel_responsible_decision_making: 2.0,
        },
      },
    ],
    alerts: [
      {
        screener: {
          type: "phq_a",
          targetScore: 12, // Moderate-severe depression
          // Realistic answer pattern: some severe (3), some absent (0)
          // PHQA_1 (depressed mood) = 3, PHQA_2 (anhedonia) = 0, PHQA_3 (sleep) = 3,
          // PHQA_4 (appetite) = 0, PHQA_5 (fatigue) = 2, PHQA_6 (worthlessness) = 3,
          // PHQA_7 (concentration) = 0, PHQA_8 (psychomotor) = 1, PHQA_9 (suicidal) = 0
          // Total: 3+0+3+0+2+3+0+1+0 = 12
          specificAnswers: [
            { questionCode: "PHQA_1", answerCode: "3" }, // Nearly every day — depressed mood
            { questionCode: "PHQA_2", answerCode: "0" }, // Not at all — anhedonia
            { questionCode: "PHQA_3", answerCode: "3" }, // Nearly every day — sleep problems
            { questionCode: "PHQA_4", answerCode: "0" }, // Not at all — appetite
            { questionCode: "PHQA_5", answerCode: "2" }, // More than half — fatigue
            { questionCode: "PHQA_6", answerCode: "3" }, // Nearly every day — worthlessness
            { questionCode: "PHQA_7", answerCode: "0" }, // Not at all — concentration
            { questionCode: "PHQA_8", answerCode: "1" }, // Several days — psychomotor
            { questionCode: "PHQA_9", answerCode: "0" }, // Not at all — suicidal ideation
          ],
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
];
