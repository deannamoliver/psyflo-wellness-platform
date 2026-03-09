"server-only";

import {
  type alerts,
  screenerFrequencySettings,
  screenerSessionResponses,
  screenerSessions,
  screeners,
} from "@feelwell/database";
import { addMonths, addWeeks, startOfDay } from "date-fns";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  createAlert,
  createAlertAction,
  createAlertTimelineEntry,
  createScreenerAlert,
} from "@/lib/alerts/service/create";
import { serverDrizzle } from "@/lib/database/drizzle";
import { internalServerError } from "@/lib/errors";
import { getScreenerQuestionSet } from "@/lib/screener/utils";
import { createScreener } from "./create";

// Helper function to get the most recent completed screener of the same type
async function getPreviousScreener(
  userId: string,
  type: (typeof screeners.$inferSelect)["type"],
  currentScreenerId: string,
): Promise<typeof screeners.$inferSelect | null> {
  const db = await serverDrizzle();

  const previous = await db.admin.query.screeners.findFirst({
    where: and(
      eq(screeners.userId, userId),
      eq(screeners.type, type),
      isNotNull(screeners.completedAt),
      // Exclude the current screener
      sql`${screeners.id} != ${currentScreenerId}`,
    ),
    orderBy: desc(screeners.completedAt),
  });

  return previous ?? null;
}

// Helper function to determine if a threshold-crossing alert should trigger
function shouldTriggerThresholdAlert(screener: Screener): boolean {
  // SEL screeners don't have threshold alerts
  if (screener.type === "sel") {
    return false;
  }

  // Determine the threshold for this screener type
  let threshold: number;
  let scoreToCheck: number = screener.score;

  switch (screener.type) {
    case "phq_a":
    case "phq_9":
      threshold = 20; // PRD: Score >= 20
      break;

    case "gad_child":
      // GAD-Child threshold is 3.5 average, but we store total score
      // Calculate average: total score / 10 questions
      threshold = 3.5; // PRD: Average >= 3.5
      scoreToCheck = screener.score / 10;
      break;

    case "gad_7":
      threshold = 15; // PRD: Score >= 15
      break;

    default:
      return false;
  }

  // Check if this is a first-time crossing
  if (screener.lastScore === null) {
    // First time taking this screener - alert if crossing threshold
    return scoreToCheck >= threshold;
  }

  // For GAD-Child, also calculate lastScore average
  const lastScoreToCheck =
    screener.type === "gad_child"
      ? screener.lastScore / 10
      : screener.lastScore;

  // Alert if crossing threshold for the first time
  return lastScoreToCheck < threshold && scoreToCheck >= threshold;
}

// Helper function to determine if a score-increase alert should trigger
function shouldTriggerIncreaseAlert(screener: Screener): boolean {
  // SEL screeners don't have increase alerts
  if (screener.type === "sel") {
    return false;
  }

  // No previous score to compare
  if (screener.lastScore === null) {
    return false;
  }

  // Alert on ANY positive increase
  return screener.score > screener.lastScore;
}

async function checkAndHandleSessionCompletion(sessionId: string) {
  const db = await serverDrizzle();

  const responses = await db.admin.query.screenerSessionResponses.findMany({
    where: eq(screenerSessionResponses.sessionId, sessionId),
  });

  const allAnswered = responses.every((r) => r.answerCode !== null);

  if (!allAnswered) {
    return;
  }

  const sessionWithScreener = await db.admin
    .select()
    .from(screenerSessions)
    .innerJoin(screeners, eq(screeners.id, screenerSessions.screenerId))
    .where(eq(screenerSessions.id, sessionId))
    .then((r) => r[0]);

  if (sessionWithScreener == null) {
    notFound();
  }

  const { screeners: screener, screener_sessions: session } =
    sessionWithScreener;

  await db.admin
    .update(screenerSessions)
    .set({
      completedAt: new Date(),
      score: await calculateSessionScore(screener, session, responses),
    })
    .where(eq(screenerSessions.id, sessionId));

  await checkAndHandleScreenerCompletion(screener.id);
}

// Helper function to check if question 9 (suicidal ideation) has a score > 0
async function hasQuestion9Score(screenerId: string): Promise<boolean> {
  const db = await serverDrizzle();

  const responses = await db.admin
    .select()
    .from(screenerSessionResponses)
    .innerJoin(
      screenerSessions,
      eq(screenerSessions.id, screenerSessionResponses.sessionId),
    )
    .where(eq(screenerSessions.screenerId, screenerId));

  // Check for PHQ-A Question 9 (PHQA_9) or PHQ-9 Question 9 (PHQ9_9)
  const question9Response = responses.find(
    (r) =>
      r.screener_session_responses.questionCode === "PHQA_9" ||
      r.screener_session_responses.questionCode === "PHQ9_9",
  );

  if (!question9Response) {
    return false;
  }

  // Get the score for the answer
  const answerCode = question9Response.screener_session_responses.answerCode;
  if (!answerCode) {
    return false;
  }

  // For PHQ questions, answer codes "1", "2", "3" indicate scores > 0
  // Answer code "0" indicates score = 0
  return answerCode !== "0";
}

