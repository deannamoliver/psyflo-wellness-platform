import { isHumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ABUSE_PROTOCOL_PROMPT } from "../../prompts/abuse-protocol";
import { updateChatAlert } from "../../tools/alert-tools";
import { ConversationState } from "../conversation-state";

/**
 * Abuse & Neglect Risk Protocol Subgraph
 *
 * Full Implementation:
 * 1. Evaluates risk using LLM Agent (Clarify vs Act).
 * 2. Loops for clarification (max 2 turns).
 * 3. Shuts down for Red/Orange risks or after resolution.
 */

const evaluateRiskNode = async (state: typeof ConversationState.State) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.1, // Low temp for strict protocol adherence
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  // Prepare context
  const recentMessages = state.messages.slice(-5); // More context for assessment
  const conversationContext = recentMessages
    .map((m) => {
      const role = isHumanMessage(m) ? "Student" : "Assistant";
      // biome-ignore lint/suspicious/noExplicitAny: LangChain message types have dynamic content
      const content = (m as any).text || m.content.toString();
      return `${role}: ${content}`;
    })
    .join("\n");

  const prompt = ABUSE_PROTOCOL_PROMPT.replace(
    "{category}",
    state.abuseCategory?.toString() || "Unknown",
  )
    .replace("{severity}", state.abuseSeverity || "Unknown")
    .replace("{loopCount}", state.abuseLoopCount.toString());

  const fullPrompt = `${prompt}\n\n**CONVERSATION HISTORY:**\n${conversationContext}`;

  try {
    const response = await model.invoke(fullPrompt);
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse LLM response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      abuseSeverity: result.newSeverity,
      abuseProtocolStatus:
        result.action === "clarify" ? "clarifying" : "complete",
      abuseLoopCount: state.abuseLoopCount + 1,
      messages: [{ role: "assistant", content: result.responseContent }],
    };
  } catch (error) {
    console.error("Abuse Protocol Error:", error);
    // Fallback to safe shutdown if AI fails
    return {
      abuseSeverity: "red",
      abuseProtocolStatus: "complete",
      messages: [
        {
          role: "assistant",
          content:
            "I'm concerned about your safety. I've notified a counselor to check in with you.",
        },
      ],
    };
  }
};

const shutdownNode = async (state: typeof ConversationState.State) => {
  // Mark as shutdown in DB
  if (state.chatAlertId) {
    await updateChatAlert(state.chatAlertId, {
      isShutdown: true,
      shutdownRiskType: "abuse_neglect",
      // Ideally we'd save the final severity/category here too if schema supported it
    });
  }

  return {
    shouldShutdown: true,
    protocolComplete: true,
  };
};

const routeNextStep = (state: typeof ConversationState.State) => {
  if (state.abuseProtocolStatus === "clarifying") {
    return END; // Wait for user input
  }

  // If complete, check if we need to shutdown (Red/Orange)
  if (state.abuseSeverity === "red" || state.abuseSeverity === "orange") {
    return "shutdown";
  }

  // Yellow/Resolved -> End protocol but don't force shutdown (allow base agent to take over?
  // Or just end this turn. For safety, let's end protocol and let main graph decide.
  // But wait, if we return END here, the main graph sees protocolComplete=false (unless we set it).
  // If status is complete, we should set protocolComplete=true.

  // Actually, let's route to a "complete" node to set the flag.
  return "complete_protocol";
};

const completeProtocolNode = async () => {
  return { protocolComplete: true };
};

const builder = new StateGraph(ConversationState)
  .addNode("evaluateRisk", evaluateRiskNode)
  .addNode("shutdown", shutdownNode)
  .addNode("complete_protocol", completeProtocolNode)

  .addEdge(START, "evaluateRisk")

  .addConditionalEdges("evaluateRisk", routeNextStep, {
    [END]: END, // Clarifying -> Wait for user
    shutdown: "shutdown",
    complete_protocol: "complete_protocol",
  })

  .addEdge("shutdown", END)
  .addEdge("complete_protocol", END);

export const abuseNeglectGraph = builder.compile();
