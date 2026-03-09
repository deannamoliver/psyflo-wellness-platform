"use client";

import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Muted } from "@/lib/core-ui/typography";
import { titleCase } from "@/lib/string-utils";
import type { AlertWithScreener } from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";

// Helper to get status color
function getStatusColor(status: "new" | "in_progress" | "resolved"): string {
  switch (status) {
    case "new":
      return "bg-destructive"; // Red
    case "in_progress":
      return "bg-warning"; // Orange/Yellow
    case "resolved":
      return "bg-success"; // Green
  }
}

// Helper to determine what data to show based on shutdown risk type
function shouldShowClarificationResponses(
  shutdownRiskType:
    | "direct"
    | "indirect"
    | "ambiguous"
    | "abuse_neglect"
    | "harm_to_others"
    | null,
): boolean {
  // Only ambiguous risk should show clarification responses
  return shutdownRiskType === "ambiguous";
}

function shouldShowCSSRState(
  shutdownRiskType:
    | "direct"
    | "indirect"
    | "ambiguous"
    | "abuse_neglect"
    | "harm_to_others"
    | null,
): boolean {
  // Indirect and ambiguous risk should show CSSR state (not direct)
  return shutdownRiskType === "indirect" || shutdownRiskType === "ambiguous";
}

// Helper to render yes/no clarification responses (B and C)
function renderYesNoResponse(
  label: string,
  data: { question?: string; response: string; answer: string },
) {
  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="mb-2 font-medium text-sm">{label}</div>
      <div className="space-y-2 text-sm">
        {data.question && (
          <div>
            <Muted>Question:</Muted> {data.question}
          </div>
        )}
        <div>
          <Muted>Response:</Muted> {data.response}
        </div>
        <div>
          <Muted>Answer:</Muted> {data.answer.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// Helper to render CSSR questions with the new Q1-Q6 structure
function renderCSSRQuestion(
  label: string,
  questionData:
    | {
        answer: boolean | "past_resolved";
        questionText?: string;
      }
    | null
    | undefined,
) {
  if (!questionData) {
    return null;
  }

  // Convert boolean/string to display text
  const getDisplayAnswer = (answer: boolean | "past_resolved") => {
    if (answer === true) return "Yes";
    if (answer === false) return "No";
    return "Past (Resolved)";
  };

  const displayAnswer = getDisplayAnswer(questionData.answer);
  const isYes = questionData.answer === true;

  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="mb-2 font-medium text-sm">{label}</div>
      <div className="space-y-2 text-sm">
        {questionData.questionText && (
          <div>
            <Muted>Question:</Muted> {questionData.questionText}
          </div>
        )}
        <div>
          <Muted>Answer:</Muted>{" "}
          <span className={isYes ? "font-semibold text-red-600" : ""}>
            {displayAnswer}
          </span>
        </div>
      </div>
    </div>
  );
}

// Map question IDs to display labels
const QUESTION_LABELS: Record<string, string> = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",
  q5: "Q5",
  q6: "Q6",
  q6Followup: "Q6 Follow-up",
};

