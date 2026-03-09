/**
 * SEL Screener generator
 *
 * Creates test SEL screeners with sessions and responses for all 8 domains
 * across 4 parts/days to populate skill development data.
 */

import { eq } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/bun-sql";
import { screenerQuestionSets } from "../../resources/screener-questions";
import * as schema from "../../schema";
import type { SELSubtype, TestScenario } from "../types";

const SEL_SUBTYPES: SELSubtype[] = [
  "sel_self_awareness_self_concept",
  "sel_self_awareness_emotion_knowledge",
  "sel_social_awareness",
  "sel_self_management_emotion_regulation",
  "sel_self_management_goal_management",
  "sel_self_management_school_work",
  "sel_relationship_skills",
  "sel_responsible_decision_making",
];

/**
 * Creates a test SEL screener with all 8 domains across 4 parts
 */
export async function createTestSELScreener(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  selConfig: NonNullable<TestScenario["selScreeners"]>[0],
  age: number,
): Promise<string> {
  const completedAt =
    selConfig.completedAt ?? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // Default: 2 weeks ago

  // Create the main screener
  const screenerId = await db
    .insert(schema.screeners)
    .values({
      userId: studentId,
      age,
      type: "sel",
      completedAt,
      score: 0, // Will be calculated as sum of all session scores
      maxScore: 0, // Will be calculated as sum of all session max scores
    })
    .returning({ id: schema.screeners.id })
    .then((rows) => rows[0]?.id);

  if (!screenerId) {
    throw new Error("Failed to create SEL screener");
  }

  let totalScore = 0;
  let totalMaxScore = 0;

  // Create sessions for all 8 domains across 4 parts
  for (const subtype of SEL_SUBTYPES) {
    const questionSet = screenerQuestionSets.find(
      (qs) => qs.type === "sel" && qs.subtype === subtype,
    );

    if (!questionSet) {
      console.warn(`No question set found for SEL subtype: ${subtype}`);
      continue;
    }

    // Get target score for this domain (default to 3 if not specified)
    const targetScore = selConfig.domainScores[subtype] ?? 3;

    // Validate score is in valid range (1-4)
    if (targetScore < 1 || targetScore > 4) {
      throw new Error(
        `Invalid SEL score for ${subtype}: ${targetScore}. Must be between 1 and 4.`,
      );
    }

    // Calculate max score for this domain (4 points per question)
    const maxScore = questionSet.questions.length * 4;

    // SEL sessions are spread across 4 days (parts)
    const sessionCompletedAt = new Date(
      completedAt.getTime() - (4 - questionSet.part) * 24 * 60 * 60 * 1000,
    );

    // Create session
    const sessionId = await db
      .insert(schema.screenerSessions)
      .values({
        screenerId,
        startAt: new Date(sessionCompletedAt.getTime() - 30 * 60 * 1000), // 30 min before completion
        part: questionSet.part,
        subtype: questionSet.subtype,
        completedAt: sessionCompletedAt,
        score: targetScore, // SEL uses mean score per domain
        maxScore: maxScore,
      })
      .returning({ id: schema.screenerSessions.id })
      .then((rows) => rows[0]?.id);

    if (!sessionId) {
      throw new Error(`Failed to create SEL session for ${subtype}`);
    }

    totalScore += targetScore;
    totalMaxScore += maxScore;

    // Generate responses to achieve target score
    // Strategy: Distribute the target score across all questions
    // Since targetScore is already the mean, we'll vary around it slightly for realism
    for (let i = 0; i < questionSet.questions.length; i++) {
      const question = questionSet.questions[i];
      if (!question) continue;

      // Add slight variation: some questions at target, some ±1
      let questionScore = targetScore;
      if (i % 3 === 0 && targetScore > 1) {
        questionScore = targetScore - 1; // Some lower
      } else if (i % 3 === 2 && targetScore < 4) {
        questionScore = targetScore + 1; // Some higher
      }

      // Round and clamp to valid range (options only have integer scores 1-4)
      questionScore = Math.max(1, Math.min(4, Math.round(questionScore)));

      // Find the option with this score
      const selectedOption = question.options.find(
        (o) => o.score === questionScore,
      );

      if (!selectedOption) {
        console.warn(
          `No option found for score ${questionScore} in question ${question.code}`,
        );
        continue;
      }

      await db.insert(schema.screenerSessionResponses).values({
        sessionId,
        ordinal: i + 1,
        questionCode: question.code,
        answerCode: selectedOption.code,
      });
    }
  }

  // Update screener with total scores
  await db
    .update(schema.screeners)
    .set({
      score: totalScore,
      maxScore: totalMaxScore,
    })
    .where(eq(schema.screeners.id, screenerId));

  return screenerId;
}