async function calculateSessionScore(
  screener: typeof screeners.$inferSelect,
  session: typeof screenerSessions.$inferSelect,
  responses: (typeof screenerSessionResponses.$inferSelect)[],
) {
  const set = getScreenerQuestionSet({
    part: session.part,
    subtype: session.subtype,
    age: screener.age,
  });

  if (set == null) {
    return 0;
  }

  let totalScore = 0;

  // For SEL screeners, calculate domain mean (simple average)
  if (session.subtype.startsWith("sel_")) {
    let domainSum = 0;
    let questionCount = 0;

    for (const response of responses) {
      const question = set.questions.find(
        (q) => q.code === response.questionCode,
      );
      if (question == null) {
        continue;
      }

      const score =
        question.options.find((o) => o.code === response.answerCode)?.score ??
        0;

      domainSum += score;
      questionCount++;
    }

    // Return mean score for SEL domains
    return questionCount > 0 ? domainSum / questionCount : 0;
  }

  // For mental health screeners (PHQ-A, PHQ-9, GAD-Child, GAD-7), calculate simple sum
  for (const response of responses) {
    const question = set.questions.find(
      (q) => q.code === response.questionCode,
    );
    if (question == null) {
      continue;
    }

    const score =
      question.options.find((o) => o.code === response.answerCode)?.score ?? 0;

    totalScore += score;
  }

  return totalScore;
}

async function checkAndHandleScreenerCompletion(screenerId: string) {
  const db = await serverDrizzle();

  const sessions = await db.admin.query.screenerSessions.findMany({
    where: eq(screenerSessions.screenerId, screenerId),
  });

  const allCompleted = sessions.every((s) => s.completedAt !== null);

  if (!allCompleted) {
    return;
  }

  // Get the current screener info before updating
  const currentScreener = await db.admin.query.screeners.findFirst({
    where: eq(screeners.id, screenerId),
  });

  if (!currentScreener) {
    notFound();
  }

  // Get the previous screener of the same type to set lastScore
  const previousScreener = await getPreviousScreener(
    currentScreener.userId,
    currentScreener.type,
    screenerId,
  );

  const screener = await db.admin
    .update(screeners)
    .set({
      completedAt: new Date(),
      score: sessions.reduce((acc, session) => acc + session.score, 0),
      maxScore: sessions.reduce((acc, session) => acc + session.maxScore, 0),
      lastScore: previousScreener?.score ?? null,
    })
    .where(eq(screeners.id, screenerId))
    .returning()
    .then((r) => r[0]);

  if (screener == null) {
    internalServerError("Failed to update screener");
  }

  await takePostScreenerActions(screener);
}

async function takePostScreenerActions(screener: Screener) {
  await createAlertsForScreener(screener);
  await scheduleFollowUpScreeners(screener);
}

type Screener = typeof screeners.$inferSelect;
type Alert = typeof alerts.$inferSelect;

async function createAlertsForScreener(screener: Screener): Promise<void> {
  // FIRST: Check for Q9 safety alert (regardless of overall score)
  // This ensures safety alerts are always created when Q9 > 0, even with low scores
  if (screener.type === "phq_9" || screener.type === "phq_a") {
    const hasQuestion9 = await hasQuestion9Score(screener.id);

    if (hasQuestion9) {
      const safetyAlertId = await createAlert({
        studentId: screener.userId,
        type: "safety",
        source: "screener",
      });

      await createScreenerAlert({
        screenerId: screener.id,
        alertId: safetyAlertId,
      });

      await createAlertTimelineEntry({
        alertId: safetyAlertId,
        type: "alert_generated",
        description: "Safety concern identified in screener (Question 9)",
      });

      // Return early — one PHQ completion creates at most one alert.
      // Q9 > 0 means safety alert only; no separate depression alert.
      return;
    }
  }

  // SECOND: Check for threshold-crossing alerts
  const shouldAlertThreshold = shouldTriggerThresholdAlert(screener);
  const shouldAlertIncrease = shouldTriggerIncreaseAlert(screener);

  if (!shouldAlertThreshold && !shouldAlertIncrease) {
    // No threshold crossing or score increase - no alert needed
    return;
  }

  // Determine alert type based on screener type
  const alertType: Alert["type"] =
    screener.type === "phq_a" || screener.type === "phq_9"
      ? "depression"
      : "anxiety";

  // Create the alert
  const alertId = await createAlert({
    studentId: screener.userId,
    type: alertType,
    source: "screener",
  });

  await createScreenerAlert({
    screenerId: screener.id,
    alertId,
  });

  // Create appropriate description based on alert reason
  let description: string;
  if (shouldAlertThreshold && shouldAlertIncrease) {
    // Both threshold crossing AND increase
    description = `First time crossing threshold (score: ${screener.score}) and score increased from ${screener.lastScore}`;
  } else if (shouldAlertThreshold) {
    // First time crossing threshold
    const screenerName =
      screener.type === "phq_a"
        ? "PHQ-A"
        : screener.type === "phq_9"
          ? "PHQ-9"
          : screener.type === "gad_child"
            ? "GAD-Child"
            : "GAD-7";

    if (screener.lastScore === null) {
      description = `First ${screenerName} screener crossed threshold (score: ${screener.score})`;
    } else {
      description = `${screenerName} score crossed threshold for the first time (from ${screener.lastScore} to ${screener.score})`;
    }
  } else {
    // Score increase only
    description = `Score increased from ${screener.lastScore} to ${screener.score}`;
  }

  await createAlertTimelineEntry({
    alertId,
    type: "alert_generated",
    description,
  });

  // Add emergency action
  const timelineEntryId = await createAlertTimelineEntry({
    alertId,
    type: "emergency_action",
    description: "Notified staff",
  });

  await createAlertAction({
    timelineEntryId,
    type: "notified_staff",
  });
}

