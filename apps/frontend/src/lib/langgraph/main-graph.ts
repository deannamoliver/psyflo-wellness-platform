import { AIMessage, isHumanMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { buildBaseAgentGraph } from "./base-agent";
import { getCheckpointer } from "./checkpointer";
import {
  getConversationSummaryPrompt,
  HANDOVER_PROMPT,
  RISK_DETECTION_PROMPT,
} from "./prompts";
import { ConversationState } from "./risk-protocol/conversation-state";
import { buildMainRouterGraph } from "./risk-protocol/risk-router";
import {
  createChatAlert,
  createRiskAlert,
  createSituationalAlert,
  updateChatAlert,
} from "./tools/alert-tools";
import { createWellnessCoachHandoff } from "./tools/wellness-coach-tools";

/**
 * Node 1: Analyze Risk
 * Uses LLM to detect suicide risk indicators in recent messages
 */
async function analyzeRiskNode(state: typeof ConversationState.State) {
  // Get last 3 messages for context (or all if fewer)
  const recentMessages = state.messages.slice(-3);
  const lastUserMessage = recentMessages
    .filter((m) => isHumanMessage(m))
    .slice(-1)[0];

  if (!lastUserMessage) {
    return {
      riskDetected: false,
      riskType: null,
    };
  }

  // Initialize Gemini model for risk detection
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3, // Lower temperature for more consistent risk detection
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  // Build prompt with conversation context
  // Use .text property to get text content from messages (handles all content types)
  const conversationContext = recentMessages
    .map((m) => {
      const role = isHumanMessage(m) ? "Student" : "Assistant";
      // Use .text property which handles all content types (string, MessageContent, MessageContentComplex)
      // biome-ignore lint/suspicious/noExplicitAny: LangChain message types have dynamic content
      const content = (m as any).text || m.content.toString();
      return `${role}: ${content}`;
    })
    .join("\n");

  const prompt = `${RISK_DETECTION_PROMPT}\n\n${conversationContext}`;

  try {
    const response = await model.invoke(prompt);
    const responseText = response.content.toString();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "[NODE] analyze_risk - Failed to parse LLM response:",
        responseText,
      );
      return {
        riskDetected: false,
        riskType: null,
      };
    }

    const result = JSON.parse(jsonMatch[0]);

    if (result.riskDetected) {
    }

    // Normalize riskType to lowercase (LLM may return uppercase)
    const normalizedRiskType = result.riskType?.toLowerCase() as
      | "direct"
      | "indirect"
      | "ambiguous"
      | null;

    // For ambiguous risks, patternType is the same as riskSubtype
    const patternType =
      normalizedRiskType === "ambiguous" ? result.riskSubtype : null;

    return {
      riskDetected: result.riskDetected,
      riskDomain: result.riskDomain || (result.riskDetected ? "suicide" : null),
      riskType: normalizedRiskType,
      riskSubtype: result.riskSubtype,
      patternType: patternType,
      triggeringStatement: result.triggeringStatement,
      extractedContext: result.extractedContext,
      situationalDistress: result.situationalDistress || null,
      abuseCategory: result.abuseCategory || null,
      abuseSeverity: result.abuseSeverity || null,
      harmCategory: result.harmCategory || null,
    };
  } catch (error) {
    console.error("[NODE] analyze_risk - Error during risk detection:", error);
    // Fail safe: treat errors as no risk to avoid false positives
    return {
      riskDetected: false,
      riskType: null,
    };
  }
}

/**
 * Node 2: Create Alerts
 * Creates alert and chat_alert records when risk is detected
 */
