/*
 * CSSR Question Builder Utilities
 * Helper functions for managing CSSR question flow
 *
 * New flow (7 questions + 1 follow-up):
 * - Q1 → Q2 → Q3
 * - If Q3 = NO → Skip to Q7
 * - If Q3 = YES → Q4 → Q5 → Q6 → Q7
 * - If Q7 = YES → Q7 Follow-up (within past 3 months?)
 */

import { CSSR_QUESTIONS, type CSSRQuestionId } from "../constants";
import type { CSSRState } from "../types";

/**
 * Get a specific CSSR question text by question ID
 */
export function getCSSRQuestion(questionId: CSSRQuestionId): string {
  return CSSR_QUESTIONS[questionId].text;
}

/**
 * Get CSSR question metadata (description, timeframe, context)
 */
export function getCSSRQuestionMeta(questionId: CSSRQuestionId) {
  return CSSR_QUESTIONS[questionId];
}

/**
 * Determine the next CSSR question to ask based on current state
 *
 * Flow logic:
 * - Start with Q1
 * - Q1 → Q2
 * - If Q2 = NO → Skip Q3-Q5, go to Q6
 * - If Q2 = YES → Q3 → Q4 → Q5 → Q6
 * - If Q6 = YES → Q6 Follow-up
 * - Otherwise → complete
 */
export function determineNextCSSRQuestion(
  cssrState: CSSRState,
): CSSRQuestionId | "complete" {
  const { currentQuestion, q3, q7 } = cssrState;

  // If no current question set, start at Q1
  if (!currentQuestion) {
    return "q1";
  }

  // Based on the current question that was just answered, determine next
  switch (currentQuestion) {
    case "q1":
      // Q1 answered → go to Q2
      return "q2";

    case "q2":
      // Q2 answered → proceed to Q3
      return "q3";

    case "q3":
      // Q3 answered → branch based on answer
      if (q3?.answer === true) {
        // Q3 = YES → continue to Q4
        return "q4";
      } else {
        // Q3 = NO or past_resolved → skip to Q7
        return "q7";
      }

    case "q4":
      // Q4 answered → go to Q5
      return "q5";

    case "q5":
      // Q5 answered → go to Q6
      return "q6";

    case "q6":
      // Q6 answered → go to Q7
      return "q7";

    case "q7":
      // Q7 answered → check if follow-up needed
      if (q7?.answer === true) {
        // Q7 = YES → ask follow-up about 3-month timeframe
        return "q7Followup";
      } else {
        // Q7 = NO or past_resolved → complete
        return "complete";
      }

    case "q7Followup":
      // Follow-up answered → complete
      return "complete";

    default:
      return "complete";
  }
}

/**
 * Check if there were any "yes" responses in CSSR
 * Used for general risk tracking
 */
export function hasAnyYesResponses(cssrState: CSSRState): boolean {
  return (
    cssrState.q1?.answer === true ||
    cssrState.q2?.answer === true ||
    cssrState.q3?.answer === true ||
    cssrState.q4?.answer === true ||
    cssrState.q5?.answer === true ||
    cssrState.q6?.answer === true ||
    cssrState.q7?.answer === true ||
    cssrState.q7Followup?.answer === true
  );
}

/**
 * Determine if the CSSR results warrant shutdown
 *
 * Shutdown criteria (any of these):
 * - Q2 = YES (thoughts of killing self)
 * - Q3 = YES (method ideation)
 * - Q4 = YES (intent to act)
 * - Q5 = YES (plan with intent)
 * - Q6 = YES (lifetime suicidal behavior)
 * - Q6 Follow-up = YES (recent behavior within 3 months)
 */
export function shouldShutdownFromCSSR(cssrState: CSSRState): boolean {
  return (
    // Critical indicators moved: suicidal thoughts are now Q3
    cssrState.q3?.answer === true ||
    cssrState.q4?.answer === true ||
    cssrState.q5?.answer === true ||
    cssrState.q6?.answer === true ||
    cssrState.q7?.answer === true ||
    cssrState.q7Followup?.answer === true
  );
}

/**
 * Initialize CSSR state
 * Always starts at Q1 in the new flow
 */
export function initializeCSSRState(): CSSRState {
  return {
    currentQuestion: null,
  };
}

/**
 * Check if CSSR screening is complete
 */
export function isCSSRComplete(cssrState: CSSRState): boolean {
  const nextQuestion = determineNextCSSRQuestion(cssrState);
  return nextQuestion === "complete";
}
