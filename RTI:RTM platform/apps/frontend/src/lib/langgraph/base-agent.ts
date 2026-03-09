import {
  AIMessage,
  isAIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { getBaseAgentSystemPrompt } from "./prompts";
import { ConversationState } from "./risk-protocol/conversation-state";
import { getStudentBirthday } from "./tools/student-context";

function calculateAge(birthday: string | null): number | undefined {
  if (!birthday) return undefined;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Base Agent Node
 * Handles normal emotional support conversations (non-risk)
 */
async function baseAgentNode(
  state: typeof ConversationState.State,
  config: RunnableConfig,
) {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.2,
    topK: 40,
    maxOutputTokens: 256,
    apiKey: process.env["GOOGLE_API_KEY"],
  });

  // Check if last message is from AI (coming from protocol completion)
  // In this case, we need to generate a follow-up to continue the conversation
  const lastMessage = state.messages[state.messages.length - 1];
  const isFollowingProtocol = lastMessage && isAIMessage(lastMessage);

  // Use cached age from state, or fetch and cache on first call
  let age: number | undefined;
  if (state.studentAge != null) {
    age = state.studentAge;
  } else if (state.userId) {
    try {
      const birthday = await getStudentBirthday(state.userId);
      age = calculateAge(birthday);
    } catch (error) {
      console.error("Failed to fetch student birthday:", error);
    }
  }

  let systemPrompt = getBaseAgentSystemPrompt(age, state.exploreTopic);
  if (isFollowingProtocol) {
    // Add context that we're following up after a protocol completion
    systemPrompt += `\n\nIMPORTANT: The previous message was from you (the assistant) completing a check-in protocol. Now generate a brief, natural follow-up to smoothly transition back to normal conversation. Ask an open-ended question about how they're doing or what's on their mind. Keep it short and warm.`;
  }

  const messages = [new SystemMessage(systemPrompt), ...state.messages];

  const response = await model.invoke(messages, config);

  // Ensure we always return a non-empty response
  const content = response.content?.toString() || "";
  if (!content) {
    return {
      messages: [
        new AIMessage({
          content:
            "So, what else is going on with you today? I'm here to chat about whatever's on your mind 😊",
        }),
      ],
      studentAge: age ?? null,
    };
  }

  return { messages: [response], studentAge: age ?? null };
}

/**
 * Build the Base Agent subgraph
 */
export function buildBaseAgentGraph() {
  const graph = new StateGraph(ConversationState)
    .addNode("agent", baseAgentNode)
    .addEdge(START, "agent")
    .addEdge("agent", END);

  return graph.compile();
}
