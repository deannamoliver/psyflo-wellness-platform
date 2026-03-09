"use client";

import { useQueryState } from "nuqs";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { Large, Small } from "@/lib/core-ui/typography";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { groupAlertsBySource } from "@/lib/student-alerts/student-status";
import type {
  AlertSource,
  StudentAlertsGrouped,
} from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";

// Helper to create unique source key
function getSourceKey(source: AlertSource): string {
  if (source.sourceType === "chat") {
    return "chat";
  } else {
    return `screener:${source.screenerType}:${source.alertType}`;
  }
}

export function AlertTimeline({ data }: { data: StudentAlertsGrouped }) {
  const [selectedSourceKey] = useQueryState("sourceKey");
  const [selectedAlertId] = useQueryState("alertId");

  // Group alerts by source
  const alertSources = groupAlertsBySource(data.alerts);

  // Find default source
  const defaultSource =
    alertSources.find((s) => s.hasAlerts) ?? alertSources[0];
  const defaultSourceKey = defaultSource ? getSourceKey(defaultSource) : null;
  const effectiveSourceKey = selectedSourceKey ?? defaultSourceKey;

  // Find the selected source
  const selectedSource = alertSources.find(
    (source) => getSourceKey(source) === effectiveSourceKey,
  );

  // If no source or source has no alerts, show empty timeline
  if (!selectedSource || !selectedSource.hasAlerts) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <Large className="font-semibold">Alert Timeline</Large>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            No timeline entries available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get effective alert ID
  const defaultAlertId = selectedSource.alerts[0]?.id ?? null;
  const effectiveAlertId = selectedAlertId ?? defaultAlertId;

  // Filter timeline entries to only show entries for the selected alert
  const filteredEntries = data.timelineEntries.filter(
    (entry) => entry.alertId === effectiveAlertId,
  );

  // Sort timeline entries by createdAt (most recent first)
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return (
    <Card className="bg-white">
      <CardHeader>
        <Large className="font-semibold">Alert Timeline</Large>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEntries.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            No timeline entries for this alert
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            // Determine dot color based on entry type
            let dotColor = "bg-muted-foreground"; // Default gray

            switch (entry.type) {
              case "alert_generated":
                dotColor = "bg-destructive"; // Red - new alert
                break;

              case "status_changed": {
                // Case-insensitive matching for status descriptions
                const desc = entry.description.toLowerCase();
                if (
                  desc.includes("in progress") ||
                  desc.includes("in_progress")
                ) {
                  dotColor = "bg-warning"; // Yellow - being worked on
                } else if (desc.includes("resolved")) {
                  dotColor = "bg-success"; // Green - completed
                } else if (desc.includes("new")) {
                  dotColor = "bg-destructive"; // Red - reopened
                }
                break;
              }

              case "emergency_action":
                dotColor = "bg-destructive"; // Red - critical action
                break;

              case "note_added":
                dotColor = "bg-primary"; // Blue - informational
                break;

              default:
                dotColor = "bg-muted-foreground"; // Gray - unknown type
            }

            return (
              <div key={entry.id} className="relative">
                {/* Timeline connector line */}
                {index < sortedEntries.length - 1 && (
                  <div className="absolute top-6 left-1.5 h-full w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 mt-1.5 size-3 rounded-full",
                      dotColor,
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.description}</span>
                        <span className="text-muted-foreground text-sm">•</span>
                        <Small className="text-muted-foreground">
                          <Timestamp
                            value={entry.createdAt}
                            format="MMM d, yyyy 'at' h:mm a"
                          />
                        </Small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
