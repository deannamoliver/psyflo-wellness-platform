export type RTMPatient = {
  id: string;
  name: string;
  email: string;
  enrolledDate: string;
  setupComplete: boolean;
  educationComplete: boolean;
  dataCollectionDays: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  clinicianMinutesLogged: number;
  interactiveCommunications: number;
  lastCommunicationDate: string | null;
  status: "active" | "paused" | "completed";
  diagnosis: string;
  treatmentPlan: TreatmentPlan | null;
};

export type RealStudent = {
  id: string;
  name: string;
};

export type TreatmentPlan = {
  id: string;
  title: string;
  goals: string[];
  startDate: string;
  reviewDate: string;
  notes: string;
  activities: Activity[];
};

export type Activity = {
  id: string;
  name: string;
  category: "exercise" | "mindfulness" | "journaling" | "social" | "sleep" | "coping";
  frequency: string;
  description: string;
  assigned: boolean;
  completionsThisPeriod: number;
  targetCompletions: number;
};

export type TimeEntry = {
  id: string;
  date: string;
  minutes: number;
  description: string;
  type: "data_review" | "communication" | "plan_update";
};

export type CommunicationEntry = {
  id: string;
  date: string;
  type: "chat" | "video" | "phone" | "in_app_message";
  duration: number;
  summary: string;
};

const ACTIVITY_LIBRARY: Activity[] = [
  {
    id: "act-1",
    name: "Daily Mood Journal",
    category: "journaling",
    frequency: "Daily",
    description: "Record mood, triggers, and coping strategies used throughout the day.",
    assigned: true,
    completionsThisPeriod: 18,
    targetCompletions: 30,
  },
  {
    id: "act-2",
    name: "Guided Breathing Exercise",
    category: "mindfulness",
    frequency: "2x Daily",
    description: "5-minute guided breathing exercise focusing on 4-7-8 technique.",
    assigned: true,
    completionsThisPeriod: 24,
    targetCompletions: 60,
  },
  {
    id: "act-3",
    name: "Progressive Muscle Relaxation",
    category: "exercise",
    frequency: "Daily",
    description: "15-minute progressive muscle relaxation session before bed.",
    assigned: true,
    completionsThisPeriod: 12,
    targetCompletions: 30,
  },
  {
    id: "act-4",
    name: "Gratitude List",
    category: "journaling",
    frequency: "Daily",
    description: "Write down 3 things you are grateful for each morning.",
    assigned: false,
    completionsThisPeriod: 0,
    targetCompletions: 30,
  },
  {
    id: "act-5",
    name: "Social Connection Activity",
    category: "social",
    frequency: "3x Weekly",
    description: "Engage in a meaningful social interaction (call a friend, attend a group, etc.).",
    assigned: false,
    completionsThisPeriod: 0,
    targetCompletions: 12,
  },
  {
    id: "act-6",
    name: "Sleep Hygiene Checklist",
    category: "sleep",
    frequency: "Daily",
    description: "Complete nightly sleep hygiene checklist: no screens 30min before bed, consistent bedtime, etc.",
    assigned: true,
    completionsThisPeriod: 20,
    targetCompletions: 30,
  },
  {
    id: "act-7",
    name: "Cognitive Restructuring Worksheet",
    category: "coping",
    frequency: "As Needed",
    description: "When experiencing negative automatic thoughts, complete a thought record worksheet.",
    assigned: false,
    completionsThisPeriod: 0,
    targetCompletions: 8,
  },
  {
    id: "act-8",
    name: "Mindful Walking",
    category: "mindfulness",
    frequency: "3x Weekly",
    description: "20-minute mindful walking exercise, focusing on sensory awareness.",
    assigned: false,
    completionsThisPeriod: 0,
    targetCompletions: 12,
  },
  {
    id: "act-9",
    name: "Grounding Technique Practice",
    category: "coping",
    frequency: "Daily",
    description: "Practice 5-4-3-2-1 grounding technique when feeling anxious or overwhelmed.",
    assigned: true,
    completionsThisPeriod: 15,
    targetCompletions: 30,
  },
  {
    id: "act-10",
    name: "Physical Activity Log",
    category: "exercise",
    frequency: "4x Weekly",
    description: "30 minutes of moderate physical activity (walking, swimming, yoga, etc.).",
    assigned: false,
    completionsThisPeriod: 0,
    targetCompletions: 16,
  },
];

