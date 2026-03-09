/**
 * Clarification Question Builder Utilities
 * Helper functions for managing ambiguous risk clarification flow
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  getAmbiguousRiskManagerPrompt,
  getClarificationYesNoParserPrompt,
  getQuestionARiskAssessmentPrompt,
} from "../../prompts";
import type { PatternType } from "../constants";
import { CLARIFICATION_PATTERNS, RISK_INDICATORS } from "../constants";
import type { ClarificationResponses } from "../types";

/**
 * Lazy initialization of LLM for risk assessment
 * Only created when needed to avoid instantiation during build
 */
let llmInstance: ChatGoogleGenerativeAI | null = null;
function getLLM(): ChatGoogleGenerativeAI {
  if (!llmInstance) {
    llmInstance = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0.3, // Lower temperature for more consistent risk assessment
      apiKey: process.env["GOOGLE_API_KEY"],
    });
  }
  return llmInstance;
}

/**
 * Get a specific clarification question text
 */
export function getClarificationQuestion(
  patternType: PatternType,
  step: "A" | "B" | "C",
  extractedContext?: string | null,
): string {
  const pattern = CLARIFICATION_PATTERNS[patternType];

  if (!pattern) {
    throw new Error(
      `Invalid patternType: "${patternType}". Must be one of: ${Object.keys(CLARIFICATION_PATTERNS).join(", ")}`,
    );
  }

  if (step === "A") {
    // Provide a generic fallback if extractedContext is missing
    const context = extractedContext?.trim()
      ? extractedContext
      : "something you mentioned";
    return pattern.questionA(context);
  } else if (step === "B") {
    return pattern.questionB;
  } else {
    return pattern.questionC;
  }
}

/**
 * Determine the next clarification step based on current state
 * Logic:
 * - Start with A
 * - After A, assess risk:
 *   - If low/direct/indirect → complete (route elsewhere)
 *   - If unclear → B
 * - After B:
 *   - If yes → C
 *   - If no → complete
 * - After C → complete
 */
export function determineNextClarificationStep(
  currentStep: "A" | "B" | "C" | "complete" | null,
  responses: Partial<ClarificationResponses>,
): "A" | "B" | "C" | "complete" {
  // If no current step, start at A
  if (!currentStep) {
    return "A";
  }

  // If we just completed A, check risk assessment
  if (currentStep === "A") {
    const assessment = responses.A?.riskAssessment;

    // If assessment is unclear, continue to B
    if (assessment === "unclear") {
      return "B";
    }

    // Otherwise (low/direct/indirect), we're done
    return "complete";
  }

  // If we just completed B, check answer
  if (currentStep === "B") {
    const answer = responses.B?.answer;

    // If yes, continue to C
    if (answer === "yes") {
      return "C";
    }

    // If no, we're done
    return "complete";
  }

  // If we just completed C, we're done
  if (currentStep === "C") {
    return "complete";
  }

  // Already complete
  return "complete";
}

/**
 * Parse yes/no/past_resolved/volatile answer from user response using LLM
 */
export async function parseYesNoAnswer(
  response: string,
  questionAsked: string,
): Promise<"yes" | "no" | "past_resolved" | "volatile"> {
  const prompt = getClarificationYesNoParserPrompt({
    questionAsked,
    studentResponse: response,
  });

  try {
    const result = await getLLM().invoke(prompt);
    const answer = result.content.toString().toLowerCase().trim();

    if (answer.includes("volatile")) return "volatile";
    if (answer.includes("past_resolved")) return "past_resolved";
    return answer.includes("yes") ? "yes" : "no";
  } catch (error) {
    console.error("[LLM] parseYesNoAnswer - Error executing LLM:", error);
    throw new Error("Failed to parse yes/no from response due to LLM error");
  }
}

/**
 * Perform LLM-based risk assessment on Question A response
 * Uses context from constants to inform decision making
 */
export async function assessQuestionAResponse(
  response: string,
  patternType: PatternType,
  extractedContext: string | null,
  triggeringStatement: string,
): Promise<{
  riskAssessment:
    | "low"
    | "direct_connection"
    | "indirect_connection"
    | "backtracking"
    | "unclear";
  reasoning: string;
}> {
  // Get pattern-specific context from constants
  const patternInfo = CLARIFICATION_PATTERNS[patternType];
  const patternDescription = patternInfo.description;

  // Get risk indicators from constants
  const directIndicators = RISK_INDICATORS.direct;
  const indirectIndicators = Object.entries(RISK_INDICATORS.indirect)
    .map(([category, phrases]) => `${category}: ${phrases.join(", ")}`)
    .join("\n");

  const prompt = getQuestionARiskAssessmentPrompt({
    response,
    patternType,
    extractedContext,
    triggeringStatement,
    patternDescription,
    questionAText: patternInfo.questionA(extractedContext || ""),
    directIndicators,
    indirectIndicators,
  });

  try {
    const result = await getLLM().invoke(prompt);
    const responseText = result.content.toString();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the assessment value
      const validAssessments = [
        "low",
        "direct_connection",
        "indirect_connection",
        "backtracking",
        "unclear",
      ];
      if (validAssessments.includes(parsed.riskAssessment)) {
        return {
          riskAssessment: parsed.riskAssessment,
          reasoning: parsed.reasoning || "LLM assessment completed",
        };
      }
    }

    // Try to extract from text/json even if full parse failed, but strict validation
    throw new Error("Failed to parse valid risk assessment from LLM response");
  } catch (error) {
    console.error(
      "[LLM] assessQuestionAResponse - Error executing LLM or parsing:",
      error,
    );
    throw new Error("Failed to assess Question A response due to LLM error");
  }
}

/**
 * Evaluate ambiguous risk using the unified Manager Prompt
 * Determines the next step in the protocol (Ask A/B/C, Resolve, Escalate)
 */
export async function evaluateAmbiguousRisk(params: {
  conversationHistory: string;
  triggeringStatement: string;
  patternType: PatternType;
  extractedContext: string | null;
  currentStep: "START" | "ASKED_A" | "ASKED_B" | "ASKED_C";
  lastQuestionAsked: string | null;
}): Promise<{
  decision:
    | "RESOLVE"
    | "ESCALATE_DIRECT"
    | "ESCALATE_INDIRECT"
    | "ESCALATE_BACKTRACKING"
    | "ESCALATE_UNCLEAR"
    | "ASK_A"
    | "ASK_B"
    | "ASK_C"
    | "CHECK_LABILE"
    | "ASK_FOLLOWUP";
  reasoning: string;
  riskAssessment: string;
}> {
  // Get pattern description and indicators from constants
  const patternInfo = CLARIFICATION_PATTERNS[params.patternType];
  const directIndicators = RISK_INDICATORS.direct;
  const indirectIndicators = Object.entries(RISK_INDICATORS.indirect)
    .map(([category, phrases]) => `${category}: ${phrases.join(", ")}`)
    .join("\n");

  const prompt = getAmbiguousRiskManagerPrompt({
    ...params,
    patternDescription: patternInfo.description,
    directIndicators,
    indirectIndicators,
  });

  try {
    const result = await getLLM().invoke(prompt);
    const responseText = result.content.toString();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        decision: parsed.decision,
        reasoning: parsed.reasoning,
        riskAssessment: parsed.riskAssessment,
      };
    }

    throw new Error("Failed to parse JSON response from Risk Manager");
  } catch (error) {
    console.error("[LLM] evaluateAmbiguousRisk - Error:", error);
    throw new Error("Failed to evaluate ambiguous risk due to LLM error");
  }
}
