/**
 * Type definitions for suicide risk protocol
 *
 * Note: State annotations are defined using LangGraph's Annotation.Root() in:
 * - shared-state.ts (SharedRiskProtocolState - used by main router)
 * - subgraphs/*.ts (subgraph-specific state annotations)
 *
 * This file contains only shared type definitions used across the protocol.
 */

import type { CSSRQuestionId } from "./constants";

/**
 * CSSR Answer type
 * - true: "yes" response
 * - false: "no" response
 * - "past_resolved": Had thoughts in past but no longer
 */
export type CSSRAnswer = boolean | "past_resolved";

/**
 * CSSR (Columbia-Suicide Severity Rating Scale) state tracking
 *
 * New structure: 6 sequential questions with branching at Q2
 * - Q1-Q5: Assess past month
 * - Q6: Lifetime behavioral assessment
 * - Q6 Follow-up: Within past 3 months? (only if Q6 = yes)
 *
 * Flow:
 * - Q1 → Q2
 * - If Q2 = NO → Skip to Q6
 * - If Q2 = YES → Q3 → Q4 → Q5 → Q6
 * - If Q6 = YES → Q6 Follow-up
 */
export interface CSSRState {
  // Question answers (null = not yet asked)
  q1?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q2?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q3?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q4?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q5?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q6?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q7?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;
  q7Followup?: {
    answer: CSSRAnswer;
    questionText?: string;
  } | null;

  // Current question being asked
  currentQuestion?: CSSRQuestionId | null;
}

/**
 * Clarification response tracking for ambiguous patterns
 * Used in ambiguous risk subgraph's three-stage clarification
 */
export interface ClarificationResponses {
  patternType?: string; // e.g., "place", "firearms", "medication"
  extractedContext?: string | null; // Context used for Question A (e.g., "the bridge")
  A?: {
    question: string; // The actual question text asked
    response: string;
    riskAssessment:
      | "low"
      | "direct_connection"
      | "indirect_connection"
      | "backtracking"
      | "unclear";
    reasoning: string;
  };
  B?: {
    question: string; // The actual question text asked
    response: string;
    answer: "yes" | "no" | "past_resolved" | "volatile";
  };
  C?: {
    question: string; // The actual question text asked
    response: string;
    answer: "yes" | "no" | "past_resolved" | "volatile";
  };
}

/**
 * Database tool result types
 */
export interface CreateAlertResult {
  alertId: string;
  success: boolean;
}

export interface CreateChatAlertResult {
  chatAlertId: string;
  success: boolean;
}

export interface UpdateChatAlertResult {
  success: boolean;
}

export interface NotifyCounselorResult {
  notified: boolean;
  success: boolean;
}
