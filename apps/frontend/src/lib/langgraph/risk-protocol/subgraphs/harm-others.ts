import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import {
  HARM_ASSESSMENT_PROMPT,
  HARM_VERIFICATION_PROMPT,
} from "../../prompts/harm-protocol";
import { updateChatAlert } from "../../tools/alert-tools";
import { ConversationState } from "../conversation-state";

/**
 * Node 1: Evaluate Harm Risk
 * Uses LLM to score the risk based on the rubric.
 * Decides whether to ACT NOW or VERIFY RISK.
 */
async function evaluateHarmRiskNode(state: typeof ConversationState.State) {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.1, // Low temperature for strict rubric adherence
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  // Construct context from history
  const recentHistory = state.messages.slice(-5);
  const context = recentHistory
    .map((m) => `${m.getType()}: ${m.content}`)
    .join("\n");

  const prompt = `${HARM_ASSESSMENT_PROMPT}

**STUDENT STATEMENT:** "${state.triggeringStatement}"

**CONTEXT:**
${context}`;

  try {
    const response = await model.invoke(prompt);
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse LLM response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // --- SINGLE TURN VERIFICATION LOGIC ---
    // If LLM says "VERIFY_RISK" but we have already asked (loopCount > 0), force ACT_NOW.
    let action = result.action || "ACT_NOW";

    if (action === "VERIFY_RISK" && (state.harmVerificationCount || 0) > 0) {
      console.log("[HarmProtocol] Forced ACT_NOW after verification turn.");
      action = "ACT_NOW";
    }

    // Default to ACT_NOW if high score (safety override)
    if (result.finalScore > 15) {
      action = "ACT_NOW";
    }

    return {
      harmCategory: result.baseCategory,
      harmScore: result.finalScore,
      harmRiskLevel: result.riskLevel,
      harmAction: action, // Store action for routing
      // Store target/intent in extractedContext for reference
      extractedContext: JSON.stringify({
        target: result.target,
        intent: result.intent,
        reasoning: result.reasoning,
        actionResponse: action,
      }),
    };
  } catch (error) {
    console.error("Error in evaluateHarmRiskNode:", error);
    // Default to moderate risk + ACT_NOW on error to be safe
    return {
      harmRiskLevel: "moderate",
      harmScore: 10,
      harmCategory: 9,
      harmAction: "ACT_NOW",
    };
  }
}

/**
 * Node 2: Handle Harm Action
 * Executes the required action based on risk level.
 */
async function handleHarmActionNode(state: typeof ConversationState.State) {
  const riskLevel = state.harmRiskLevel;

  // HIGH RISK (Red) -> Alert + Shutdown
  if (riskLevel === "high") {
    if (state.chatAlertId) {
      await updateChatAlert(state.chatAlertId, {
        isShutdown: true,
        shutdownRiskType: "harm_to_others",
      });
    }

    return {
      protocolComplete: true,
      isShutdown: true,
      shutdownRiskType: "harm_to_others",
      messages: [
        new AIMessage({
          content:
            "I'm really concerned about what you're sharing. Because this involves safety, I need to pause our conversation here and let a counselor know so they can support you better.",
        }),
      ],
    };
  }

  // MODERATE RISK (Yellow) -> Alert + Shutdown (per user requirement)
  if (riskLevel === "moderate") {
    if (state.chatAlertId) {
      await updateChatAlert(state.chatAlertId, {
        isShutdown: true,
        shutdownRiskType: "harm_to_others",
      });
    }

    return {
      protocolComplete: true,
      isShutdown: true,
      shutdownRiskType: "harm_to_others",
      messages: [
        new AIMessage({
          content:
            "I hear how upset you are, but I'm worried about safety right now. I'm going to pause our chat and have a counselor reach out to help.",
        }),
      ],
    };
  }

  // LOW RISK (Green) -> No Alert + Continue
  // Just return to main graph to let the base agent respond
  return {
    protocolComplete: true,
    isShutdown: false,
    // No messages added - let base agent handle "therapeutic engagement"
  };
}

/**
 * Node 3: Verify Risk (Clarification Question)
 */
async function verifyRiskNode(state: typeof ConversationState.State) {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.4,
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  const prompt = HARM_VERIFICATION_PROMPT.replace(
    "{triggeringStatement}",
    state.triggeringStatement || "",
  );

  let question = "Can you help me understand more about what you mean?";
  try {
    const res = await model.invoke(prompt);
    question = res.content.toString();
  } catch (e) {
    console.error("Error generating verification question", e);
  }

  return {
    messages: [new AIMessage({ content: question })],
    harmVerificationCount: (state.harmVerificationCount || 0) + 1,
  };
}

/**
 * Routing logic
 */
function routeAfterEvaluation(state: typeof ConversationState.State): string {
  if (state.harmAction === "VERIFY_RISK") {
    return "verify_risk";
  }
  return "handle_harm_action";
}

/**
 * Build the Harm to Others Subgraph
 */
export const harmOthersGraph = new StateGraph(ConversationState)
  .addNode("evaluate_harm_risk", evaluateHarmRiskNode)
  .addNode("handle_harm_action", handleHarmActionNode)
  .addNode("verify_risk", verifyRiskNode)

  .addEdge(START, "evaluate_harm_risk")

  .addConditionalEdges("evaluate_harm_risk", routeAfterEvaluation)

  .addEdge("handle_harm_action", END)
  .addEdge("verify_risk", END) // Wait for user response

  .compile();
