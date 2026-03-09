import type {
  alertSourceEnum,
  alertStatusEnum,
  alertTypeEnum,
  screenerTypeEnum,
  timelineEntryTypeEnum,
} from "@feelwell/database";
import type { AlertWithStudent } from "@/lib/alerts/alert-card";

export type SourceAndTypes = {
  source: (typeof alertSourceEnum.enumValues)[number];
  alertTypes: (typeof alertTypeEnum.enumValues)[number][];
};

export type AlertTimelineEntry = {
  id: string;
  alertId: string;
  type: (typeof timelineEntryTypeEnum.enumValues)[number];
  description: string;
  createdAt: Date;
};

export type ScreenerResponse = {
  id: string;
  sessionId: string;
  questionCode: string;
  answerCode: string;
  createdAt: Date;
};

export type ScreenerSessionWithResponses = {
  id: string;
  screenerId: string;
  studentId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  responses: ScreenerResponse[];
};

export type ClarificationResponses = {
  patternType?: string; // e.g., "place", "firearms", "medication"
  extractedContext?: string | null; // Context used for Question A (e.g., "the bridge")
  A?: {
    question: string; // The actual question text asked
    response: string;
    riskAssessment:
      | "low"
      | "direct_connection"
      | "indirect_connection"
      | "unclear";
    reasoning: string;
  };
  B?: {
    question: string; // The actual question text asked
    response: string;
    answer: "yes" | "no";
  };
  C?: {
    question: string; // The actual question text asked
    response: string;
    answer: "yes" | "no";
  };
};

/**
 * CSSR (Columbia Suicide Severity Rating Scale) state for student alerts.
 * Follows the linear Q1-Q6 flow:
 * - Q1: Wish to be dead (always asked)
 * - Q2: Thoughts of killing self (if no, skip to Q6)
 * - Q3-Q5: Method, intent, plan (only if Q2=yes)
 * - Q6: Lifetime behavior
 * - Q6Followup: Recent behavior (within 3 months, only if Q6=yes)
 *
 * Answer types match risk-protocol/types.ts CSSRAnswer:
 * - true: "yes" response
 * - false: "no" response
 * - "past_resolved": Had thoughts in past but no longer
 */
export type CSSRState = {
  q1?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q2?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q3?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q4?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q5?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q6?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  q6Followup?: {
    answer: boolean | "past_resolved";
    questionText?: string;
  } | null;
  currentQuestion?:
    | "q1"
    | "q2"
    | "q3"
    | "q4"
    | "q5"
    | "q6"
    | "q6Followup"
    | null;
};

export type AlertWithScreener = AlertWithStudent & {
  screener: {
    id: string;
    type: (typeof screenerTypeEnum.enumValues)[number];
    completedAt: Date | null;
    score: number;
    maxScore: number;
  } | null;
  screenerSessions?: ScreenerSessionWithResponses[];
  chat: {
    id: string;
    chatSessionId: string;
    triggeringStatement: string;
    conversationContext: string;
    clarificationResponses: ClarificationResponses | null;
    cssrState: CSSRState | null;
    isShutdown: boolean;
    shutdownRiskType:
      | "direct"
      | "indirect"
      | "ambiguous"
      | "abuse_neglect"
      | "harm_to_others"
      | null;
  } | null;
};

export type AlertSource =
  | {
      sourceType: "screener";
      screenerType: (typeof screenerTypeEnum.enumValues)[number];
      alertType: (typeof alertTypeEnum.enumValues)[number];
      alerts: AlertWithScreener[]; // All instances, empty array if no alerts
      hasAlerts: boolean; // True if student has alerts for this combination
    }
  | {
      sourceType: "chat";
      alertType: (typeof alertTypeEnum.enumValues)[number];
      alerts: AlertWithScreener[];
      hasAlerts: boolean;
    };

export type StudentAlertsGrouped = {
  student: AlertWithStudent["student"];
  alerts: AlertWithScreener[]; // All alerts for this student with screener data
  timelineEntries: AlertTimelineEntry[]; // Timeline entries for all alerts
  studentStatus: (typeof alertStatusEnum.enumValues)[number]; // Computed from all alerts
  alertCount: number; // Total alerts
  latestCreatedAt: Date; // Most recent alert
  sourcesAndTypes: SourceAndTypes[]; // From all alerts

  // Filtered data for display (based on tab status)
  filteredAlerts: AlertWithScreener[]; // Only alerts matching the tab filter
  filteredAlertCount: number; // Count of filtered alerts
  filteredSourcesAndTypes: SourceAndTypes[]; // Sources/types from filtered alerts only
};