async function createAlertsNode(state: typeof ConversationState.State) {
  if (!state.triggeringStatement) {
    console.error("[NODE] create_alerts - No triggering statement found!");
    return {};
  }

  if (
    !state.riskType &&
    state.riskDomain !== "abuse_neglect" &&
    state.riskDomain !== "harm_to_others"
  ) {
    console.error("[NODE] create_alerts - No risk type found!");
    return {};
  }

  // Determine Alert Type
  let alertType: "safety" | "abuse_neglect" | "harm_to_others" = "safety";
  if (state.riskDomain === "abuse_neglect") {
    alertType = "abuse_neglect";
  } else if (state.riskDomain === "harm_to_others") {
    alertType = "harm_to_others";
  }

  // Create parent alert
  const alertResult = await createRiskAlert(alertType);

  // Create chat_alert linked to parent alert with risk type
  const conversationHistory = state.messages.map((m) => ({
    role: isHumanMessage(m) ? "user" : "assistant",
    content: m.content.toString(),
  }));

  // Determine Risk Type for Chat Alert
  let riskType:
    | "direct"
    | "indirect"
    | "ambiguous"
    | "abuse_neglect"
    | "harm_to_others";
  if (state.riskDomain === "abuse_neglect") {
    riskType = "abuse_neglect";
  } else if (state.riskDomain === "harm_to_others") {
    riskType = "harm_to_others";
  } else if (state.riskType) {
    riskType = state.riskType;
  } else {
    riskType = "ambiguous";
  }

  const chatAlertResult = await createChatAlert(
    alertResult.alertId,
    state.chatSessionId,
    state.triggeringStatement,
    conversationHistory,
    riskType, // Pass risk type to be stored on creation
  );

  // Reset all protocol-related state for the new risk session
  // This is critical when a student re-enters the protocol after a previous session
  // (e.g., Brooklyn Bridge → low risk → later mentions past suicidality)
  return {
    alertId: alertResult.alertId,
    chatAlertId: chatAlertResult.chatAlertId,
    // Mark that a risk alert has been created (prevents re-triggering in same session)
    riskAlertCreated: true,
    // Reset protocol control flags
    protocolComplete: false,
    shouldShutdown: false,
    shouldInvokeIndirect: false,
    shouldInvokeCSSR: false,
    resourcesDisplayed: false,
    pastResolvedFollowupAsked: false,
    // Reset ambiguous risk state
    clarificationStep: null,
    clarificationResponses: {},
    // Reset indirect/CSSR risk state
    cssrConfig: null,
    cssrState: null,
    currentQuestionText: null,
    anyYesResponses: false,
    // Note: Do NOT reset riskType, riskSubtype, patternType, extractedContext
    // as these are freshly set by analyzeRiskNode for the current risk detection
  };
}

/**
 * Node 2b: Create Situational Alert
 * Creates an auto-resolved alert for situational distress (counselor awareness only)
 * This does NOT trigger the risk protocol - student continues normal conversation
 */
async function createSituationalAlertNode(
  state: typeof ConversationState.State,
) {
  if (!state.situationalDistress) {
    console.error(
      "[NODE] create_situational_alert - No situational distress context!",
    );
    return {};
  }

  // Get the last user message as the triggering statement
  const lastUserMessage = state.messages
    .filter((m) => isHumanMessage(m))
    .slice(-1)[0];
  const triggeringStatement = lastUserMessage
    ? // biome-ignore lint/suspicious/noExplicitAny: LangChain message types have dynamic content
      (lastUserMessage as any).text || lastUserMessage.content.toString()
    : "Unknown";

  // Create auto-resolved alert for counselor awareness
  await createSituationalAlert(
    state.chatSessionId,
    state.situationalDistress,
    triggeringStatement,
  );

  // Mark that we've created a situational alert (prevents duplicates this session)
  // Clear situationalDistress after creating alert
  return {
    situationalDistress: null,
    situationalAlertCreated: true,
  };
}

/**
 * Node 3: Generate Conversation Summary
 * Creates a natural language summary of the conversation for database storage
 * This runs after the risk protocol to provide context for counselors
 */
