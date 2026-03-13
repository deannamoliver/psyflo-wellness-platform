"use client";

import type { screenerTypeEnum } from "@feelwell/database";
import { useQueryState } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { Muted } from "@/lib/core-ui/typography";
import { titleCase } from "@/lib/string-utils";
import {
  getAlertTypeLabel,
  getScreenerTypeLabel,
  groupAlertsBySource,
} from "@/lib/student-alerts/student-status";
import type {
  AlertSource,
  StudentAlertsGrouped,
} from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";
import { ChatAlertDetailCard } from "./chat-alert-detail-card";
import { ScoreTrendGraph } from "./score-trend-graph";
import { ScreenerQuestions } from "./screener-questions";

// Helper to create unique source key
function getSourceKey(source: AlertSource): string {
  if (source.sourceType === "chat") {
    return "chat";
  } else {
    return `screener:${source.screenerType}:${source.alertType}`;
  }
}

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

// Helper to get interpretation ranges for a screener type
function getInterpretationRanges(
  screenerType: (typeof screenerTypeEnum.enumValues)[number],
  currentScore: number,
): Array<{
  range: string;
  severity: string;
  isCurrentRange: boolean;
}> {
  switch (screenerType) {
    case "phq_a":
    case "phq_9":
      return [
        {
          range: "0-4",
          severity: "Minimal",
          isCurrentRange: currentScore <= 4,
        },
        {
          range: "5-9",
          severity: "Mild",
          isCurrentRange: currentScore >= 5 && currentScore <= 9,
        },
        {
          range: "10-14",
          severity: "Moderate",
          isCurrentRange: currentScore >= 10 && currentScore <= 14,
        },
        {
          range: "15-19",
          severity: "Moderately Severe",
          isCurrentRange: currentScore >= 15 && currentScore <= 19,
        },
        {
          range: "20+",
          severity: "Severe",
          isCurrentRange: currentScore >= 20,
        },
      ];

    case "gad_child": {
      const avgScore = currentScore / 10;
      return [
        {
          range: "< 0.5 avg",
          severity: "None",
          isCurrentRange: avgScore < 0.5,
        },
        {
          range: "0.5-1.4 avg",
          severity: "Minimal",
          isCurrentRange: avgScore >= 0.5 && avgScore < 1.5,
        },
        {
          range: "1.5-2.4 avg",
          severity: "Mild",
          isCurrentRange: avgScore >= 1.5 && avgScore < 2.5,
        },
        {
          range: "2.5-3.4 avg",
          severity: "Moderate",
          isCurrentRange: avgScore >= 2.5 && avgScore < 3.5,
        },
        {
          range: "3.5+ avg",
          severity: "Severe",
          isCurrentRange: avgScore >= 3.5,
        },
      ];
    }

    case "gad_7":
      return [
        {
          range: "0-4",
          severity: "Minimal",
          isCurrentRange: currentScore <= 4,
        },
        {
          range: "5-9",
          severity: "Mild",
          isCurrentRange: currentScore >= 5 && currentScore <= 9,
        },
        {
          range: "10-14",
          severity: "Moderate",
          isCurrentRange: currentScore >= 10 && currentScore <= 14,
        },
        {
          range: "15+",
          severity: "Severe",
          isCurrentRange: currentScore >= 15,
        },
      ];

    default:
      return [];
  }
}

