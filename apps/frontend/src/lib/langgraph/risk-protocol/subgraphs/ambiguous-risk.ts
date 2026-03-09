import {
  AIMessage,
  type HumanMessage,
  isHumanMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { getTransitionToScreeningPrompt } from "../../prompts";
import { updateAlertStatus, updateChatAlert } from "../../tools/alert-tools";
import {
  CRISIS_RESOURCES_MESSAGE,
  LABILE_CHECK_QUESTION,
  PAST_RESOLVED_FOLLOWUP,
} from "../constants";
import { ConversationState } from "../conversation-state";
import {
  evaluateAmbiguousRisk,
  getClarificationQuestion,
} from "../utils/clarification-builder";

// ============================================================================
// NODES
// ============================================================================

/**
 * Node 1: Manage Risk (The Orchestrator)
 *
 * Uses the Unified Risk Manager Prompt to evaluate state and decide next action:
 * - Ask Question A/B/C
 * - Resolve (Low Risk)
 * - Escalate (Backtracking, Unclear, Direct, Indirect)
 * - Check Labile / Ask Follow-up (formerly separate nodes)
 */
async function manageRiskNode(state: typeof ConversationState.State) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If the last message is from AI (our question), we must wait for user input
  if (!lastMessage || !isHumanMessage(lastMessage)) {
    return {};
  }

  // Prepare history for LLM
  const conversationHistory = state.messages
    .map((m) => `${isHumanMessage(m) ? "Student" : "Assistant"}: ${m.content}`)
    .join("\n");

  // Determine current "Logical" phase
  let currentStep: "START" | "ASKED_A" | "ASKED_B" | "ASKED_C" = "START";
  if (state.clarificationStep === "A") currentStep = "ASKED_A";
  else if (state.clarificationStep === "B") currentStep = "ASKED_B";
  else if (state.clarificationStep === "C") currentStep = "ASKED_C";

  // Evaluate with Manager Prompt (use "finality" as generic fallback when patternType is null)
  const patternType = state.patternType ?? "finality";
  const evaluation = await evaluateAmbiguousRisk({
    conversationHistory,
    triggeringStatement: state.triggeringStatement ?? "",
    patternType,
    extractedContext: state.extractedContext,
    currentStep,
    lastQuestionAsked: state.currentQuestionText,
  });

  console.log("[AmbiguousRisk] Manager Decision:", evaluation);

  // --- CASE 1: ASK CLARIFICATION (A/B/C) ---
  if (
    evaluation.decision === "ASK_A" ||
    evaluation.decision === "ASK_B" ||
    evaluation.decision === "ASK_C"
  ) {
    const stepMap = { ASK_A: "A", ASK_B: "B", ASK_C: "C" } as const;
    const nextStep = stepMap[evaluation.decision];

    // Explicitly handle Labile Check as a clarification step?
    // No, standard A/B/C are handled here.
    const questionText = getClarificationQuestion(
      patternType,
      nextStep,
      state.extractedContext,
    );

    const message = new AIMessage({ content: questionText });

    return {
      messages: [message],
      clarificationStep: nextStep,
      currentQuestionText: questionText,
      // No routing signal in state -> Edge routes to END (wait for user)
    };
  }

  // --- CASE 2: CHECK LABILE ---
  if (evaluation.decision === "CHECK_LABILE") {
    const message = new AIMessage({ content: LABILE_CHECK_QUESTION });
    return {
      messages: [message],
      // We can reuse a step or just track the question text.
      // Orchestrator will see "Last Question Asked: <LabileCheck>" next turn and evaluate response.
      currentQuestionText: LABILE_CHECK_QUESTION,
    };
  }

  // --- CASE 3: ASK FOLLOWUP (Past Resolved) ---
  if (evaluation.decision === "ASK_FOLLOWUP") {
    const message = new AIMessage({ content: PAST_RESOLVED_FOLLOWUP });
    return {
      messages: [message],
      currentQuestionText: PAST_RESOLVED_FOLLOWUP,
    };
  }

  // --- CASE 4: RESOLVE (Low Risk) ---
  if (evaluation.decision === "RESOLVE") {
    // Populate response for dashboard compatibility
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic response structure
    const responseUpdate: any = {};
    if (currentStep === "ASKED_A") {
      responseUpdate.A = {
        question: state.currentQuestionText || "",
        response: (lastMessage as HumanMessage).content.toString(),
        riskAssessment: "low",
        reasoning: evaluation.reasoning,
      };
    }
    // Logic for other steps handled implicitly or can be expanded if needed
    // Assuming Manager only RESOLVEs if risk is low.

    return {
      clarificationResponses: {
        ...state.clarificationResponses,
        ...responseUpdate,
      },
      riskType: "ambiguous",
    };
  }

  // --- CASE 5: ESCALATE (High Risk) ---
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic response structure
  const responseUpdate: any = {};
  if (currentStep === "ASKED_A") {
    responseUpdate.A = {
      question: state.currentQuestionText || "",
      response: (lastMessage as HumanMessage).content.toString(),
      riskAssessment: evaluation.riskAssessment,
      reasoning: evaluation.reasoning,
    };
  }
  // Store the assessment so router knows where to go
  // (Direct -> Crisis, Indirect -> CSSR, Backtracking -> CSSR)

  return {
    clarificationResponses: {
      ...state.clarificationResponses,
      ...responseUpdate,
    },
  };
}