export function ChatAlertDetailCard({
  alerts,
  selectedAlert,
  onAlertChange,
}: {
  alerts: AlertWithScreener[];
  selectedAlert: AlertWithScreener;
  onAlertChange: (alertId: string) => void;
}) {
  if (!selectedAlert.chat) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Chat Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <Muted>No chat data available</Muted>
        </CardContent>
      </Card>
    );
  }

  const { chat } = selectedAlert;
  const hasMultipleInstances = alerts.length > 1;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Chat Alert • Safety</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dropdown for multiple chat alert instances */}
          {hasMultipleInstances && (
            <div>
              <Muted className="mb-2 text-sm">Alert Instance</Muted>
              <Select
                value={selectedAlert.id}
                onValueChange={(value) => onAlertChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alerts.map((alert, index) => {
                    const date = new Date(alert.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    );

                    const isMostRecent = index === 0;

                    return (
                      <SelectItem key={alert.id} value={alert.id}>
                        {date}
                        {isMostRecent && " (Most Recent)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Summary Info Grid */}
          <div className="grid grid-cols-2 gap-6 rounded-lg border bg-muted/30 p-4">
            <div>
              <Muted className="text-xs uppercase tracking-wide">Status</Muted>
              <div className="mt-1.5 flex items-center gap-2 font-medium">
                <div
                  className={cn(
                    "size-2.5 rounded-full",
                    getStatusColor(selectedAlert.status),
                  )}
                />
                {titleCase(selectedAlert.status, { delimiter: "_" })}
              </div>
              {selectedAlert.status === "resolved" &&
                selectedAlert.resolvedBy === "chatbot" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Auto-resolved by AI
                  </Badge>
                )}
              {chat.isShutdown && (
                <Badge
                  variant="destructive"
                  className="mt-2 bg-red-600 text-white"
                >
                  Chat Terminated
                </Badge>
              )}
            </div>

            <div>
              <Muted className="text-xs uppercase tracking-wide">
                Alert Date
              </Muted>
              <div className="mt-1.5 font-medium">
                {new Date(selectedAlert.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Risk Information Banner */}
          {chat.shutdownRiskType && (
            <div
              className={cn(
                "rounded-lg border-2 p-4",
                chat.isShutdown
                  ? "border-red-200 bg-red-50"
                  : selectedAlert.status === "resolved" &&
                      selectedAlert.resolvedBy === "chatbot"
                    ? "border-green-200 bg-green-50"
                    : "border-orange-200 bg-orange-50",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant={
                    chat.isShutdown
                      ? "destructive"
                      : selectedAlert.status === "resolved" &&
                          selectedAlert.resolvedBy === "chatbot"
                        ? "secondary"
                        : "secondary"
                  }
                  className={cn(
                    chat.isShutdown
                      ? "bg-red-600"
                      : selectedAlert.status === "resolved" &&
                          selectedAlert.resolvedBy === "chatbot"
                        ? "bg-green-600 text-white"
                        : "bg-orange-600 text-white",
                  )}
                >
                  {titleCase(chat.shutdownRiskType)} Risk
                  {chat.isShutdown
                    ? " • Chat Terminated"
                    : selectedAlert.status === "resolved" &&
                        selectedAlert.resolvedBy === "chatbot"
                      ? " • Auto-resolved"
                      : " • In Progress"}
                </Badge>
              </div>
              <p
                className={cn(
                  "text-sm",
                  chat.isShutdown
                    ? "text-red-900"
                    : selectedAlert.status === "resolved" &&
                        selectedAlert.resolvedBy === "chatbot"
                      ? "text-green-900"
                      : "text-orange-900",
                )}
              >
                {chat.isShutdown ? (
                  <>
                    {chat.shutdownRiskType === "direct" &&
                      "The chatbot was immediately terminated due to direct suicidal ideation. Crisis resources were provided to the patient."}
                    {chat.shutdownRiskType === "indirect" &&
                      "The chatbot was terminated after CSSR screening indicated current thoughts of self-harm. Crisis resources were provided."}
                    {chat.shutdownRiskType === "ambiguous" &&
                      "The chatbot was terminated after clarification questions revealed concerning risk factors. Crisis resources were provided."}
                  </>
                ) : selectedAlert.status === "resolved" &&
                  selectedAlert.resolvedBy === "chatbot" ? (
                  <>
                    {chat.shutdownRiskType === "direct" &&
                      "Direct risk was detected but the chatbot determined the risk was low after further assessment. The conversation continued normally."}
                    {chat.shutdownRiskType === "indirect" &&
                      "Indirect risk themes were detected but the chatbot determined the risk was low after screening. The conversation continued normally."}
                    {chat.shutdownRiskType === "ambiguous" &&
                      "Ambiguous risk patterns were detected but clarification questions revealed low actual risk. The conversation continued normally."}
                  </>
                ) : (
                  <>
                    {chat.shutdownRiskType === "direct" &&
                      "Direct suicidal ideation was detected. The risk protocol is in progress."}
                    {chat.shutdownRiskType === "indirect" &&
                      "Indirect risk themes were detected. CSSR screening is in progress."}
                    {chat.shutdownRiskType === "ambiguous" &&
                      "Ambiguous risk patterns were detected. Clarification questions are in progress."}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Triggering Statement */}
          <div>
            <div className="mb-3">
              <div className="font-semibold text-sm">Triggering Statement</div>
              <Muted className="text-xs">
                The message that triggered the safety alert
              </Muted>
            </div>
            <div className="rounded-md border bg-muted/20 p-4">
              <p className="text-sm">{chat.triggeringStatement}</p>
            </div>
          </div>

          {/* Clarification Responses - Only shown for ambiguous risk shutdowns */}
          {chat.clarificationResponses &&
            shouldShowClarificationResponses(chat.shutdownRiskType) && (
              <div>
                <div className="mb-3">
                  <div className="font-semibold text-sm">
                    Clarification Responses
                  </div>
                  <Muted className="text-xs">
                    Follow-up questions to assess risk level
                  </Muted>
                </div>
                <div className="space-y-4">
                  {chat.clarificationResponses.A && (
                    <div className="rounded-md border bg-muted/20 p-4">
                      <div className="mb-2 font-medium text-sm">Question A</div>
                      <div className="space-y-2 text-sm">
                        {chat.clarificationResponses.A.question && (
                          <div>
                            <Muted>Question:</Muted>{" "}
                            {chat.clarificationResponses.A.question}
                          </div>
                        )}
                        <div>
                          <Muted>Response:</Muted>{" "}
                          {chat.clarificationResponses.A.response}
                        </div>
                        <div>
                          <Muted>Risk Assessment:</Muted>{" "}
                          {titleCase(
                            chat.clarificationResponses.A.riskAssessment,
                            {
                              delimiter: "_",
                            },
                          )}
                        </div>
                        {chat.clarificationResponses.A.reasoning && (
                          <div>
                            <Muted>Reasoning:</Muted>{" "}
                            {chat.clarificationResponses.A.reasoning}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {chat.clarificationResponses.B &&
                    renderYesNoResponse(
                      "Question B",
                      chat.clarificationResponses.B,
                    )}

                  {chat.clarificationResponses.C &&
                    renderYesNoResponse(
                      "Question C",
                      chat.clarificationResponses.C,
                    )}
                </div>
              </div>
            )}

          {/* CSSR State - Only shown for indirect and ambiguous risk shutdowns */}
          {chat.cssrState && shouldShowCSSRState(chat.shutdownRiskType) && (
            <div>
              <div className="mb-3">
                <div className="font-semibold text-sm">
                  CSSR Screening Results
                </div>
                <Muted className="text-xs">
                  Columbia-Suicide Severity Rating Scale responses
                </Muted>
              </div>
              <div className="space-y-3">
                {renderCSSRQuestion("Q1: Wish to be Dead", chat.cssrState.q1)}
                {renderCSSRQuestion("Q2: Suicidal Thoughts", chat.cssrState.q2)}
                {renderCSSRQuestion("Q3: Method", chat.cssrState.q3)}
                {renderCSSRQuestion("Q4: Intent", chat.cssrState.q4)}
                {renderCSSRQuestion("Q5: Plan", chat.cssrState.q5)}
                {renderCSSRQuestion("Q6: Lifetime Behavior", chat.cssrState.q6)}
                {renderCSSRQuestion(
                  "Q6 Follow-up: Recent Behavior (Past 3 Months)",
                  chat.cssrState.q6Followup,
                )}

                {chat.cssrState.currentQuestion && (
                  <div className="text-sm">
                    <Muted>
                      Current Question:{" "}
                      {QUESTION_LABELS[chat.cssrState.currentQuestion] ||
                        chat.cssrState.currentQuestion}
                    </Muted>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Additional Data Message - Only show if we expected data but didn't get it */}
          {!chat.isShutdown &&
            !chat.clarificationResponses &&
            !chat.cssrState && (
              <div className="rounded-md border border-muted-foreground/30 border-dashed bg-muted/20 p-4">
                <Muted className="text-sm">
                  No clarification responses or CSSR screening data available
                  for this alert.
                </Muted>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