export function AlertDetailCard({ data }: { data: StudentAlertsGrouped }) {
  const [selectedSourceKey, _setSelectedSourceKey] = useQueryState("sourceKey");
  const [selectedAlertId, setSelectedAlertId] = useQueryState("alertId");

  // Group alerts by source
  const alertSources = groupAlertsBySource(data.alerts);

  // Find default source (first one with alerts)
  const defaultSource =
    alertSources.find((s) => s.hasAlerts) ?? alertSources[0];
  const defaultSourceKey = defaultSource ? getSourceKey(defaultSource) : null;
  const effectiveSourceKey = selectedSourceKey ?? defaultSourceKey;

  // Find the selected source
  const selectedSource = alertSources.find(
    (source) => getSourceKey(source) === effectiveSourceKey,
  );

  if (!selectedSource) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Muted>No source selected</Muted>
        </CardContent>
      </Card>
    );
  }

  // Determine card title
  let title: string;
  if (selectedSource.sourceType === "chat") {
    title = `Chat • ${getAlertTypeLabel(selectedSource.alertType)}`;
  } else {
    // Format: "Screener Type • Alert Type" (e.g., "PHQ-A • Depression")
    title = `${getScreenerTypeLabel(selectedSource.screenerType)} • ${getAlertTypeLabel(selectedSource.alertType)}`;
  }

  // If source has no alerts, show "no alerts" message
  if (!selectedSource.hasAlerts) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-muted-foreground/30 border-dashed bg-muted/20 p-4">
            <Muted className="text-sm">
              No alerts for this{" "}
              {selectedSource.sourceType === "chat"
                ? "source"
                : "screener type"}
            </Muted>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find selected alert within source
  const defaultAlertId = selectedSource.alerts[0]?.id ?? null;
  const effectiveAlertId = selectedAlertId ?? defaultAlertId;
  const selectedAlert =
    selectedSource.alerts.find((alert) => alert.id === effectiveAlertId) ??
    selectedSource.alerts[0];

  if (!selectedAlert) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Muted>No alert data available</Muted>
        </CardContent>
      </Card>
    );
  }

  // For chat alerts, use ChatAlertDetailCard
  if (selectedSource.sourceType === "chat") {
    return (
      <ChatAlertDetailCard
        alerts={selectedSource.alerts}
        selectedAlert={selectedAlert}
        onAlertChange={setSelectedAlertId}
      />
    );
  }

  // For screener alerts, show dropdown if multiple instances exist
  const hasMultipleInstances = selectedSource.alerts.length > 1;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dropdown for multiple screener instances */}
          {hasMultipleInstances && (
            <div>
              <Muted className="mb-2 text-sm">Screener Instance</Muted>
              <Select
                value={selectedAlert.id}
                onValueChange={(value) => setSelectedAlertId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedSource.alerts.map((alert) => {
                    const date = alert.screener?.completedAt
                      ? new Date(alert.screener.completedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "Date unknown";

                    const isMostRecent =
                      alert.id === selectedSource.alerts[0]?.id;

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
          <div className="grid grid-cols-3 gap-6 rounded-lg border bg-muted/30 p-4">
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
            </div>

            {selectedAlert.screener && (
              <>
                <div>
                  <Muted className="text-xs uppercase tracking-wide">
                    Score
                  </Muted>
                  <div className="mt-1.5 font-medium text-lg">
                    {selectedAlert.screener.score.toFixed(0)} /{" "}
                    {selectedAlert.screener.maxScore.toFixed(0)}
                  </div>
                </div>

                <div>
                  <Muted className="text-xs uppercase tracking-wide">
                    Completed
                  </Muted>
                  <div className="mt-1.5 font-medium">
                    {selectedAlert.screener.completedAt
                      ? new Date(
                          selectedAlert.screener.completedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Safety Alert Info Banner */}
          {selectedAlert.type === "safety" && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 5Zm0 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-red-900 text-sm">
                    Safety Alert - Immediate Review Required
                  </div>
                  <Muted className="mt-1 text-red-800 text-sm">
                    This alert was generated because the patient indicated thoughts of self-harm on Question 9 of the screener.
                  </Muted>
                </div>
              </div>
              
              {/* Assessment Score Summary for Safety Alerts */}
              {selectedAlert.screener && selectedSource.sourceType === "screener" && (
                <div className="mt-4 grid grid-cols-3 gap-4 rounded-md bg-white/60 p-3">
                  <div>
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Assessment</div>
                    <div className="mt-1 font-semibold text-red-900">
                      {getScreenerTypeLabel(selectedSource.screenerType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Total Score</div>
                    <div className="mt-1 font-bold text-lg text-red-900">
                      {selectedAlert.screener.score.toFixed(0)} / {selectedAlert.screener.maxScore.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Severity</div>
                    <div className="mt-1 font-semibold text-red-900">
                      {getInterpretationRanges(selectedSource.screenerType, selectedAlert.screener.score)
                        .find(r => r.isCurrentRange)?.severity ?? "Unknown"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score Trend Graph - Only show when multiple instances */}
          {hasMultipleInstances &&
            selectedAlert.screener &&
            selectedSource.sourceType === "screener" && (
              <ScoreTrendGraph
                alerts={selectedSource.alerts}
                screenerType={selectedSource.screenerType}
                selectedAlertId={selectedAlert.id}
              />
            )}

          {/* Score Interpretation Table */}
          {selectedAlert.screener &&
            selectedSource.sourceType === "screener" && (
              <div>
                <div className="mb-3">
                  <div className="font-semibold text-sm">
                    Score Interpretation
                  </div>
                  <Muted className="text-xs">
                    Understanding{" "}
                    {getScreenerTypeLabel(selectedSource.screenerType)} results
                  </Muted>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Score Range</TableHead>
                      <TableHead>Severity Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getInterpretationRanges(
                      selectedSource.screenerType,
                      selectedAlert.screener.score,
                    ).map((row) => (
                      <TableRow
                        key={`${row.range}-${row.severity}`}
                        className={cn(
                          row.isCurrentRange &&
                            "bg-primary/10 font-medium hover:bg-primary/15",
                        )}
                      >
                        <TableCell className="font-mono text-sm">
                          {row.range}
                        </TableCell>
                        <TableCell>
                          {row.severity}
                          {row.isCurrentRange && (
                            <span className="ml-2 text-primary text-xs">
                              (Current)
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

          {/* Screener Questions and Answers */}
          {selectedAlert.screenerSessions &&
            selectedAlert.screenerSessions.length > 0 && (
              <div>
                <ScreenerQuestions
                  sessions={selectedAlert.screenerSessions}
                  alertType={selectedAlert.type}
                />
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
