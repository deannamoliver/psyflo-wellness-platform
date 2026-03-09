import {
  AIMessage,
  type HumanMessage,
  isHumanMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import {
  getConversationalWrapperPrompt,
  getYesNoParserPrompt,
} from "../../prompts";
import { updateChatAlert } from "../../tools/alert-tools";
import {
  CRISIS_RESOURCES_MESSAGE,
  PAST_RESOLVED_CLOSING,
  PAST_RESOLVED_FOLLOWUP,
} from "../constants";
import { ConversationState } from "../conversation-state";
import {
  determineNextCSSRQuestion,
  getCSSRQuestion,
  initializeCSSRState,
  isCSSRComplete,
  shouldShutdownFromCSSR,
} from "../utils/question-builder";

// ============================================================================
// NODES
// ============================================================================

/**
 * Node 1: Manage CSSR (The Orchestrator)
 *
 * Central hub for CSSR screening that:
 * 1. Checks for user input and parses answers (Yes/No/Past Resolved)
 * 2. Updates CSSR state
 * 3. Determines next step (Next Question, Complete, Past Resolved Followup)
 * 4. Generates conversational wrapper for the next question
 */
async function manageCSSRNode(
  state: typeof ConversationState.State,
): Promise<Partial<typeof ConversationState.State>> {
  const cssrState = state.cssrState || initializeCSSRState();
  const lastMessage = state.messages[state.messages.length - 1];

  // --- PHASE 1: PROCESS INPUT (If User Just Responded) ---
  const isHumanResponse = lastMessage && isHumanMessage(lastMessage);

  // We only process input if:
  // 1. It's a user message
  // 2. We have an active question (cssrState.currentQuestion)
  // 3. We are NOT just starting the flow/transitioning from Ambiguous
  const isProcessingResponse = isHumanResponse && cssrState.currentQuestion;

  if (isProcessingResponse) {
    // Check if we were asking the "Past Resolved" followup?
    if (state.pastResolvedFollowupAsked) {
      // User answered "What helped you?". We are done.
      // Handled by routing logic or explicit completion here?
      // Let's mark as complete locally for clarity in logic below.
    } else {
      // Evaluate Yes/No/PastResolved
      const userResponse = (lastMessage as HumanMessage).content.toString();
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0,
        apiKey: process.env["GOOGLE_API_KEY"],
      });

      const answerPrompt = getYesNoParserPrompt({
        questionAsked: state.currentQuestionText || "",
        userResponse: userResponse,
      });

      try {
        const response = await model.invoke(answerPrompt);
        const llmAnswer = response.content.toString().toLowerCase().trim();

        if (llmAnswer.includes("unclear")) {
          // Clarification Loop:
          // 1. Do NOT update cssrState answer
          // 2. Do NOT advance question
          // 3. Return clarification message
          return {
            messages: [
              new AIMessage({
                content:
                  "I want to be sure I understand correctly. To help me support you best, could you clarify - is that a Yes or a No?",
              }),
            ],
            // No state update means next loop will process the *next* user message as the answer to the *same* question
          };
        }

        let answer: boolean | "past_resolved";
        if (llmAnswer.includes("past_resolved")) answer = "past_resolved";
        else answer = llmAnswer.includes("yes");

        // Update State
        const currentQuestion = cssrState.currentQuestion;
        if (currentQuestion) {
          cssrState[currentQuestion] = {
            answer,
            questionText: state.currentQuestionText || "",
          };
        }
      } catch (e) {
        console.error("Link parsing error", e);
        // Default to yes for safety? Or ask again?
        // For now, let's assume worst case (yes) to be safe or retry.
        // Throwing might crash graph. Defaulting to YES is safest default.
        const currentQuestion = cssrState.currentQuestion;
        if (currentQuestion) {
          cssrState[currentQuestion] = {
            answer: true,
            questionText: state.currentQuestionText || "",
          };
        }
      }
    }
  }

  // --- PHASE 2: DETERMINE NEXT STEP ---

  // Special Case: Handling Past Resolved Followup response
  if (state.pastResolvedFollowupAsked && isHumanResponse) {
    return { protocolComplete: true }; // Trigger exit
  }

  // Special Case: Detect "Past Resolved" answer just received
  // If the *current* answer processing resulted in "past_resolved", interruptions!
  if (
    cssrState.currentQuestion &&
    cssrState[cssrState.currentQuestion]?.answer === "past_resolved"
  ) {
    const followupMsg = new AIMessage({ content: PAST_RESOLVED_FOLLOWUP });
    return {
      messages: [followupMsg],
      cssrState,
      pastResolvedFollowupAsked: true, // Mark this phase
      currentQuestionText: PAST_RESOLVED_FOLLOWUP,
    };
  }

  // Standard Flow: Get Next Question
  const nextStep = determineNextCSSRQuestion(cssrState);

  // --- PHASE 3: EXECUTE STEP ---

  // CASE: COMPLETE
  if (nextStep === "complete") {
    // Evaluate Risk
    const shouldShutdown = shouldShutdownFromCSSR(cssrState);
    return {
      cssrState,
      shouldShutdown,
      // If Low Risk -> protocolComplete will be handled by route
    };
  }

  // CASE: NEXT QUESTION (q1...q6)
  const questionId = nextStep;
  const rawQuestionText = getCSSRQuestion(questionId);
  const isFirstQuestion = questionId === "q1";

  // Generate Wrapper
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.8, // Higher temperature for more natural, varied responses
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  const wrapperPrompt = getConversationalWrapperPrompt({
    rawQuestionText,
    isFirstQuestion,
    triggeringStatement: state.triggeringStatement,
    riskSubtype: state.riskSubtype,
    hasTransitioned: state.hasTransitioned,
  });

  let content = rawQuestionText;
  try {
    // Ensure prompt format is safe for Gemini (Human msg at end)
    const instructionalPrompt =
      HumanMessagePromptTemplate.fromTemplate(wrapperPrompt);
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("msgs"),
      instructionalPrompt,
    ]);
    const res = await model.invoke(
      await chatPrompt.invoke({ msgs: state.messages }),
    );
    content = res.content.toString();
  } catch (error) {
    console.error("Wrapper generation failed", error);
    // Fallback to raw text
  }

  // Update State for next turn
  cssrState.currentQuestion = questionId;

  return {
    messages: [new AIMessage({ content })],
    cssrState,
    currentQuestionText: rawQuestionText, // Store raw text for parser context next turn
  };
}