// ... (Keep existing leaf nodes: announceCSSRTransitionNode, routeToCSSRScreeningNode, etc.)

/**
 * Node: Announce CSSR Transition
 * Uses LLM to generate a natural, empathetic transition message
 */
async function announceCSSRTransitionNode(
  state: typeof ConversationState.State,
) {
  // SAFETY CHECK: If we have already announced the transition, do not announce it again.
  // This prevents redundant messages if the router accidentally sends us back here.
  if (state.hasTransitioned) {
    console.log(
      "[AmbiguousRisk] Already transitioned to CSSR, skipping announcement.",
    );
    return { hasTransitioned: true };
  }

  const assessment =
    state.clarificationResponses.A?.riskAssessment ?? "unclear";

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  const prompt = getTransitionToScreeningPrompt({
    assessment: assessment,
  });

  // Generate content using LLM
  let content = "";
  try {
    const systemTemplate = SystemMessagePromptTemplate.fromTemplate(prompt);
    const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate]);
    const response = await model.invoke(await chatPrompt.format({}));
    content = response.content.toString();
  } catch (error) {
    console.error(
      "Error generating transition message, using fallback:",
      error,
    );
    // Fallback static messages
    if (assessment === "backtracking") {
      content =
        "I hear you saying you were joking. Because safety is so important, and purely based on what you shared earlier, I need to be extra careful and ask just a few more questions to make sure everything is okay.";
    } else {
      content =
        "Thanks for explaining. Since I'm still not 100% sure I understand what's going on, and I want to prioritize your safety, I need to ask a few more specific questions.";
    }
  }

  console.log(
    `[AmbiguousRisk] Announcing transition. content: "${content.substring(0, 30)}..."`,
  );
  return {
    messages: [new AIMessage({ content })],
    hasTransitioned: true,
  };
}

async function routeToCSSRScreeningNode(state: typeof ConversationState.State) {
  const assessmentA = state.clarificationResponses.A?.riskAssessment;
  // Logic remains same...
  let cssrTrigger = "double_ambiguous";
  if (assessmentA === "backtracking") cssrTrigger = "backtracking";
  else if (state.clarificationResponses.B?.answer === "yes")
    cssrTrigger = "questionB";
  else if (state.clarificationResponses.C?.answer === "yes")
    cssrTrigger = "questionC";

  const contextData = {
    transitionToCSSR: true,
    detectedDuring: "ambiguous_clarification",
    clarificationA: state.clarificationResponses.A,
    clarificationB: state.clarificationResponses.B,
    cssrTrigger,
  };
  return {
    conversationContext: JSON.stringify(contextData),
    shouldInvokeCSSR: true,
    shouldShutdown: true, // Will shutdown after screening
    protocolComplete: false,
  };
}

async function completeLowRiskNode(state: typeof ConversationState.State) {
  // Check if we just finished "Past Resolved"
  // If last message was the Follow-up closing?
  // Actually, Manager sends "RESOLVE" -> we come here.
  // We can customize the message if it was past resolved?
  // Let's stick to the generic nice message or Manager could generate it (future optimization).
  // For now:
  const completionMessage = new AIMessage({
    content:
      "Thanks for sharing that with me. It sounds like things are okay, and I'm here if you want to keep talking about anything else.",
  });
  if (state.alertId) {
    await updateAlertStatus(state.alertId, "resolved", "chatbot");
  }
  return {
    messages: [completionMessage],
    protocolComplete: true,
    shouldShutdown: false,
  };
}

