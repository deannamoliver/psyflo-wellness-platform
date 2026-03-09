export type SessionSentiment = "positive" | "neutral" | "negative" | "mixed";

export type SessionMood = "Happy" | "Calm" | "Anxious" | "Sad" | "Stressed" | "Hopeful" | "Frustrated" | "Neutral";

export type SessionActivity = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  durationMinutes: number;
  sentiment: SessionSentiment;
  mood: SessionMood;
  summary: string;
  mentalHealthContributors: string[];
  activities: string[];
};

const PATIENT_NAMES = [
  "Abigail Lewis", "Aisha Patel", "Alex Martinez", "Alex Patel",
  "Alexander Ramirez", "Amelia Thompson", "Avo Wilson", "Avery Wright",
  "Benjamin White", "Chloe Davis", "Daniel Kim", "Emma Johnson",
  "Ethan Brown", "Grace Lee", "Isabella Garcia", "Jackson Moore",
  "Liam Taylor", "Mia Anderson", "Noah Thomas", "Olivia Robinson",
];

const SUMMARIES = [
  "Patient discussed school-related stress and practiced deep breathing exercises. Showed improvement in identifying triggers.",
  "Completed anxiety management module and journaled about recent social interactions. Expressed feeling more confident.",
  "Explored coping strategies for family conflict. Patient engaged well with the guided meditation exercise.",
  "Reviewed progress on mood tracking. Patient reported fewer episodes of sadness this week. Practiced gratitude journaling.",
  "Worked through CBT thought record exercise. Identified cognitive distortions related to peer relationships.",
  "Patient completed the mindfulness body scan exercise. Discussed sleep hygiene improvements and set new goals.",
  "Focused on emotion regulation skills. Patient practiced the STOP technique and reported using it twice this week.",
  "Reviewed academic stress management plan. Patient completed focus exercises and reported improved concentration.",
  "Explored self-esteem building activities. Patient responded positively to strengths identification exercise.",
  "Discussed recent bullying incident. Patient practiced assertiveness skills and role-played responses.",
  "Completed trauma-informed grounding exercise. Patient reported reduced frequency of intrusive thoughts.",
  "Worked on social skills development through scenario-based exercises. Patient showed strong engagement.",
  "Patient completed mood check-in and discussed family dynamics. Practiced progressive muscle relaxation.",
  "Reviewed safety plan and coping card. Patient reported no safety concerns. Updated wellness goals.",
  "Focused on building resilience through positive self-talk exercises. Patient created personal affirmation list.",
  "Discussed boundary-setting with peers. Patient identified two situations where boundaries were needed and role-played responses.",
  "Reviewed sleep journal entries. Patient has been maintaining consistent bedtime. Discussed managing nighttime anxiety.",
  "Worked on exposure hierarchy for social situations. Patient completed step 3 of 10. Reported moderate anxiety but managed well.",
  "Explored values clarification exercise. Patient identified top 5 personal values and discussed how they relate to current challenges.",
  "Conducted behavioral activation planning. Patient committed to three pleasant activities for the coming week.",
  "Discussed medication adherence and side effects. Patient reports improved mood since dosage adjustment two weeks ago.",
  "Practiced mindful eating exercise during session. Discussed relationship between stress and eating patterns.",
  "Reviewed crisis management plan. Updated emergency contacts and practiced using the 988 Lifeline number.",
  "Worked on anger management using the traffic light model. Patient identified physical warning signs of anger escalation.",
  "Explored grief and loss through narrative therapy exercise. Patient wrote a letter to a loved one and processed emotions.",
];

const MENTAL_HEALTH_CONTRIBUTORS = [
  ["Academic Pressure", "Peer Relationships"],
  ["Family Conflict", "Sleep Issues"],
  ["Social Anxiety", "Low Self-Esteem"],
  ["Bullying", "Isolation"],
  ["Grief/Loss", "Academic Pressure"],
  ["Trauma History", "Anxiety"],
  ["Depression", "Sleep Issues"],
  ["ADHD Symptoms", "Academic Pressure"],
  ["Family Conflict", "Peer Relationships"],
  ["Social Media Impact", "Body Image"],
  ["Perfectionism", "Academic Pressure"],
  ["Separation Anxiety", "School Avoidance"],
];

const ACTIVITIES_LIST = [
  ["Chat Conversation", "Deep Breathing Exercise"],
  ["Chat Conversation", "Anxiety Management Module"],
  ["Guided Meditation", "Chat Conversation"],
  ["Mood Tracking", "Gratitude Journaling"],
  ["CBT Thought Record", "Chat Conversation"],
  ["Mindfulness Body Scan", "Sleep Hygiene Module"],
  ["Emotion Regulation Exercise", "Chat Conversation"],
  ["Focus Exercise", "Chat Conversation"],
  ["Strengths Identification", "Self-Esteem Module"],
  ["Chat Conversation", "Assertiveness Training"],
  ["Grounding Exercise", "Chat Conversation"],
  ["Social Skills Scenario", "Chat Conversation"],
  ["Progressive Muscle Relaxation", "Chat Conversation"],
  ["Safety Plan Review", "Coping Card Update"],
  ["Positive Self-Talk Exercise", "Chat Conversation"],
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateMockSessions(): SessionActivity[] {
  const sessions: SessionActivity[] = [];
  const rand = seededRandom(42);
  const sentiments: SessionSentiment[] = ["positive", "neutral", "negative", "mixed"];
  const moods: SessionMood[] = ["Happy", "Calm", "Anxious", "Sad", "Stressed", "Hopeful", "Frustrated", "Neutral"];

  // Generate 150 sessions across the last 90 days
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const date = new Date(2026, 1, 23 - daysAgo);
    const hour = 8 + Math.floor(rand() * 9);
    const minute = Math.floor(rand() * 4) * 15;
    const patientIdx = Math.floor(rand() * PATIENT_NAMES.length);
    const summaryIdx = Math.floor(rand() * SUMMARIES.length);
    const contributorIdx = Math.floor(rand() * MENTAL_HEALTH_CONTRIBUTORS.length);
    const activitiesIdx = Math.floor(rand() * ACTIVITIES_LIST.length);

    sessions.push({
      id: `SES-${String(2400 + i).padStart(4, "0")}`,
      patientId: `patient-${patientIdx}`,
      patientName: PATIENT_NAMES[patientIdx]!,
      date: date.toISOString().split("T")[0]!,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      durationMinutes: 10 + Math.floor(rand() * 50),
      sentiment: sentiments[Math.floor(rand() * sentiments.length)]!,
      mood: moods[Math.floor(rand() * moods.length)]!,
      summary: SUMMARIES[summaryIdx]!,
      mentalHealthContributors: MENTAL_HEALTH_CONTRIBUTORS[contributorIdx]!,
      activities: ACTIVITIES_LIST[activitiesIdx]!,
    });
  }

  // Sort by date descending, then time descending
  sessions.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });

  return sessions;
}
