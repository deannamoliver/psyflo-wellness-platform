/**
 * Node-to-Prompt Mapping
 *
 * Maps LangGraph node names to their associated LLM prompts.
 * Used by the admin dashboard to display prompts when nodes are clicked.
 */

import {
  getBaseAgentSystemPrompt,
  getClarificationYesNoParserPrompt,
  getConversationalWrapperPrompt,
  getConversationSummaryPrompt,
  getQuestionARiskAssessmentPrompt,
  getYesNoParserPrompt,
  RISK_DETECTION_PROMPT,
} from "./prompts";

export type PromptType =
  | { type: "static"; content: string }
  | { type: "dynamic"; template: string; params: string[] };

export interface NodePromptInfo {
  isLLMNode: boolean;
  prompts?: PromptType[];
  description?: string;
}

/**
 * Mapping of node names to their prompt information
 *
 * For static prompts: provide the full prompt text
 * For dynamic prompts: provide the template function as a string
 */
export const NODE_PROMPT_MAP: Record<string, NodePromptInfo> = {
  // ============================================================================
  // MAIN GRAPH NODES
  // ============================================================================

  analyze_risk: {
    isLLMNode: true,
    description:
      "Analyzes student messages for suicide risk indicators using Gemini",
    prompts: [
      {
        type: "static",
        content: RISK_DETECTION_PROMPT,
      },
    ],
  },

  base_agent: {
    isLLMNode: true,
    description:
      "Handles normal emotional support conversations (non-risk scenarios)",
    prompts: [
      {
        type: "dynamic",
        template: getBaseAgentSystemPrompt(13),
        params: ["age"],
      },
    ],
  },

  generate_conversation_summary: {
    isLLMNode: true,
    description:
      "Creates a natural language summary of the conversation for counselors",
    prompts: [
      {
        type: "dynamic",
        template: getConversationSummaryPrompt("[conversationText]"),
        params: ["conversationText"],
      },
    ],
  },

  create_alerts: {
    isLLMNode: false,
    description:
      "Creates alert and chat_alert database records when risk is detected",
  },

  persist_alert_state: {
    isLLMNode: false,
    description:
      "Updates chat_alerts with latest protocol state after completion",
  },

  // ============================================================================
  // RISK PROTOCOL ROUTER NODES
  // ============================================================================

  prepare_cssr_config: {
    isLLMNode: false,
    description:
      "Configures CSSR screening start section based on ambiguous subgraph results",
  },

  // ============================================================================
  // AMBIGUOUS RISK SUBGRAPH NODES
  // ============================================================================

  ask_clarification_question: {
    isLLMNode: false,
    description:
      "Asks clarification questions A, B, or C based on ambiguous pattern detected",
  },

  process_clarification_response: {
    isLLMNode: true,
    description:
      "Processes student responses to clarification questions using LLM",
    prompts: [
      {
        type: "dynamic",
        template: getQuestionARiskAssessmentPrompt({
          response: "[response]",
          // biome-ignore lint/suspicious/noExplicitAny: Template placeholder
          patternType: "[patternType]" as any,
          extractedContext: "[extractedContext]",
          triggeringStatement: "[triggeringStatement]",
          patternDescription: "[patternDescription]",
          questionAText: "[questionAText]",
          directIndicators: ["[directIndicators]"],
          indirectIndicators: "[indirectIndicators]",
        }),
        params: [
          "response",
          "patternType",
          "extractedContext",
          "triggeringStatement",
          "patternDescription",
          "questionAText",
          "directIndicators",
          "indirectIndicators",
        ],
      },
      {
        type: "dynamic",
        template: getClarificationYesNoParserPrompt({
          questionAsked: "[questionAsked]",
          studentResponse: "[studentResponse]",
        }),
        params: ["questionAsked", "studentResponse"],
      },
    ],
  },

  complete_low_risk: {
    isLLMNode: false,
    description:
      "Marks protocol complete for low-risk scenarios without shutting down",
  },

  route_to_indirect: {
    isLLMNode: false,
    description:
      "Routes to indirect risk handler when indirect themes are detected",
  },

  route_to_cssr_screening: {
    isLLMNode: false,
    description:
      "Routes to CSSR screening when Question B or C indicates elevated risk",
  },

  provide_crisis_resources: {
    isLLMNode: false,
    description: "Provides crisis resources and marks alert as active",
  },

  shutdown: {
    isLLMNode: false,
    description:
      "Shuts down the chatbot conversation after crisis resources are provided",
  },

  // ============================================================================
  // INDIRECT RISK SUBGRAPH NODES (CSSR Screening)
  // ============================================================================

  prepare_cssr_question: {
    isLLMNode: false,
    description:
      "Determines the next CSSR screening question based on current state",
  },

  generate_conversational_wrapper_for_cssr_question: {
    isLLMNode: true,
    description:
      "Wraps CSSR questions in empathetic, conversational language using Gemini",
    prompts: [
      {
        type: "dynamic",
        template: getConversationalWrapperPrompt({
          rawQuestionText: "[rawQuestionText]",
          isFirstQuestion: false,
        }),
        params: ["rawQuestionText", "isFirstQuestion"],
      },
    ],
  },

  process_cssr_response: {
    isLLMNode: true,
    description:
      "Parses student responses to CSSR questions as yes/no using Gemini",
    prompts: [
      {
        type: "dynamic",
        template: getYesNoParserPrompt({
          questionAsked: "[questionAsked]",
          userResponse: "[userResponse]",
        }),
        params: ["questionAsked", "userResponse"],
      },
    ],
  },

  evaluate_cssr_results: {
    isLLMNode: false,
    description: "Evaluates CSSR screening results to determine risk level",
  },

  provide_resources_if_needed: {
    isLLMNode: false,
    description: "Provides resources if CSSR screening indicates elevated risk",
  },

  decide_shutdown: {
    isLLMNode: false,
    description: "Decides whether to shutdown based on risk level",
  },

  // ============================================================================
  // DIRECT RISK SUBGRAPH NODES
  // ============================================================================

  // Note: direct risk nodes are defined in direct-risk.ts but share names
  // with ambiguous subgraph nodes (provide_crisis_resources, shutdown)
  // They are already mapped above
};

/**
 * Check if a node uses LLM
 */
export function isLLMNode(nodeName: string): boolean {
  return NODE_PROMPT_MAP[nodeName]?.isLLMNode ?? false;
}

/**
 * Get prompt information for a node
 */
export function getNodePromptInfo(nodeName: string): NodePromptInfo | null {
  return NODE_PROMPT_MAP[nodeName] || null;
}