// RTM overlay data keyed by student name (matched to real DB profiles)
type RTMOverlay = Omit<RTMPatient, "id" | "name">;

const RTM_OVERLAYS: Record<string, RTMOverlay> = {
  "Sarah Mitchell": {
    email: "sarah.m@example.com",
    enrolledDate: "2025-12-01",
    setupComplete: true,
    educationComplete: true,
    dataCollectionDays: 22,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 35,
    interactiveCommunications: 3,
    lastCommunicationDate: "2026-02-18",
    status: "active",
    diagnosis: "Generalized Anxiety Disorder (GAD)",
    treatmentPlan: {
      id: "tp-1",
      title: "Anxiety Management Plan",
      goals: [
        "Reduce GAD-7 score from 14 to below 10 within 8 weeks",
        "Develop 3 effective coping strategies for anxiety episodes",
        "Improve sleep quality to 6+ hours per night",
      ],
      startDate: "2025-12-01",
      reviewDate: "2026-03-01",
      notes: "Patient is responding well to CBT-based interventions. Showing consistent engagement with daily mood tracking and breathing exercises. Consider stepping down frequency if GAD-7 continues to improve.",
      activities: ACTIVITY_LIBRARY.filter((a) => a.assigned),
    },
  },
  "David Chen": {
    email: "david.c@example.com",
    enrolledDate: "2026-01-15",
    setupComplete: true,
    educationComplete: true,
    dataCollectionDays: 18,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 25,
    interactiveCommunications: 2,
    lastCommunicationDate: "2026-02-15",
    status: "active",
    diagnosis: "Major Depressive Disorder (MDD) - Moderate",
    treatmentPlan: {
      id: "tp-2",
      title: "Depression Recovery Plan",
      goals: [
        "Reduce PHQ-9 score from 16 to below 10 within 12 weeks",
        "Establish consistent daily routine with sleep hygiene",
        "Increase social engagement to 3+ interactions per week",
      ],
      startDate: "2026-01-15",
      reviewDate: "2026-04-15",
      notes: "Patient started strong but engagement dipped in week 3. Addressed barriers during last session — transportation and motivation. Added social connection activity to plan.",
      activities: [ACTIVITY_LIBRARY[0]!, ACTIVITY_LIBRARY[5]!, ACTIVITY_LIBRARY[4]!].map((a) => ({ ...a, assigned: true })),
    },
  },
  "Jessica Brown": {
    email: "jessica.b@example.com",
    enrolledDate: "2026-02-01",
    setupComplete: true,
    educationComplete: true,
    dataCollectionDays: 14,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 18,
    interactiveCommunications: 1,
    lastCommunicationDate: "2026-02-10",
    status: "active",
    diagnosis: "PTSD - Childhood Trauma",
    treatmentPlan: {
      id: "tp-3",
      title: "Trauma Recovery & Stabilization",
      goals: [
        "Reduce PCL-5 score by 10+ points within 16 weeks",
        "Develop grounding techniques for flashback management",
        "Establish safety plan and crisis coping strategies",
      ],
      startDate: "2026-02-01",
      reviewDate: "2026-05-01",
      notes: "Early in treatment. Focus on stabilization and psychoeducation before trauma processing. Patient is engaged but needs more support with grounding techniques.",
      activities: [ACTIVITY_LIBRARY[8]!, ACTIVITY_LIBRARY[2]!, ACTIVITY_LIBRARY[1]!].map((a) => ({ ...a, assigned: true, completionsThisPeriod: Math.floor(a.completionsThisPeriod * 0.6) })),
    },
  },
  "Tyler Davis": {
    email: "tyler.d@example.com",
    enrolledDate: "2025-11-01",
    setupComplete: true,
    educationComplete: true,
    dataCollectionDays: 8,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 12,
    interactiveCommunications: 1,
    lastCommunicationDate: "2026-02-05",
    status: "active",
    diagnosis: "Social Anxiety Disorder",
    treatmentPlan: {
      id: "tp-4",
      title: "Social Anxiety Exposure Plan",
      goals: [
        "Complete graduated exposure hierarchy (10 steps)",
        "Reduce avoidance behaviors by 50%",
        "Attend 1 social event per week without safety behaviors",
      ],
      startDate: "2025-11-01",
      reviewDate: "2026-03-01",
      notes: "Patient struggling with engagement this month. Missed last scheduled check-in. Need to follow up and assess barriers. May need to adjust plan difficulty.",
      activities: [ACTIVITY_LIBRARY[0]!, ACTIVITY_LIBRARY[6]!].map((a) => ({ ...a, assigned: true, completionsThisPeriod: Math.floor(a.completionsThisPeriod * 0.3) })),
    },
  },
  "Rachel Kim": {
    email: "rachel.k@example.com",
    enrolledDate: "2026-01-01",
    setupComplete: true,
    educationComplete: false,
    dataCollectionDays: 0,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 0,
    interactiveCommunications: 0,
    lastCommunicationDate: null,
    status: "paused",
    diagnosis: "Adjustment Disorder with Anxiety",
    treatmentPlan: null,
  },
  "Alex Patel": {
    email: "alex.p@example.com",
    enrolledDate: "2025-10-15",
    setupComplete: true,
    educationComplete: true,
    dataCollectionDays: 26,
    billingPeriodStart: "2026-02-01",
    billingPeriodEnd: "2026-02-28",
    clinicianMinutesLogged: 45,
    interactiveCommunications: 4,
    lastCommunicationDate: "2026-02-20",
    status: "active",
    diagnosis: "Bipolar II Disorder",
    treatmentPlan: {
      id: "tp-6",
      title: "Mood Stabilization & Monitoring",
      goals: [
        "Maintain mood stability with daily mood tracking",
        "Identify early warning signs of hypomania",
        "Establish consistent sleep-wake schedule",
      ],
      startDate: "2025-10-15",
      reviewDate: "2026-03-15",
      notes: "Excellent engagement. Patient consistently tracks mood and sleep. Recent mild hypomanic episode caught early through RTM data — adjusted medication in collaboration with psychiatrist.",
      activities: ACTIVITY_LIBRARY.filter((a) => ["act-1", "act-6", "act-2", "act-10"].includes(a.id)).map((a) => ({ ...a, assigned: true, completionsThisPeriod: Math.min(a.completionsThisPeriod + 5, a.targetCompletions) })),
    },
  },
};

