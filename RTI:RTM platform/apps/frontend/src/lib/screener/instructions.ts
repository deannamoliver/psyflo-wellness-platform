/**
 * Per-screener instructions from the Wellness Check Screeners PRD.
 * Shown under each question so students see directions for the current wellness check type.
 */

import type { screenerTypeEnum } from "@feelwell/database";

export type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

export interface ScreenerInstructions {
  /** Main directions for the screener (e.g. "Over the last 2 weeks, how often...") */
  directions: string;
  /** Optional prefix prepended to the question text instead of showing as separate directions */
  questionPrefix?: string;
}

/** Instructions for each wellness check type (PRD). */
export const SCREENER_INSTRUCTIONS: Record<ScreenerType, ScreenerInstructions> =
  {
    sel: {
      directions:
        "Please tell us how easy or difficult each of the following are for you",
    },
    phq_a: {
      directions:
        "How often have you been bothered by each of the following symptoms during the past 7 days",
    },
    phq_9: {
      directions:
        "Over the last 2 weeks, how often have you been bothered by the following problems",
    },
    gad_child: {
      directions: "",
      questionPrefix: "During the PAST 7 DAYS, I have",
    },
    gad_7: {
      directions:
        "Over the last 2 weeks, how often have you been bothered by the following problems",
    },
  };

/**
 * Derive screener type from a question code (e.g. PHQA_1 → phq_a, SEL_SA_SC_1 → sel).
 */
export function getScreenerTypeFromQuestionCode(
  questionCode: string,
): ScreenerType | null {
  if (questionCode.startsWith("SEL_")) return "sel";
  if (questionCode.startsWith("PHQA_")) return "phq_a";
  if (questionCode.startsWith("PHQ9_")) return "phq_9";
  if (questionCode.startsWith("GADC_")) return "gad_child";
  if (questionCode.startsWith("GAD7_")) return "gad_7";
  return null;
}

/**
 * Get instructions for a question, or null if type cannot be determined.
 */
export function getInstructionsForQuestion(
  questionCode: string,
): ScreenerInstructions | null {
  const type = getScreenerTypeFromQuestionCode(questionCode);
  if (type == null) return null;
  return SCREENER_INSTRUCTIONS[type];
}