/**
 * Node 2: Shutdown / Crisis
 * Handles high risk outcomes
 */
async function shutdownAndResourcesNode(state: typeof ConversationState.State) {
  const messages = [];

  // 1. Resources (if not shown)
  if (!state.resourcesDisplayed) {
    messages.push(new AIMessage({ content: CRISIS_RESOURCES_MESSAGE }));
  }

  // 2. Shutdown Message
  messages.push(
    new AIMessage({
      content:
        "Your school counselor has been notified... (Standard Shutdown Msg)",
    }),
  );

  // DB Updates
  if (state.chatAlertId) {
    await updateChatAlert(state.chatAlertId, { isShutdown: true });
  }

  return {
    messages,
    protocolComplete: true,
    shouldShutdown: true,
    resourcesDisplayed: true,
  };
}

/**
 * Node 3: Low Risk Completion
 * Handles clean exit for low risk CSSR
 */
async function completeLowRiskNode(state: typeof ConversationState.State) {
  // If we came from Past Resolved, we might want a specific closing?
  const msg = state.pastResolvedFollowupAsked
    ? PAST_RESOLVED_CLOSING
    : "Thank you for sharing that.";

  return {
    messages: [new AIMessage({ content: msg })],
    protocolComplete: true,
  };
}

// ============================================================================
// ROUTING
// ============================================================================

function routeAfterManager(state: typeof ConversationState.State): string {
  // 1. If Manager returned a message (AI), END to wait for user
  const lastMsg = state.messages[state.messages.length - 1];
  if (lastMsg && !isHumanMessage(lastMsg)) {
    return END;
  }

  // 2. Logic: If user responded, Manager processes it.
  // If Manager decides we are COMPLETE, checking flags:

  // If protocolComplete is explicitly set (e.g. from PastResolved closure)
  if (state.protocolComplete) {
    // Typically we'd route to a closer, but if ManageNode set it true, maybe it's done?
    // Let's route based on RISK for the closing message
    if (state.shouldShutdown) return "shutdown";
    return "complete";
  }

  // If we just finished the questions (nextStep was complete -> shouldShutdown set)
  if (state.cssrState && isCSSRComplete(state.cssrState)) {
    if (state.shouldShutdown) return "shutdown";
    return "complete";
  }

  // Default loop back if vaguely stuck? Should not happen if logic holds.
  return END;
}

function routeFromStart(_state: typeof ConversationState.State): "manage_cssr" {
  return "manage_cssr";
}

// ============================================================================
// GRAPH
// ============================================================================

export function buildIndirectRiskGraph() {
  const workflow = new StateGraph(ConversationState)
    .addNode("manage_cssr", manageCSSRNode)
    .addNode("shutdown", shutdownAndResourcesNode)
    .addNode("complete", completeLowRiskNode)

    .addConditionalEdges(START, routeFromStart)

    .addConditionalEdges("manage_cssr", routeAfterManager, {
      [END]: END,
      shutdown: "shutdown",
      complete: "complete",
    })

    .addEdge("shutdown", END)
    .addEdge("complete", END);

  return workflow.compile();
}
