"use client";

import type { screenerTypeEnum } from "@feelwell/database";
import { Muted } from "@/lib/core-ui/typography";
import type { AlertWithScreener } from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";

type ScoreTrendGraphProps = {
  alerts: AlertWithScreener[];
  screenerType: (typeof screenerTypeEnum.enumValues)[number];
  selectedAlertId: string;
};

// Get max score for each screener type
function getMaxScore(
  screenerType: (typeof screenerTypeEnum.enumValues)[number],
): number {
  switch (screenerType) {
    case "phq_a":
    case "phq_9":
      return 27; // 9 questions × 3 max score
    case "gad_child":
      return 30; // 10 questions × 3 max score
    case "gad_7":
      return 21; // 7 questions × 3 max score
    default:
      return 30;
  }
}

// Get severity zones for background shading
function getSeverityZones(
  screenerType: (typeof screenerTypeEnum.enumValues)[number],
  maxScore: number,
): Array<{ label: string; start: number; end: number; color: string }> {
  switch (screenerType) {
    case "phq_a":
    case "phq_9":
      return [
        { label: "Minimal", start: 0, end: 4, color: "rgb(34 197 94 / 0.1)" }, // green
        { label: "Mild", start: 5, end: 9, color: "rgb(234 179 8 / 0.1)" }, // yellow
        {
          label: "Moderate",
          start: 10,
          end: 14,
          color: "rgb(249 115 22 / 0.15)",
        }, // orange
        {
          label: "Moderately Severe",
          start: 15,
          end: 19,
          color: "rgb(239 68 68 / 0.15)",
        }, // red
        {
          label: "Severe",
          start: 20,
          end: maxScore,
          color: "rgb(220 38 38 / 0.2)",
        }, // dark red
      ];
    case "gad_7":
      return [
        { label: "Minimal", start: 0, end: 4, color: "rgb(34 197 94 / 0.1)" },
        { label: "Mild", start: 5, end: 9, color: "rgb(234 179 8 / 0.1)" },
        {
          label: "Moderate",
          start: 10,
          end: 14,
          color: "rgb(249 115 22 / 0.15)",
        },
        {
          label: "Severe",
          start: 15,
          end: maxScore,
          color: "rgb(239 68 68 / 0.2)",
        },
      ];
    case "gad_child":
      // GAD-Child uses average scores, so we'll show based on total score ranges
      return [
        { label: "None", start: 0, end: 4, color: "rgb(34 197 94 / 0.1)" },
        { label: "Minimal", start: 5, end: 14, color: "rgb(234 179 8 / 0.1)" },
        { label: "Mild", start: 15, end: 24, color: "rgb(249 115 22 / 0.15)" },
        {
          label: "Moderate",
          start: 25,
          end: 34,
          color: "rgb(239 68 68 / 0.15)",
        },
        {
          label: "Severe",
          start: 35,
          end: maxScore,
          color: "rgb(220 38 38 / 0.2)",
        },
      ];
    default:
      return [];
  }
}

export function ScoreTrendGraph({
  alerts,
  screenerType,
  selectedAlertId,
}: ScoreTrendGraphProps) {
  const maxScore = getMaxScore(screenerType);
  const severityZones = getSeverityZones(screenerType, maxScore);

  // Prepare data points sorted by completion date
  const dataPoints = alerts
    .filter((alert) => alert.screener?.completedAt)
    .map((alert) => ({
      alertId: alert.id,
      score: alert.screener?.score ?? 0,
      completedAt: alert.screener?.completedAt ?? new Date(),
      isSelected: alert.id === selectedAlertId,
    }))
    .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

  if (dataPoints.length === 0) {
    return null;
  }

  // Graph dimensions
  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) =>
    padding.left + (index / Math.max(dataPoints.length - 1, 1)) * graphWidth;
  const yScale = (score: number) =>
    padding.top + graphHeight - (score / maxScore) * graphHeight;

  return (
    <div>
      <div className="mb-3">
        <div className="font-semibold text-sm">Score Trend</div>
        <Muted className="text-xs">
          {dataPoints.length} instance{dataPoints.length !== 1 ? "s" : ""} over
          time
        </Muted>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          className="rounded-lg border bg-white"
          style={{ minWidth: "600px" }}
        >
          {/* Severity zone backgrounds */}
          {severityZones.map((zone) => {
            const zoneTop = yScale(zone.end);
            const zoneBottom = yScale(zone.start);
            const zoneHeight = zoneBottom - zoneTop;

            return (
              <g key={`${zone.label}-${zone.start}-${zone.end}`}>
                <rect
                  x={padding.left}
                  y={zoneTop}
                  width={graphWidth}
                  height={zoneHeight}
                  fill={zone.color}
                />
                {/* Zone label on right side */}
                <text
                  x={width - padding.right + 5}
                  y={zoneTop + zoneHeight / 2}
                  className="fill-muted-foreground text-xs"
                  dominantBaseline="middle"
                  fontSize="10"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + graphHeight * (1 - ratio);
            const score = Math.round(maxScore * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgb(0 0 0 / 0.1)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs"
                  fontSize="11"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Trend line connecting points */}
          {dataPoints.length > 1 && (
            <polyline
              points={dataPoints
                .map(
                  (point, index) => `${xScale(index)},${yScale(point.score)}`,
                )
                .join(" ")}
              fill="none"
              stroke="rgb(59 130 246)" // blue
              strokeWidth="2"
            />
          )}

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = xScale(index);
            const y = yScale(point.score);

            return (
              <g key={point.alertId}>
                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={point.isSelected ? 6 : 4}
                  fill="white"
                  stroke={
                    point.isSelected ? "rgb(59 130 246)" : "rgb(100 116 139)"
                  }
                  strokeWidth={point.isSelected ? 3 : 2}
                  className={cn(point.isSelected && "drop-shadow-md")}
                />
                {/* Score label above point */}
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className={cn(
                    "font-medium text-xs",
                    point.isSelected ? "fill-primary" : "fill-muted-foreground",
                  )}
                  fontSize="11"
                >
                  {Math.round(point.score)}
                </text>
                {/* Date label below graph */}
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                  fontSize="10"
                >
                  {point.completedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="rgb(0 0 0 / 0.2)"
            strokeWidth="1"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="rgb(0 0 0 / 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
