"use client";

import type { alertTypeEnum } from "@feelwell/database";
import { Muted } from "@/lib/core-ui/typography";
import { getQuestionAndAnswer } from "@/lib/screener/utils";
import type { ScreenerSessionWithResponses } from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";

// Helper to check if a question triggered a safety alert
function isSafetyAlertTrigger(
  questionCode: string,
  answerCode: string,
  alertType: (typeof alertTypeEnum.enumValues)[number],
): boolean {
  // Safety alerts are triggered by PHQ question 9 with any non-zero answer
  if (alertType !== "safety") return false;

  const isSafetyQuestion =
    questionCode === "PHQA_9" || questionCode === "PHQ9_9";
  const isNonZeroAnswer = answerCode !== "0";

  return isSafetyQuestion && isNonZeroAnswer;
}

export function ScreenerQuestions({
  sessions,
  alertType,
}: {
  sessions: ScreenerSessionWithResponses[];
  alertType: (typeof alertTypeEnum.enumValues)[number];
}) {
  console.log("ScreenerQuestions - sessions:", sessions);

  // Get the most recent completed session
  const completedSessions = sessions.filter(
    (session) => session.status === "completed",
  );

  console.log("ScreenerQuestions - completedSessions:", completedSessions);

  if (completedSessions.length === 0) {
    return (
      <div className="rounded-md border border-muted-foreground/30 border-dashed bg-muted/20 p-4">
        <Muted className="text-sm">
          No completed screener sessions available
        </Muted>
      </div>
    );
  }

  // Sort by createdAt descending to get most recent
  const sortedSessions = [...completedSessions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const mostRecentSession = sortedSessions[0];

  if (!mostRecentSession) {
    return null;
  }

  // Check if responses exist
  if (
    !mostRecentSession.responses ||
    mostRecentSession.responses.length === 0
  ) {
    return (
      <div className="rounded-md border border-muted-foreground/30 border-dashed bg-muted/20 p-4">
        <Muted className="text-sm">
          No responses available for this screener session
        </Muted>
      </div>
    );
  }

  // Sort responses by question code for consistent display
  const sortedResponses = [...mostRecentSession.responses].sort((a, b) =>
    a.questionCode.localeCompare(b.questionCode),
  );

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="font-semibold text-sm">Screener Responses</div>
        <Muted className="text-xs">
          {sortedResponses.length} question
          {sortedResponses.length !== 1 ? "s" : ""}
        </Muted>
      </div>

      <div className="space-y-4">
        {sortedResponses.map((response, index) => {
          const questionAndAnswer = getQuestionAndAnswer(
            response.questionCode,
            response.answerCode,
          );

          if (!questionAndAnswer) {
            return (
              <div key={response.id} className="rounded-md bg-muted/20 p-3">
                <Muted className="text-xs">
                  Question code: {response.questionCode} - Answer code:{" "}
                  {response.answerCode}
                </Muted>
              </div>
            );
          }

          const isAlertTrigger = isSafetyAlertTrigger(
            response.questionCode,
            response.answerCode,
            alertType,
          );

          return (
            <div key={response.id} className="space-y-2">
              <div
                className={cn(
                  "flex gap-3",
                  isAlertTrigger &&
                    "rounded-md border-amber-500 border-l-4 bg-amber-50/50 py-2 pr-4 pl-3",
                )}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm leading-snug">
                    {questionAndAnswer.question}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {questionAndAnswer.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