// Default RTM overlay for students without specific mock data
const DEFAULT_OVERLAY: RTMOverlay = {
  email: "",
  enrolledDate: "2026-01-15",
  setupComplete: true,
  educationComplete: true,
  dataCollectionDays: Math.floor(Math.random() * 20) + 5,
  billingPeriodStart: "2026-02-01",
  billingPeriodEnd: "2026-02-28",
  clinicianMinutesLogged: Math.floor(Math.random() * 30) + 5,
  interactiveCommunications: Math.floor(Math.random() * 3) + 1,
  lastCommunicationDate: "2026-02-12",
  status: "active",
  diagnosis: "Under Assessment",
  treatmentPlan: null,
};

// Build RTM patients from real student data
export function buildRTMPatients(students: RealStudent[]): RTMPatient[] {
  return students.map((student) => {
    const overlay = RTM_OVERLAYS[student.name] ?? {
      ...DEFAULT_OVERLAY,
      dataCollectionDays: (hashCode(student.id) % 20) + 5,
      clinicianMinutesLogged: (hashCode(student.id + "m") % 30) + 5,
      interactiveCommunications: (hashCode(student.id + "c") % 3) + 1,
    };
    return {
      id: student.id,
      name: student.name,
      ...overlay,
    };
  });
}

// Simple deterministic hash for consistent random-looking values
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Keep MOCK_PATIENTS for backward compat (used by patient detail page)
export const MOCK_PATIENTS: RTMPatient[] = Object.entries(RTM_OVERLAYS).map(
  ([name, overlay], i) => ({
    id: `p-${i + 1}`,
    name,
    ...overlay,
  }),
);

