/**
 * Direct Risk Handler Subgraph
 * Handles immediate direct suicidal statements with linear flow:
 * 1. Provide crisis resources
 * 2. Shutdown chatbot
 *
 * Note: Alert creation happens in the main router graph before entering this subgraph.
 */

import { AIMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import { updateChatAlert } from "../../tools/alert-tools";
import { CRISIS_RESOURCES_MESSAGE } from "../constants";
import { ConversationState } from "../conversation-state";

// ============================================================================
// NODES
// ============================================================================

/**
 * Node 1: Provide Crisis Resources
 * Display crisis hotline information and resources
 */
async function provideCrisisResourcesNode(
  _state: typeof ConversationState.State,
): Promise<Partial<typeof ConversationState.State>> {
  const resourceMessage = new AIMessage({
    content: CRISIS_RESOURCES_MESSAGE,
  });

  return {
    messages: [resourceMessage],
    resourcesDisplayed: true,
  };
}

/**
 * Node 2: Shutdown
 * Set shutdown flag to terminate chatbot conversation and mark in database
 */
async function shutdownNode(
  state: typeof ConversationState.State,
): Promise<Partial<typeof ConversationState.State>> {
  const shutdownMessage = new AIMessage({
    content:
      "Your school counselor has been notified and will be reaching out to you soon. I'm here for you, but right now it's important that you connect with someone who can provide immediate support.",
  });

  // Mark this chat alert as shutdown in the database
  // Note: shutdownRiskType is already set during alert creation, just set isShutdown flag
  if (state.chatAlertId) {
    await updateChatAlert(state.chatAlertId, {
      isShutdown: true,
    });
  }

  return {
    messages: [shutdownMessage],
    shouldShutdown: true,
    protocolComplete: true,
  };
}

/**
 * Build the Direct Risk Handler subgraph
 */
export function buildDirectRiskGraph() {
  const graph = new StateGraph(ConversationState)
    // Add nodes
    .addNode("provide_crisis_resources", provideCrisisResourcesNode)
    .addNode("shutdown", shutdownNode)

    // Define linear flow (alert already created by router)
    .addEdge(START, "provide_crisis_resources")
    .addEdge("provide_crisis_resources", "shutdown")
    .addEdge("shutdown", END);

  return graph.compile();
}
