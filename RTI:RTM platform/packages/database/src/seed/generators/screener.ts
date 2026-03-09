/**
 * Screener generator
 *
 * Creates test screeners with sessions and responses
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import { screenerQuestionSets } from "../../resources/screener-questions";
import * as schema from "../../schema";
import type { TestScenario } from "../types";
import { validators } from "../validators";

/**
 * Creates a test screener with sessions and responses
 */
export async function createTestScreener(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  screenerConfig: NonNullable<TestScenario["alerts"][0]["screener"]>,
  age: number,
): Promise<string> {
  // Validate screener type for age
  const validationResult = validators.screenerType(age, screenerConfig.type);
  if (!validationResult.valid) {
    throw new Error(
      `Invalid screener configuration: ${validationResult.errors.join(", ")}`,
    );
  }

  const completedAt =
    screenerConfig.completedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 1 day ago

  // Determine question set based on screener type
  const questionSet = screenerQuestionSets.find(
    (qs) =>
      qs.type === screenerConfig.type && age >= qs.minAge && age <= qs.maxAge,
  );

  if (!questionSet) {
    throw new Error(
      `No question set found for ${screenerConfig.type} and age ${age}`,
    );
  }

  // Calculate max score
  const maxScore = questionSet.questions.reduce(
    (sum, q) => sum + q.weight * Math.max(...q.options.map((o) => o.score)),
    0,
  );

  // Create screener
  const screenerId = await db
    .insert(schema.screeners)
    .values({
      userId: studentId,
      age,
      type: screenerConfig.type,
      completedAt,
      score: screenerConfig.targetScore,
      maxScore,
    })
    .returning({ id: schema.screeners.id })
    .then((rows) => rows[0]?.id);

  if (!screenerId) {
    throw new Error("Failed to create screener");
  }

  // Create session
  const sessionId = await db
    .insert(schema.screenerSessions)
    .values({
      screenerId,
      startAt: new Date(completedAt.getTime() - 30 * 60 * 1000), // 30 min before completion
      part: questionSet.part,
      subtype: questionSet.subtype,
      completedAt,
      score: screenerConfig.targetScore,
      maxScore,
    })
    .returning({ id: schema.screenerSessions.id })
    .then((rows) => rows[0]?.id);

  if (!sessionId) {
    throw new Error("Failed to create screener session");
  }

  // Generate responses to achieve target score
  // Strategy: Use specific answers if provided, otherwise distribute score proportionally
  const targetScore = screenerConfig.targetScore;
  const specificAnswers = screenerConfig.specificAnswers || [];
  let remainingScore = targetScore;

  // First, subtract scores from specific answers
  for (const specificAnswer of specificAnswers) {
    const question = questionSet.questions.find(
      (q) => q.code === specificAnswer.questionCode,
    );
    if (question) {
      const option = question.options.find(
        (o) => o.code === specificAnswer.answerCode,
      );
      if (option) {
        remainingScore -= option.score;
      }
    }
  }

  for (let i = 0; i < questionSet.questions.length; i++) {
    const question = questionSet.questions[i];
    if (!question) continue;

    // Check if this question has a specific answer
    const specificAnswer = specificAnswers.find(
      (sa) => sa.questionCode === question.code,
    );

    let selectedOption: { code: string; score: number } | undefined;
    if (specificAnswer) {
      // Use the specific answer
      selectedOption = question.options.find(
        (o) => o.code === specificAnswer.answerCode,
      );
    } else {
      // Determine score for this question
      const questionsRemaining =
        questionSet.questions.length -
        i -
        specificAnswers.filter((sa) =>
          questionSet.questions
            .slice(i + 1)
            .some((q) => q.code === sa.questionCode),
        ).length;

      const averageScoreNeeded =
        questionsRemaining > 0 ? remainingScore / questionsRemaining : 0;
      const maxQuestionScore = Math.max(
        ...question.options.map((o) => o.score),
      );

      // Find option closest to average needed (but not exceeding remaining)
      const targetOptionScore = Math.min(
        Math.round(averageScoreNeeded),
        maxQuestionScore,
        Math.max(0, remainingScore),
      );

      selectedOption =
        question.options.find((o) => o.score === targetOptionScore) ||
        question.options[0];
    }

    if (!selectedOption) continue;

    await db.insert(schema.screenerSessionResponses).values({
      sessionId,
      ordinal: i + 1,
      questionCode: question.code,
      answerCode: selectedOption.code,
    });

    if (!specificAnswer) {
      remainingScore -= selectedOption.score;
    }
  }

  return screenerId;
}
