import { END, START, StateGraph } from "@langchain/langgraph";
import { ConversationState } from "./conversation-state";
import { abuseNeglectGraph } from "./subgraphs/abuse-neglect";
import { buildAmbiguousRiskGraph } from "./subgraphs/ambiguous-risk";
import { buildDirectRiskGraph } from "./subgraphs/direct-risk";
import { harmOthersGraph } from "./subgraphs/harm-others";
import { buildIndirectRiskGraph } from "./subgraphs/indirect-risk";

/**
 * Prepare CSSR configuration when triggered from ambiguous subgraph
 *
 * In the new CSSR flow, we always start at Q1 regardless of how we got here.
 * This node simply clears the shouldInvokeCSSR flag and allows the flow to continue.
 *
 * The indirect risk subgraph will initialize CSSR state starting at Q1.
 */
async function prepareCSSRConfigNode(state: typeof ConversationState.State) {
  // Log the trigger source for debugging/tracking
  if (state.conversationContext) {
    try {
      const context = JSON.parse(state.conversationContext);
      const cssrTrigger = context.cssrTrigger;
      console.log(
        `[prepareCSSRConfigNode] CSSR triggered from ambiguous clarification: ${cssrTrigger}`,
      );
    } catch (_error) {
      // Ignore parse errors
    }
  }

  return {
    // Clear the flag after processing
    shouldInvokeCSSR: false,
    // cssrConfig is no longer used - CSSR always starts at Q1
    cssrConfig: null,
  };
}

/**
 * Route to appropriate subgraph based on initial risk classification
 *
 * Called at the start of the protocol to determine which risk assessment
 * path to follow based on the riskType detected in the triggering statement.
 *
 * Also handles protocol completion: if protocolComplete is true, end the graph.
 */
function routeToSubgraph(state: typeof ConversationState.State): string {
  // If protocol is complete, end the graph
  if (state.protocolComplete) {
    return END;
  }

  // Check for Abuse & Neglect domain first
  if (state.riskDomain === "abuse_neglect") {
    return "abuse_neglect";
  }

  // Check for Harm to Others domain
  if (state.riskDomain === "harm_to_others") {
    return "harm_to_others";
  }

  console.log(
    `[RiskRouter] Routing. riskType: ${state.riskType}, cssrQuestion: ${state.cssrState?.currentQuestion}, hasTransitioned: ${state.hasTransitioned}`,
  );

  // Check if CSSR is already in progress (e.g. yielded from Ambiguous flow)
  // If we have an active question or follow-up pending, we must continue in the indirect subgraph
  if (state.cssrState?.currentQuestion || state.pastResolvedFollowupAsked) {
    return "indirect_risk";
  }

  if (state.riskType === "direct") {
    return "direct_risk";
  }
  if (state.riskType === "indirect") {
    return "indirect_risk";
  }
  if (state.riskType === "ambiguous") {
    return "ambiguous_risk";
  }

  console.error(`⚠️ Unknown riskType: ${state.riskType}`);
  return END;
}

/**
 * Route after ambiguous subgraph completes
 *
 * Checks if the ambiguous subgraph set routing flags:
 * - shouldInvokeIndirect: Route to indirect risk handler (detected indirect themes in Question A)
 * - shouldInvokeCSSR: Route to CSSR config preparation → indirect risk subgraph (Question B or C = yes)
 *
 * Both flags route to indirect risk, but shouldInvokeCSSR requires config preparation first.
 */
function routeAfterAmbiguous(state: typeof ConversationState.State): string {
  // Check shouldInvokeCSSR first (takes precedence - needs config preparation)
  if (state.shouldInvokeCSSR) {
    return "prepare_cssr_config";
  }

  // Check shouldInvokeIndirect (direct route to indirect risk handler)
  if (state.shouldInvokeIndirect) {
    return "indirect_risk";
  }

  return END;
}

/**
 * Build the main router graph
 *
 * Orchestrates the execution of risk protocol subgraphs with conditional routing.
 * All graphs now use ConversationState - no more state mapping needed!
 */
export function buildMainRouterGraph() {
  // Create subgraphs (these return compiled graphs)
  const directRiskGraph = buildDirectRiskGraph();
  const indirectRiskGraph = buildIndirectRiskGraph();
  const ambiguousRiskGraph = buildAmbiguousRiskGraph();

  // Build main router
  const workflow = new StateGraph(ConversationState)
    // Add subgraph invocation nodes - state passed through directly
    .addNode("direct_risk", directRiskGraph)
    .addNode("indirect_risk", indirectRiskGraph)
    .addNode("ambiguous_risk", ambiguousRiskGraph)
    .addNode("abuse_neglect", abuseNeglectGraph)
    .addNode("harm_to_others", harmOthersGraph)

    // Add CSSR config preparation node
    .addNode("prepare_cssr_config", prepareCSSRConfigNode)

    // Initial routing from START
    .addConditionalEdges(START, routeToSubgraph, {
      direct_risk: "direct_risk",
      indirect_risk: "indirect_risk",
      ambiguous_risk: "ambiguous_risk",
      abuse_neglect: "abuse_neglect",
      harm_to_others: "harm_to_others",
    })

    // Direct risk → END
    .addEdge("direct_risk", END)

    // Indirect risk → END (includes CSSR invoked from ambiguous)
    .addEdge("indirect_risk", END)

    // Abuse & Neglect → END
    .addEdge("abuse_neglect", END)

    // Harm to Others → END
    .addEdge("harm_to_others", END)

    // Ambiguous risk → check if CSSR or Indirect should be invoked
    .addConditionalEdges("ambiguous_risk", routeAfterAmbiguous, {
      prepare_cssr_config: "prepare_cssr_config",
      indirect_risk: "indirect_risk",
      [END]: END,
    })

    // CSSR config → indirect risk subgraph
    .addEdge("prepare_cssr_config", "indirect_risk");

  const graph = workflow.compile();
  return graph;
}