async function getScreenerFrequency(
  screenerType: Screener["type"],
): Promise<"monthly" | "quarterly" | "annually"> {
  const db = await serverDrizzle();

  const setting = await db.admin.query.screenerFrequencySettings.findFirst({
    where: eq(screenerFrequencySettings.screenerType, screenerType),
  });

  // Default to quarterly if not found
  return (setting?.frequency ?? "quarterly") as
    | "monthly"
    | "quarterly"
    | "annually";
}

function frequencyToMonths(
  frequency: "monthly" | "quarterly" | "annually",
): number {
  switch (frequency) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "annually":
      return 12;
  }
}

async function getScreenerConfig(screener: Screener): Promise<{
  type: Screener["type"];
  startAt: Date;
} | null> {
  const baseTime = startOfDay(new Date());

  // Get admin-configured frequency for this screener type
  const frequency = await getScreenerFrequency(screener.type);
  const frequencyMonths = frequencyToMonths(frequency);

  // PHQ-A re-administration rules (PRD):
  // - If score >= 20 OR question 9 > 0: every 2 weeks until score < 20 AND question 9 = 0
  // - If score < 20 AND question 9 = 0: per admin dashboard setting
  if (screener.type === "phq_a") {
    const hasQuestion9 = await hasQuestion9Score(screener.id);

    if (screener.score >= 20 || hasQuestion9) {
      return {
        type: "phq_a",
        startAt: addWeeks(baseTime, 2),
      };
    } else {
      return {
        type: "phq_a",
        startAt: addMonths(baseTime, frequencyMonths),
      };
    }
  }

  // PHQ-9 re-administration rules (PRD):
  // - If score >= 20 OR question 9 > 0: every 2 weeks until score < 20 AND question 9 = 0
  // - If score < 20 AND question 9 = 0: per admin dashboard setting
  if (screener.type === "phq_9") {
    const hasQuestion9 = await hasQuestion9Score(screener.id);

    if (screener.score >= 20 || hasQuestion9) {
      return {
        type: "phq_9",
        startAt: addWeeks(baseTime, 2),
      };
    } else {
      return {
        type: "phq_9",
        startAt: addMonths(baseTime, frequencyMonths),
      };
    }
  }

  // GAD-Child re-administration rules (PRD):
  // - If average score >= 3.5: every 2 weeks until average score < 3.5
  // - If average score < 3.5: per admin dashboard setting
  if (screener.type === "gad_child") {
    const averageScore = screener.score / 10; // 10 questions
    if (averageScore >= 3.5) {
      return {
        type: "gad_child",
        startAt: addWeeks(baseTime, 2),
      };
    } else {
      return {
        type: "gad_child",
        startAt: addMonths(baseTime, frequencyMonths),
      };
    }
  }

  // GAD-7 re-administration rules (PRD):
  // - If score >= 15: every 2 weeks until score < 15
  // - If score < 15: per admin dashboard setting
  if (screener.type === "gad_7") {
    if (screener.score >= 15) {
      return {
        type: "gad_7",
        startAt: addWeeks(baseTime, 2),
      };
    } else {
      return {
        type: "gad_7",
        startAt: addMonths(baseTime, frequencyMonths),
      };
    }
  }

  // SEL (WCSD-SECA) re-administration: per admin dashboard setting
  if (screener.type === "sel") {
    return {
      type: "sel",
      startAt: addMonths(baseTime, frequencyMonths),
    };
  }

  return null;
}

async function scheduleFollowUpScreeners(screener: Screener): Promise<void> {
  const config = await getScreenerConfig(screener);
  if (config == null) {
    return;
  }

  await createScreener({
    studentId: screener.userId,
    type: config.type,
    startAt: config.startAt,
  });
}

export { checkAndHandleSessionCompletion };