async function provideCrisisResourcesNode(
  _state: typeof ConversationState.State,
) {
  return {
    messages: [new AIMessage({ content: CRISIS_RESOURCES_MESSAGE })],
    resourcesDisplayed: true,
  };
}

async function routeToIndirectNode(_state: typeof ConversationState.State) {
  return {
    currentQuestionText: null,
    protocolComplete: false,
    shouldInvokeIndirect: true,
    shouldShutdown: false,
  };
}

async function shutdownNode(state: typeof ConversationState.State) {
  const shutdownMessage = new AIMessage({
    content:
      "Thank you for being open with me. Remember that support is always available, and your school counselor will be reaching out soon.",
  });
  if (state.alertId) {
    await updateAlertStatus(state.alertId, "in_progress");
  }
  if (state.chatAlertId) {
    await updateChatAlert(state.chatAlertId, { isShutdown: true });
  }
  return {
    messages: [shutdownMessage],
    protocolComplete: true,
    shouldShutdown: true,
  };
}

// ============================================================================
// ROUTING
// ============================================================================

function routeAfterManager(state: typeof ConversationState.State): string {
  const lastMsg = state.messages[state.messages.length - 1];

  // 1. If Manager asked a question (AI message is last), wait for user input -> END
  if (!lastMsg || !isHumanMessage(lastMsg)) {
    return END;
  }

  // 2. Check Assessment / Decisions from State
  const assessmentA = state.clarificationResponses.A?.riskAssessment;
  const answerB = state.clarificationResponses.B?.answer;

  // --- High Risk / Escalation Logic ---
  if (assessmentA === "direct_connection") return "provide_crisis_resources";
  if (assessmentA === "indirect_connection") return "route_to_indirect";
  if (assessmentA === "backtracking" || assessmentA === "unclear")
    return "announce_cssr_transition";
  if (answerB === "yes") return "route_to_cssr_screening";

  // --- Low Risk / Resolution Logic ---
  if (assessmentA === "low") {
    return "complete_low_risk";
  }

  // If "RESOLVE" signaled but assessmentA wasn't set to low?
  // Manager might resolve via 'past_resolved'.
  // Orchestrator prompt returns RESOLVE for past_resolved too.
  // We should populate assessmentA="low" OR handle "past_resolved" as low.
  // Let's assume Manager sets assessmentA="low" for simple resolution.

  // For Past Resolved sequence:
  // Manager: ASK_FOLLOWUP -> User replies -> Manager: RESOLVE
  // -> routes to complete_low_risk.

  // Fallback
  return "announce_cssr_transition";
}

function routeAfterResources(_state: typeof ConversationState.State): string {
  return "shutdown";
}

function routeFromStart(_state: typeof ConversationState.State): "manage_risk" {
  // Simplified start: Always go to Manager.
  // Manager handles resuming because it looks at "LastQuestionAsked" and History.
  return "manage_risk";
}

// ============================================================================
// GRAPH CONSTRUCTION
// ============================================================================

export function buildAmbiguousRiskGraph() {
  const workflow = new StateGraph(ConversationState)
    .addNode("manage_risk", manageRiskNode)
    .addNode("complete_low_risk", completeLowRiskNode)
    .addNode("announce_cssr_transition", announceCSSRTransitionNode)
    .addNode("route_to_cssr_screening", routeToCSSRScreeningNode)
    .addNode("provide_crisis_resources", provideCrisisResourcesNode)
    .addNode("route_to_indirect", routeToIndirectNode)
    .addNode("shutdown", shutdownNode)

    // Removed: Labile / PastResolved nodes

    // START
    .addConditionalEdges(START, routeFromStart)

    // MANAGED FLOW
    .addConditionalEdges("manage_risk", routeAfterManager)

    // COMPLETION PATHS
    .addEdge("complete_low_risk", END)
    .addEdge("announce_cssr_transition", "route_to_cssr_screening")
    .addEdge("route_to_cssr_screening", END)
    .addConditionalEdges("provide_crisis_resources", routeAfterResources)
    .addEdge("route_to_indirect", END)
    .addEdge("shutdown", END);

  return workflow.compile();
}
