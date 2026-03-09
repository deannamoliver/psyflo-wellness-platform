import "server-only";

import type { AdminEval, AdminTestMessage } from "@feelwell/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JUDGE_MODEL } from "./models";

function getModel() {
  if (!process.env["GOOGLE_API_KEY"]) {
    throw new Error("GOOGLE_API_KEY environment variable is required");
  }

  const genAI = new GoogleGenerativeAI(process.env["GOOGLE_API_KEY"]);

  // Using Gemini 2.5 Flash for fast generation and judging
  return genAI.getGenerativeModel({
    model: JUDGE_MODEL,
    generationConfig: {
      temperature: 0, // Consistent responses for judging
      topK: 1,
      topP: 1,
    },
  });
}

interface JudgeScore {
  score: number;
  reasoning: string;
}

interface JudgeResult {
  [evalName: string]: JudgeScore;
}

/**
 * Generate an AI response given a system prompt and conversation context
 */
export async function generateResponse(
  systemPrompt: string,
  conversation: AdminTestMessage[],
): Promise<string> {
  // Format conversation for the prompt
  const conversationText = conversation
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
    )
    .join("\n");

  const prompt = `${systemPrompt}

Conversation so far:
${conversationText}

Please respond as the assistant:`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    return generatedText;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Judge a conversation against evaluation criteria
 */
export async function judgeConversation(
  conversation: AdminTestMessage[],
  evals: AdminEval[],
): Promise<JudgeResult> {
  // Format conversation for the judge
  const conversationText = conversation
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
    )
    .join("\n");

  // Format evaluation criteria
  const criteriaText = evals
    .map((eval_) => `- ${eval_.name}: ${eval_.description}`)
    .join("\n");

  const judgePrompt = `You are evaluating an AI conversation based on these criteria:

EVALUATION CRITERIA:
${criteriaText}

CONVERSATION TO EVALUATE:
${conversationText}

For each criteria, provide a score from 1-10 and brief reasoning. Respond ONLY with valid JSON in this exact format:
{
  "${evals[0]?.name}": {"score": 8, "reasoning": "Brief explanation"},
  "${evals[1]?.name}": {"score": 7, "reasoning": "Brief explanation"}
}

Important: Return only the JSON object, no other text.`;

  try {
    const model = getModel();
    const result = await model.generateContent(judgePrompt);
    const response = result.response;
    const responseText = response.text().trim();

    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = responseText;
    if (cleanedResponse.includes("```")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "");
    }

    // Parse JSON response
    const judgeResult = JSON.parse(cleanedResponse) as JudgeResult;

    // Validate that all eval criteria are present
    for (const eval_ of evals) {
      if (!judgeResult[eval_.name]) {
        throw new Error(`Missing evaluation for criteria: ${eval_.name}`);
      }

      // Validate score is within range
      const scoreData = judgeResult[eval_.name];
      if (scoreData) {
        const score = scoreData.score;
        if (score < 1 || score > 10 || !Number.isInteger(score)) {
          throw new Error(`Invalid score for ${eval_.name}: ${score}`);
        }
      }
    }

    return judgeResult;
  } catch (error) {
    console.error("Error judging conversation:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse judge response as JSON");
    }
    throw new Error("Failed to judge conversation");
  }
}

export type { JudgeResult, JudgeScore };
