/**
 * Chat-alert scenario definitions
 *
 * Scenarios for alerts triggered from chat interactions, not screeners.
 * These create chat_sessions + chat_alerts records linked to parent alerts.
 */

import type { TestScenario } from "../types";

export const chatAlertsScenarios: TestScenario[] = [
  // 1. Direct risk — chat shut down immediately, safety alert (new)
  {
    student: {
      firstName: "Marcus",
      lastName: "Rivera",
      grade: 11,
      age: 16,
    },
    moodCheckIns: [
      {
        universalEmotion: "sad",
        specificEmotion: "empty",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
    ],
    alerts: [
      {
        alert: {
          type: "safety",
          source: "chat",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description:
                "Direct suicidal ideation detected in chat. Chatbot terminated immediately.",
            },
            {
              type: "emergency_action",
              description: "988 Lifeline information provided to student",
              action: "contacted_988",
            },
          ],
          chatAlert: {
            triggeringStatement:
              "I don't want to be here anymore. I've been thinking about ending things.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "Hey Marcus! How are you feeling today?",
              },
              {
                role: "user",
                content: "Not great. Everything feels pointless lately.",
              },
              {
                role: "assistant",
                content:
                  "I'm sorry to hear that. Can you tell me more about what's been going on?",
              },
              {
                role: "user",
                content:
                  "I don't want to be here anymore. I've been thinking about ending things.",
              },
            ]),
            shutdownRiskType: "direct",
            isShutdown: true,
          },
        },
      },
    ],
  },

  // 2. Indirect risk — CSSR screening completed, elevated risk, chat shut down
  {
    student: {
      firstName: "Leila",
      lastName: "Hassan",
      grade: 10,
      age: 15,
    },
    moodCheckIns: [
      {
        universalEmotion: "bad",
        specificEmotion: "overwhelmed",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
      {
        universalEmotion: "sad",
        specificEmotion: "lonely",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    alerts: [
      {
        alert: {
          type: "safety",
          source: "chat",
          status: "in_progress",
          timeline: [
            {
              type: "alert_generated",
              description:
                "Indirect risk themes detected. CSSR screening completed — elevated risk identified.",
            },
            {
              type: "emergency_action",
              description: "Contacted parents/guardians",
              action: "contacted_parents",
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              statusChange: { from: "new", to: "in_progress" },
            },
            {
              type: "note_added",
              description: "Counselor notes after parent contact",
              noteContent:
                "Spoke with mother. Student has been withdrawn at home as well. Scheduling follow-up meeting for tomorrow.",
            },
          ],
          chatAlert: {
            triggeringStatement:
              "Sometimes I wonder if anyone would even notice if I just disappeared.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "Hi Leila! What's on your mind today?",
              },
              {
                role: "user",
                content:
                  "I've just been feeling really low. Like nothing matters.",
              },
              {
                role: "assistant",
                content:
                  "That sounds really tough. How long have you been feeling this way?",
              },
              {
                role: "user",
                content:
                  "Sometimes I wonder if anyone would even notice if I just disappeared.",
              },
            ]),
            shutdownRiskType: "indirect",
            isShutdown: true,
            cssrState: {
              q1: {
                answer: true,
                questionText:
                  "Have you wished you were dead or wished you could go to sleep and not wake up?",
              },
              q2: {
                answer: true,
                questionText:
                  "Have you actually had any thoughts of killing yourself?",
              },
              q3: {
                answer: false,
                questionText:
                  "Have you been thinking about how you might do this?",
              },
              q4: {
                answer: false,
                questionText:
                  "Have you had these thoughts and had some intention of acting on them?",
              },
              q5: {
                answer: false,
                questionText:
                  "Have you started to work out the details of how to kill yourself?",
              },
              q6: {
                answer: false,
                questionText: "Have you ever done anything to end your life?",
              },
              currentQuestion: null,
            },
          },
        },
      },
    ],
  },

  // 3. Ambiguous risk — clarification questions asked, resolved as low risk by chatbot
  {
    student: {
      firstName: "Tyler",
      lastName: "Nguyen",
      grade: 12,
      age: 17,
    },
    alerts: [
      {
        alert: {
          type: "safety",
          source: "chat",
          status: "resolved",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description:
                "Ambiguous risk patterns detected. Clarification revealed low actual risk. Auto-resolved.",
            },
          ],
          chatAlert: {
            triggeringStatement:
              "I'm so dead if I fail this test. My parents will kill me.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "How's your day going, Tyler?",
              },
              {
                role: "user",
                content:
                  "Terrible. I have a huge exam tomorrow and I haven't studied at all.",
              },
              {
                role: "assistant",
                content: "That sounds stressful. What subject is it for?",
              },
              {
                role: "user",
                content:
                  "I'm so dead if I fail this test. My parents will kill me.",
              },
            ]),
            shutdownRiskType: "ambiguous",
            isShutdown: false,
            clarificationResponses: {
              A: {
                question:
                  "When you say you're 'dead', are you talking about being in trouble with your parents, or are you having thoughts of hurting yourself?",
                response:
                  "Oh no, I just mean my parents are going to be really upset. I'm stressed about the grade, not like... that.",
                riskAssessment: "low_risk",
                reasoning:
                  "Student clarified the statement was figurative, expressing academic stress and fear of parental disappointment.",
              },
            },
          },
        },
      },
    ],
  },

  // 4. Abuse/neglect detected in chat — new alert
  {
    student: {
      firstName: "Jade",
      lastName: "Washington",
      grade: 9,
      age: 14,
    },
    moodCheckIns: [
      {
        universalEmotion: "afraid",
        specificEmotion: "scared",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      },
    ],
    alerts: [
      {
        alert: {
          type: "abuse_neglect",
          source: "chat",
          status: "new",
          timeline: [
            {
              type: "alert_generated",
              description:
                "Potential abuse/neglect situation detected in chat conversation.",
            },
            {
              type: "emergency_action",
              description: "School staff notified of potential abuse/neglect",
              action: "notified_staff",
            },
          ],
          chatAlert: {
            triggeringStatement:
              "My stepdad hits me when he gets angry. He did it again last night and I have a bruise on my arm.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "Hi Jade, how are you doing today?",
              },
              {
                role: "user",
                content: "Not good. I didn't sleep well last night.",
              },
              {
                role: "assistant",
                content: "I'm sorry to hear that. What kept you up?",
              },
              {
                role: "user",
                content:
                  "My stepdad hits me when he gets angry. He did it again last night and I have a bruise on my arm.",
              },
            ]),
            shutdownRiskType: "abuse_neglect",
            isShutdown: true,
          },
        },
      },
    ],
  },

  // 5. Harm to others detected — in progress
  {
    student: {
      firstName: "Derek",
      lastName: "Simmons",
      grade: 11,
      age: 16,
    },
    alerts: [
      {
        alert: {
          type: "harm_to_others",
          source: "chat",
          status: "in_progress",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description:
                "Potential harm to others detected in chat. Student expressed violent intentions toward a peer.",
            },
            {
              type: "emergency_action",
              description: "School administration notified",
              action: "notified_staff",
            },
            {
              type: "status_changed",
              description: "Status changed from New to In Progress",
              statusChange: { from: "new", to: "in_progress" },
            },
          ],
          chatAlert: {
            triggeringStatement:
              "I want to hurt him so bad. He keeps bullying me every day and I'm going to snap.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "Hey Derek, what's going on?",
              },
              {
                role: "user",
                content:
                  "This kid at school won't leave me alone. He keeps pushing me around.",
              },
              {
                role: "assistant",
                content:
                  "That sounds really difficult. Being bullied is never okay. How are you feeling about it?",
              },
              {
                role: "user",
                content:
                  "I want to hurt him so bad. He keeps bullying me every day and I'm going to snap.",
              },
            ]),
            shutdownRiskType: "harm_to_others",
            isShutdown: true,
          },
        },
      },
    ],
  },

  // 6. Indirect risk — CSSR low risk, auto-resolved
  {
    student: {
      firstName: "Priya",
      lastName: "Sharma",
      grade: 10,
      age: 15,
    },
    alerts: [
      {
        alert: {
          type: "safety",
          source: "chat",
          status: "resolved",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              type: "alert_generated",
              description:
                "Indirect risk themes detected. CSSR screening completed — low risk. Auto-resolved by chatbot.",
            },
          ],
          chatAlert: {
            triggeringStatement:
              "Sometimes I feel like things would be easier if I could just sleep forever.",
            conversationContext: JSON.stringify([
              {
                role: "assistant",
                content: "Hi Priya! How's your week been?",
              },
              {
                role: "user",
                content: "Exhausting. I'm just so tired of everything.",
              },
              {
                role: "assistant",
                content:
                  "It sounds like you're dealing with a lot. What's been weighing on you the most?",
              },
              {
                role: "user",
                content:
                  "Sometimes I feel like things would be easier if I could just sleep forever.",
              },
            ]),
            shutdownRiskType: "indirect",
            isShutdown: false,
            cssrState: {
              q1: {
                answer: true,
                questionText:
                  "Have you wished you were dead or wished you could go to sleep and not wake up?",
              },
              q2: {
                answer: false,
                questionText:
                  "Have you actually had any thoughts of killing yourself?",
              },
              q3: {
                answer: false,
                questionText:
                  "Have you been thinking about how you might do this?",
              },
              currentQuestion: null,
            },
          },
        },
      },
    ],
  },
];
