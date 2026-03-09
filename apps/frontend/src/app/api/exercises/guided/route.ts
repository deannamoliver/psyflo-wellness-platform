import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exerciseId: _exerciseId, exerciseName, exerciseDescription, exerciseModality, messages } = body as {
      exerciseId: string;
      exerciseName: string;
      exerciseDescription: string;
      exerciseModality: string;
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const systemPrompt = `You are a warm, supportive AI therapist guide helping a patient work through a "${exerciseName}" exercise (${exerciseModality.toUpperCase()} technique).

Exercise description: ${exerciseDescription}

Your role:
- Guide the patient through this exercise ONE STEP AT A TIME, like a Duolingo lesson
- Each message should present ONE clear step or question
- Be encouraging, warm, and non-judgmental
- Use simple, accessible language appropriate for teens and young adults
- After the patient responds, validate their response, provide brief therapeutic insight, then move to the next step
- Use emoji sparingly to keep it friendly (1-2 per message max)
- Keep responses concise (2-4 sentences per step)
- At the end of the exercise, provide a brief summary of what they learned/practiced and encourage them

Format each step clearly:
- Start with "Step X of Y:" to show progress
- Ask one question or give one instruction per message
- If the patient seems distressed, gently acknowledge it and remind them they can stop anytime

IMPORTANT: Start immediately with Step 1 when the conversation begins. Do not ask if they're ready — just begin the exercise warmly.`;

    const claudeMessages = messages.length === 0
      ? [{ role: "user" as const, content: "I'm ready to start this exercise." }]
      : messages;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      return Response.json(
        { error: "Failed to get response from AI" },
        { status: 502 },
      );
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";

    return Response.json({ message: assistantMessage });
  } catch (error) {
    console.error("Exercise guided API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
