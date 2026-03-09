"use server";

import {
  screenerSessionResponses,
  screenerSessions,
  screeners,
} from "@feelwell/database";
import { and, eq, isNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { internalServerError } from "@/lib/errors";
import {
  didCompleteWellnessCheckToday,
  getOngoingResponses,
} from "@/lib/screener/data";
import { checkAndHandleSessionCompletion } from "@/lib/screener/service/completion";
import { getScreenerQuestion } from "@/lib/screener/utils";

export async function getWellnessCheckData() {
  const db = await serverDrizzle();
  const studentId = db.userId();

  let responses = await getOngoingResponses({ studentId });

  // Self-heal: if all responses are answered but sessions aren't completed
  // (e.g. user closed browser before clicking "Close"), complete them now
  // so the date-aware check below works correctly.
  if (
    responses.length > 0 &&
    responses.every((r) => r.answerCode !== null)
  ) {
    await completeWellnessCheck();
    responses = await getOngoingResponses({ studentId });
  }

  // Get unique question codes and fetch their details
  const questionCodes = [...new Set(responses.map((r) => r.questionCode))];
  const questions = questionCodes
    .map((code) => {
      const q = getScreenerQuestion(code);
      if (!q) return null;
      return {
        code: q.code,
        text: q.text,
        options: q.options.map((o) => ({ code: o.code, text: o.text })),
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  const completedToday =
    responses.length === 0 ? await didCompleteWellnessCheckToday() : false;

  return {
    responses: responses.map((r) => ({
      id: r.id,
      questionCode: r.questionCode,
      answerCode: r.answerCode,
    })),
    questions,
    completedToday,
  };
}

export async function updateResponseAndSession(
  responseId: string,
  answerCode: string,
  options?: { checkCompletion?: boolean },
) {
  const db = await serverDrizzle();

  const response = await db.admin
    .update(screenerSessionResponses)
    .set({ answerCode })
    .where(eq(screenerSessionResponses.id, responseId))
    .returning()
    .then((r) => r[0]);

  if (response == null) {
    internalServerError("Failed to update response");
  }

  // Only check completion if explicitly requested (e.g., on last question)
  // This avoids expensive queries on every answer save
  if (options?.checkCompletion) {
    await checkAndHandleSessionCompletion(response.sessionId);
  }
}

/** Completes all sessions for the current user where every response has been answered. */
export async function completeWellnessCheck() {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Find all uncompleted sessions for this user
  const uncompletedSessions = await db.admin
    .select({ sessionId: screenerSessions.id })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .where(
      and(eq(screeners.userId, userId), isNull(screenerSessions.completedAt)),
    );

  for (const { sessionId } of uncompletedSessions) {
    await checkAndHandleSessionCompletion(sessionId);
  }
}