// Time entries keyed by patient name for matching to real IDs
const TIME_ENTRIES_BY_NAME: Record<string, TimeEntry[]> = {
  "Sarah Mitchell": [
    { id: "te-1", date: "2026-02-18", minutes: 15, description: "Reviewed weekly mood data and screener results. Noted improvement in GAD-7 scores.", type: "data_review" },
    { id: "te-2", date: "2026-02-18", minutes: 10, description: "Video check-in to discuss progress and adjust breathing exercise frequency.", type: "communication" },
    { id: "te-3", date: "2026-02-10", minutes: 10, description: "Reviewed daily mood journal entries and sleep data for the week.", type: "data_review" },
  ],
  "David Chen": [
    { id: "te-4", date: "2026-02-15", minutes: 15, description: "Reviewed PHQ-9 trend data. Score decreased from 16 to 13.", type: "data_review" },
    { id: "te-5", date: "2026-02-15", minutes: 10, description: "Phone call to discuss engagement barriers and adjust plan.", type: "communication" },
  ],
  "Tyler Davis": [
    { id: "te-6", date: "2026-02-05", minutes: 12, description: "Reviewed limited data. Patient only completed 8 days of tracking. Sent reminder message.", type: "data_review" },
  ],
  "Alex Patel": [
    { id: "te-7", date: "2026-02-20", minutes: 20, description: "Detailed review of mood tracking data. Identified potential hypomanic pattern.", type: "data_review" },
    { id: "te-8", date: "2026-02-20", minutes: 15, description: "Urgent video call to discuss mood elevation. Coordinated with psychiatrist.", type: "communication" },
    { id: "te-9", date: "2026-02-12", minutes: 10, description: "Routine data review. Sleep patterns stable.", type: "data_review" },
  ],
};

export function getTimeEntries(patientId: string, patientName: string): TimeEntry[] {
  return TIME_ENTRIES_BY_NAME[patientName] ?? MOCK_TIME_ENTRIES[patientId] ?? [];
}

export const MOCK_TIME_ENTRIES: Record<string, TimeEntry[]> = {};

const COMMS_BY_NAME: Record<string, CommunicationEntry[]> = {
  "Sarah Mitchell": [
    { id: "c-1", date: "2026-02-18", type: "video", duration: 10, summary: "Discussed progress on anxiety management. Patient reports fewer panic episodes." },
    { id: "c-2", date: "2026-02-10", type: "in_app_message", duration: 5, summary: "Sent encouragement and reminder about breathing exercises." },
    { id: "c-3", date: "2026-02-03", type: "chat", duration: 8, summary: "Addressed questions about sleep hygiene checklist." },
  ],
  "David Chen": [
    { id: "c-4", date: "2026-02-15", type: "phone", duration: 10, summary: "Discussed engagement barriers. Patient agreed to set daily reminders." },
    { id: "c-5", date: "2026-02-05", type: "in_app_message", duration: 3, summary: "Check-in message about how the first week is going." },
  ],
  "Jessica Brown": [
    { id: "c-6", date: "2026-02-10", type: "video", duration: 15, summary: "Psychoeducation session on grounding techniques. Practiced 5-4-3-2-1 together." },
  ],
  "Tyler Davis": [
    { id: "c-7", date: "2026-02-05", type: "in_app_message", duration: 2, summary: "Sent reminder about daily check-ins and offered support." },
  ],
  "Alex Patel": [
    { id: "c-8", date: "2026-02-20", type: "video", duration: 15, summary: "Urgent check-in about mood elevation. Coordinated medication adjustment." },
    { id: "c-9", date: "2026-02-14", type: "chat", duration: 8, summary: "Routine check-in. Discussed sleep patterns and daily routine." },
    { id: "c-10", date: "2026-02-07", type: "phone", duration: 10, summary: "Weekly check-in. Reviewed mood tracking data together." },
    { id: "c-11", date: "2026-02-02", type: "in_app_message", duration: 3, summary: "Welcome to new billing period. Reminded about daily tracking." },
  ],
};

export function getCommunications(patientId: string, patientName: string): CommunicationEntry[] {
  return COMMS_BY_NAME[patientName] ?? MOCK_COMMUNICATIONS[patientId] ?? [];
}

