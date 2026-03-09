import {
  screenerAlerts,
  screenerQuestionSets,
  screenerSessionResponses,
  screenerSessions,
  screeners,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

function screenerDisplayName(type: string): string {
  switch (type) {
    case "phq_a":
      return "PHQ-A (Depression)";
    case "phq_9":
      return "PHQ-9 (Depression)";
    case "gad_child":
      return "GAD-Child (Anxiety)";
    case "gad_7":
      return "GAD-7 (Anxiety)";
    default:
      return "Assessment";
  }
}

function scoreSeverityLabel(type: string, score: number): string {
  if (type === "phq_9" || type === "phq_a") {
    if (score <= 4) return "Minimal Depression";
    if (score <= 9) return "Mild Depression";
    if (score <= 14) return "Moderate Depression";
    if (score <= 19) return "Moderately Severe Depression";
    return "Severe Depression";
  }
  if (type === "gad_7") {
    if (score <= 4) return "Minimal Anxiety";
    if (score <= 9) return "Mild Anxiety";
    if (score <= 14) return "Moderate Anxiety";
    return "Severe Anxiety";
  }
  if (type === "gad_child") {
    if (score <= 10) return "Minimal Anxiety";
    if (score <= 20) return "Mild Anxiety";
    if (score <= 30) return "Moderate Anxiety";
    return "Severe Anxiety";
  }
  return "";
}

/** Canonical option labels by score (0/1/2/3) to match design. */
function optionLabelByScore(score: number): string {
  switch (score) {
    case 0:
      return "Not at all";
    case 1:
      return "Several days";
    case 2:
      return "More than half the days";
    case 3:
      return "Nearly every day";
    default:
      return "";
  }
}

function answerBadgeStyle(score: number, isHighlight: boolean): string {
  if (score === 0) return "bg-gray-100 text-gray-600";
  if (isHighlight) return "bg-red-600 text-white";
  if (score === 1) return "bg-yellow-100 text-yellow-900";
  if (score === 2) return "bg-orange-100 text-orange-900"; // shaded like several days
  return "bg-red-100 text-red-800";
}

export async function ScreenerContent({
  alertId,
  alertType,
}: {
  alertId: string;
  alertType: string;
}) {
  const db = await serverDrizzle();

  const screenerAlert = await db.admin
    .select()
    .from(screenerAlerts)
    .where(eq(screenerAlerts.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  if (!screenerAlert) {
    return (
      <div className="border-gray-100 border-t p-6">
        <p className="text-gray-500 text-sm">No screener data available.</p>
      </div>
    );
  }

  const screener = await db.admin
    .select()
    .from(screeners)
    .where(eq(screeners.id, screenerAlert.screenerId))
    .limit(1)
    .then((res) => res[0]);

  if (!screener) {
    return (
      <div className="border-gray-100 border-t p-6">
        <p className="text-gray-500 text-sm">Screener not found.</p>
      </div>
    );
  }

  const sessions = await db.admin
    .select()
    .from(screenerSessions)
    .where(eq(screenerSessions.screenerId, screener.id));

  const allResponses = await Promise.all(
    sessions.map(async (session) => {
      const responses = await db.admin
        .select()
        .from(screenerSessionResponses)
        .where(eq(screenerSessionResponses.sessionId, session.id));
      return responses;
    }),
  );

  const responses = allResponses.flat();

  const questionSet = screenerQuestionSets.find(
    (qs) =>
      qs.type === screener.type &&
      screener.age >= qs.minAge &&
      screener.age <= qs.maxAge,
  );

  if (!questionSet) {
    return (
      <div className="border-gray-100 border-t p-6">
        <p className="text-gray-500 text-sm">Question set not found.</p>
      </div>
    );
  }

  const totalQuestions = questionSet.questions.length;
  const answeredQuestions = responses.length;
  const completionPct = Math.round((answeredQuestions / totalQuestions) * 100);

  const questionResponses = questionSet.questions.map((q, idx) => {
    const response = responses.find((r) => r.questionCode === q.code);
    const selectedOption = response
      ? q.options.find((o) => o.code === response.answerCode)
      : null;
    const answerScore = selectedOption?.score ?? 0;
    const answerText = selectedOption?.text ?? "Not answered";
    const isLastPhqQuestion =
      (screener.type === "phq_a" || screener.type === "phq_9") &&
      idx === questionSet.questions.length - 1;
    const isHighlight = isLastPhqQuestion
      ? answerScore > 0 // Q9 highlighted for any non-zero answer
      : answerScore === 3;
    return {
      index: idx + 1,
      questionText: q.text,
      questionCode: q.code,
      answerText,
      answerScore,
      isHighlight,
    };
  });

  const scoreColor =
    alertType === "safety" ? "text-red-600" : "text-orange-600";

  return (
    <div className="border-gray-200 border-t">
      {/* Assessment info row */}
      <div className="grid grid-cols-3 gap-6 border-gray-200 border-b px-6 py-5">
        <div>
          <p className="font-bold text-gray-600 text-xs uppercase tracking-wide">
            Assessment Type
          </p>
          <p className="mt-0.5 font-bold text-base text-gray-900">
            {screenerDisplayName(screener.type)}
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-600 text-xs uppercase tracking-wide">
            Completion Rate
          </p>
          <p className="mt-0.5 font-bold text-base text-green-600">
            {completionPct}% ({answeredQuestions}/{totalQuestions} questions)
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-600 text-xs uppercase tracking-wide">
            Total Score
          </p>
          <p className={`mt-0.5 font-bold text-base ${scoreColor}`}>
            {Math.round(screener.score)}/{Math.round(screener.maxScore)}
          </p>
          <p className="mt-0.5 text-gray-500 text-xs">
            {scoreSeverityLabel(screener.type, screener.score)}
          </p>
        </div>
      </div>

      {/* Question-by-question responses */}
      <div className="bg-gray-50 px-6 pt-5 pb-6">
        <h3 className="mb-4 font-bold text-gray-900 text-sm">
          Question-by-Question Response
        </h3>
        <div className="flex flex-col gap-2">
          {questionResponses.map((qr) => (
            <div
              key={qr.questionCode}
              className={`flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3.5 ${
                qr.isHighlight ? "bg-red-50 ring-1 ring-red-200" : "bg-white"
              }`}
            >
              <p
                className={`text-sm ${
                  qr.isHighlight
                    ? "font-semibold text-gray-900"
                    : "text-gray-700"
                }`}
              >
                {qr.index}.{" "}
                {qr.questionText.replace(/^./, (c) => c.toUpperCase())}
              </p>
              <span
                className={`ml-4 shrink-0 rounded-lg px-3 py-1 font-medium text-xs ${answerBadgeStyle(qr.answerScore, qr.isHighlight)}`}
              >
                {qr.answerText === "Not answered"
                  ? "Not answered"
                  : `${optionLabelByScore(qr.answerScore) || qr.answerText} (${qr.answerScore})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
