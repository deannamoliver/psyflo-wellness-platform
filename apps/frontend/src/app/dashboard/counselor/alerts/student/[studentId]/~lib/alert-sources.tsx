"use client";

import { useQueryState } from "nuqs";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
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

// Helper to create unique source key
function getSourceKey(source: AlertSource): string {
  if (source.sourceType === "chat") {
    return "chat";
  } else {
    return `screener:${source.screenerType}:${source.alertType}`;
  }
}

export function AlertSources({ data }: { data: StudentAlertsGrouped }) {
  const [selectedSourceKey, setSelectedSourceKey] = useQueryState("sourceKey");

  // Group alerts by source (screener type + alert type)
  const alertSources = groupAlertsBySource(data.alerts);

  // Default to first source with alerts if none selected
  const defaultSource =
    alertSources.find((s) => s.hasAlerts) ?? alertSources[0];
  const defaultSourceKey = defaultSource ? getSourceKey(defaultSource) : null;
  const effectiveSourceKey = selectedSourceKey ?? defaultSourceKey;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Alert Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertSources.map((source) => {
          const sourceKey = getSourceKey(source);
          const isSelected = sourceKey === effectiveSourceKey;

          let label: string;
          if (source.sourceType === "chat") {
            label = "Chat Alerts";
          } else {
            // Format: "Alert Type - Screener Type" (e.g., "Depression - PHQ-A")
            label = `${getAlertTypeLabel(source.alertType)} - ${getScreenerTypeLabel(source.screenerType)}`;
          }

          // Determine status dot color
          let dotColor: string;
          if (!source.hasAlerts) {
            // Light grey for sources without alerts
            dotColor = "bg-muted-foreground/40";
          } else {
            const mostRecentAlert = source.alerts[0];
            dotColor =
              mostRecentAlert?.status === "new"
                ? "bg-destructive" // Red for new
                : mostRecentAlert?.status === "in_progress"
                  ? "bg-warning" // Yellow for in progress
                  : "bg-success"; // Green for resolved
          }

          return (
            <Button
              key={sourceKey}
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                isSelected && "bg-primary",
                !source.hasAlerts && "text-muted-foreground",
              )}
              onClick={() => {
                setSelectedSourceKey(sourceKey);
              }}
            >
              <div className={cn("size-2 rounded-full", dotColor)} />
              {label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