export const MOCK_COMMUNICATIONS: Record<string, CommunicationEntry[]> = {};

export const ACTIVITY_LIBRARY_FULL = ACTIVITY_LIBRARY;

export type BillingReport = {
  id: string;
  patientId: string;
  patientName: string;
  periodStart: string;
  periodEnd: string;
  cptCodes: string[];
  estimatedAmount: number;
  status: "ready_for_review" | "reviewed" | "signed" | "submitted";
  generatedAt: string;
  signedAt: string | null;
  submittedAt: string | null;
  evidence: {
    dataDaysCollected: number;
    clinicianMinutesLogged: number;
    interactiveCommunications: number;
    treatmentPlanActive: boolean;
    deviceSetupComplete: boolean;
  };
};

export function generateBillingReports(patients: RTMPatient[]): BillingReport[] {
  return patients
    .filter((p) => {
      const elig = getBillingEligibility(p);
      return (
        (elig.cpt98978.eligible && elig.cpt98980.eligible) ||
        (elig.cpt98986.eligible && elig.cpt98979.eligible)
      );
    })
    .map((p, i) => {
      const elig = getBillingEligibility(p);
      const codes: string[] = [];
      let amount = 0;
      if (elig.cpt98978.eligible) { codes.push("98978"); amount += 47.27; }
      if (elig.cpt98986.eligible) { codes.push("98986"); amount += 47.27; }
      if (elig.cpt98980.eligible) { codes.push("98980"); amount += 50.60; }
      if (elig.cpt98981.eligible) { codes.push("98981"); amount += 39.95; }
      if (elig.cpt98979.eligible) { codes.push("98979"); amount += 50.60; }

      // Simulate some reports already signed/submitted
      const statuses: BillingReport["status"][] = [
        "ready_for_review", "ready_for_review", "reviewed", "signed", "submitted",
      ];
      const status = statuses[i % statuses.length] ?? "ready_for_review";

      return {
        id: `report-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        periodStart: p.billingPeriodStart,
        periodEnd: p.billingPeriodEnd,
        cptCodes: codes,
        estimatedAmount: amount,
        status,
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        signedAt: status === "signed" || status === "submitted"
          ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        submittedAt: status === "submitted"
          ? new Date().toISOString()
          : null,
        evidence: {
          dataDaysCollected: p.dataCollectionDays,
          clinicianMinutesLogged: p.clinicianMinutesLogged,
          interactiveCommunications: p.interactiveCommunications,
          treatmentPlanActive: p.treatmentPlan !== null,
          deviceSetupComplete: p.setupComplete,
        },
      };
    });
}

export function getBillingEligibility(patient: RTMPatient) {
  const isShortPeriod = patient.dataCollectionDays >= 2 && patient.dataCollectionDays <= 15;
  const isStandardPeriod = patient.dataCollectionDays >= 16;

  // Short-period pathway (2–15 days)
  const cpt98986 = isShortPeriod && patient.setupComplete;
  const cpt98979 = isShortPeriod && patient.clinicianMinutesLogged >= 10;

  // Standard pathway (16+ days)
  const cpt98978 = isStandardPeriod && patient.setupComplete;
  const cpt98980 = isStandardPeriod && patient.clinicianMinutesLogged >= 20;
  const cpt98981 = isStandardPeriod && patient.clinicianMinutesLogged >= 40;

  // Determine which pathway applies
  const pathway = isStandardPeriod ? "standard" : isShortPeriod ? "short" : "none";

  return {
    pathway,
    // Short-period codes
    cpt98986: { eligible: cpt98986, label: "98986", description: "Short-Period Device Supply (2–15 days)" },
    cpt98979: { eligible: cpt98979, label: "98979", description: "Short-Period Provider Mgmt (10–19 min)" },
    // Standard codes
    cpt98978: { eligible: cpt98978, label: "98978", description: "Device Supply (16+ days)" },
    cpt98980: { eligible: cpt98980, label: "98980", description: "Provider Management (20+ min)" },
    cpt98981: { eligible: cpt98981, label: "98981", description: "Provider Management (40+ min)" },
  };
}