async function generateConversationSummaryNode(
  state: typeof ConversationState.State,
) {
  // Only generate summary if we have an active alert
  if (!state.chatAlertId) {
    console.log(
      "[NODE] generate_conversation_summary - No chatAlertId, skipping",
    );
    return {};
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.5,
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  const conversationText = state.messages
    .map((m) => {
      const role = isHumanMessage(m) ? "Student" : "Chatbot";
      // biome-ignore lint/suspicious/noExplicitAny: LangChain message types have dynamic content
      const content = (m as any).text || m.content.toString();
      return `${role}: ${content}`;
    })
    .join("\n");

  const summaryPrompt = getConversationSummaryPrompt(conversationText);

  try {
    const response = await model.invoke(summaryPrompt);
    const summary = response.content.toString().trim();

    console.log("[NODE] generate_conversation_summary - Generated summary:", {
      chatAlertId: state.chatAlertId,
      summaryLength: summary.length,
    });

    return {
      conversationContext: summary,
    };
  } catch (error) {
    console.error(
      "[NODE] generate_conversation_summary - Error generating summary:",
      error,
    );
    // Fallback: use a simple summary
    return {
      conversationContext: `Student expressed concerning thoughts. Risk protocol was initiated with triggering statement: "${state.triggeringStatement}"`,
    };
  }
}

/**
 * Node 4: Persist Alert State
 * Updates chat_alerts with latest protocol state after risk protocol completes
 * This runs after the risk protocol to save clarificationResponses, cssrState, and conversationContext
 */
async function persistAlertStateNode(state: typeof ConversationState.State) {
  // Only persist if we have an active alert
  if (!state.chatAlertId) {
    console.log("[NODE] persist_alert_state - No chatAlertId, skipping");
    return {};
  }

  // Persist all protocol data to database
  await updateChatAlert(state.chatAlertId, {
    conversationContext: state.conversationContext ?? undefined,
    clarificationResponses: state.clarificationResponses,
    cssrState: state.cssrState,
  });

  console.log("[NODE] persist_alert_state - Persisted protocol state:", {
    chatAlertId: state.chatAlertId,
    hasConversationContext: !!state.conversationContext,
    hasClarificationResponses:
      !!state.clarificationResponses &&
      Object.keys(state.clarificationResponses).length > 0,
    hasCssrState: !!state.cssrState,
  });

  return {};
}

/**
 * Node: handover_to_coach
 * Informs the user that they are being connected to a wellness coach
 */
async function handoverToCoachNode(
  state: typeof ConversationState.State,
  config: RunnableConfig,
) {
  // Create wellness coach handoff record (same as manual "Switch to Wellness Coach")
  try {
    await createWellnessCoachHandoff({
      chatSessionId: state.chatSessionId,
      alertId: state.alertId,
    });
  } catch (error) {
    console.error(
      "[NODE] handover_to_coach - Failed to create handoff:",
      error,
    );
  }

  // Get the last user message for context
  const lastUserMessage = state.messages
    .filter((m) => isHumanMessage(m))
    .slice(-1)[0];
  const lastUserMessageText = lastUserMessage
    ? // biome-ignore lint/suspicious/noExplicitAny: LangChain message types have dynamic content
      (lastUserMessage as any).text || lastUserMessage.content.toString()
    : "The user has expressed a need for help.";

  // Initialize Gemini model for generating the handover message
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7, // Higher temperature for more creative, natural-sounding language
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  // Build the prompt with the last user message as context
  const prompt = HANDOVER_PROMPT.replace(
    "{conversation_context}",
    `Student: ${lastUserMessageText}`,
  );

  try {
    const response = await model.invoke(prompt, config);
    const lastMessage = response.content.toString().trim();

    return {
      messages: [new AIMessage(lastMessage)],
      shouldShutdown: true, // Ensure conversation ends after handover
    };
  } catch (error) {
    console.error(
      "[NODE] handover_to_coach - Error generating handover message:",
      error,
    );
    // Fallback to a safe, static message in case of an error
    const fallbackMessage =
      "It sounds like you're going through a lot. I'm connecting you with one of our wellness coaches right now who can help. Please wait just a moment.";
    return {
      messages: [new AIMessage(fallbackMessage)],
      shouldShutdown: true,
    };
  }
}

/**
 * Node: inform_user_to_wait
 * Informs the user to wait for a connection after a handover has been initiated.
 */
async function informUserToWaitNode(state: typeof ConversationState.State) {
  const waitMessage =
    "Thank you for your patience. We're connecting you with a wellness coach. Please wait a moment.";
  return {
    messages: state.messages.concat(new AIMessage(waitMessage)),
    shouldShutdown: true, // Keep shutdown state active
  };
}

/**
 * Routing: After creating an alert, decide whether to start the full protocol or just hand over.
 */
function routeAfterAlertCreation(
  _state: typeof ConversationState.State,
): string {
  const riskProtocolEnabled = process.env["RISK_PROTOCOL"] === "true";

  if (riskProtocolEnabled) {
    return "risk_protocol";
  } else {
    // If protocol is disabled, go straight to handover after creating the alert
    return "handover_to_coach";
  }
}

/**
 * Routing: Determine entry point based on protocol state
 * If protocol is in progress (alertId exists and not complete), continue protocol
 * Otherwise, analyze risk for new messages
 */
function routeFromStart(state: typeof ConversationState.State): string {
  // If a handover has been initiated, keep showing the waiting message
  if (state.shouldShutdown) {
    return "inform_user_to_wait";
  }

  // If we have an alert and protocol is not complete, continue the protocol
  if (state.alertId && !state.protocolComplete) {
    return "risk_protocol";
  }

  // Otherwise, analyze new message for risk
  return "analyze_risk";
}

/**
 * Routing: Determine if risk was detected or situational distress noted
 */
function routeAfterRiskAnalysis(state: typeof ConversationState.State): string {
  // Risk detected → create an alert. The next step is decided by `routeAfterAlertCreation`.
  // This is only checked if a risk alert hasn't already been created in this session.
  if (state.riskDetected && !state.riskAlertCreated) {
    return "create_alerts";
  }

  // Situational distress (no risk) → create awareness alert, then base agent
  // Only create ONE situational alert per session to avoid spamming counselors
  if (state.situationalDistress && !state.situationalAlertCreated) {
    return "create_situational_alert";
  }

  // No concerns, already handled risk, or already created situational alert → base agent
  return "base_agent";
}

/**
 * Routing: After protocol complete, decide whether to end or continue to base agent
 * If protocol is not complete, end (waiting for user input)
 * If shouldShutdown is true (high risk), end the conversation
 * If shouldShutdown is false AND protocol is complete (low risk / past resolved), let base agent add a natural response
 */
function routeAfterProtocolComplete(
  state: typeof ConversationState.State,
): string {
  // If protocol isn't complete yet, just end this turn (waiting for user input)
  if (!state.protocolComplete) {
    return "end";
  }

  // Protocol complete with shutdown required (high risk) - hand over to coach
  // This creates a wellness coach handoff so the student gets the "waiting for coach" experience
  if (state.shouldShutdown) {
    return "handover_to_coach";
  }

  // Protocol complete without shutdown - let base agent respond naturally
  return "base_agent";
}

/**
 * Build the main conversation graph
 */
export async function buildMainGraph() {
  const riskProtocolGraph = buildMainRouterGraph();
  const baseAgentGraph = buildBaseAgentGraph();

  const workflow = new StateGraph(ConversationState)
    .addNode("analyze_risk", analyzeRiskNode)
    .addNode("create_alerts", createAlertsNode)
    .addNode("create_situational_alert", createSituationalAlertNode)
    .addNode("generate_conversation_summary", generateConversationSummaryNode)
    .addNode("persist_alert_state", persistAlertStateNode)
    .addNode("risk_protocol", riskProtocolGraph)
    .addNode("handover_to_coach", handoverToCoachNode)
    .addNode("inform_user_to_wait", informUserToWaitNode)
    .addNode("base_agent", baseAgentGraph);

  // Set entry point with conditional routing
  // Check if protocol is in progress, if so skip analysis and go straight to protocol
  workflow
    .addConditionalEdges(START, routeFromStart, {
      analyze_risk: "analyze_risk",
      risk_protocol: "risk_protocol",
      inform_user_to_wait: "inform_user_to_wait",
    })
    .addConditionalEdges("analyze_risk", routeAfterRiskAnalysis, {
      create_alerts: "create_alerts",
      create_situational_alert: "create_situational_alert",
      base_agent: "base_agent",
    })

    // After creating an alert, decide whether to run the protocol or hand over
    .addConditionalEdges("create_alerts", routeAfterAlertCreation, {
      risk_protocol: "risk_protocol",
      handover_to_coach: "handover_to_coach",
    })

    // Situational alert → base agent (no protocol, just awareness)
    .addEdge("create_situational_alert", "base_agent")

    // Generate summary after risk protocol, then persist all data
    .addEdge("risk_protocol", "generate_conversation_summary")
    .addEdge("generate_conversation_summary", "persist_alert_state")

    // After persisting: route based on shutdown status
    // If shutdown required (high risk), end conversation
    // If no shutdown (low risk / past resolved), let base agent respond naturally
    .addConditionalEdges("persist_alert_state", routeAfterProtocolComplete, {
      base_agent: "base_agent",
      handover_to_coach: "handover_to_coach",
      end: END,
    })
    .addEdge("base_agent", END)
    .addEdge("handover_to_coach", END)
    .addEdge("inform_user_to_wait", END);

  // Compile with PostgreSQL checkpointer for conversation persistence
  const checkpointer = await getCheckpointer();
  const graph = workflow.compile({ checkpointer });

  // Compile without checkpointer (for testing)
  // const graph = workflow.compile();

  return graph;
}

/**
 * Get or create singleton instance of main graph
 */
let mainGraphInstance: Awaited<ReturnType<typeof buildMainGraph>> | null = null;

export async function getMainGraph() {
  if (mainGraphInstance) return mainGraphInstance;
  mainGraphInstance = await buildMainGraph();
  return mainGraphInstance;
}
