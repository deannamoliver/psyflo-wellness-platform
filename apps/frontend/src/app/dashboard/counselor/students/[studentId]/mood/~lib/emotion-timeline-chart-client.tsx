"use client";

import type {
  specificEmotionEnum,
  universalEmotionEnum,
} from "@feelwell/database";
import { useState } from "react";
import { Muted } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

type EmotionDataPoint = {
  id: string;
  date: Date;
  emotion: (typeof universalEmotionEnum.enumValues)[number];
  specificEmotion: (typeof specificEmotionEnum.enumValues)[number] | null;
};

type EmotionTimelineChartProps = {
  emotionData: EmotionDataPoint[];
  totalCount: number;
};

// Define emotion hierarchy from positive to negative
const emotionHierarchy = [
  "happy",
  "surprised",
  "disgusted",
  "afraid",
  "angry",
  "sad",
  "bad",
] as const;

// Map emotions to their position (0 = top/happy, 6 = bottom/bad)
function getEmotionPosition(
  emotion: (typeof universalEmotionEnum.enumValues)[number],
): number {
  const index = emotionHierarchy.indexOf(
    emotion as (typeof emotionHierarchy)[number],
  );
  return index === -1 ? 3 : index; // Default to middle if not found
}

// Get color for each emotion
function getEmotionColor(
  emotion: (typeof universalEmotionEnum.enumValues)[number],
): string {
  switch (emotion) {
    case "happy":
      return "rgb(34 197 94)"; // green
    case "surprised":
      return "rgb(139 92 246)"; // purple
    case "disgusted":
      return "rgb(234 179 8)"; // yellow
    case "afraid":
      return "rgb(249 115 22)"; // orange
    case "angry":
      return "rgb(239 68 68)"; // red
    case "sad":
      return "rgb(59 130 246)"; // blue
    case "bad":
      return "rgb(107 114 128)"; // gray
    default:
      return "rgb(100 116 139)";
  }
}

// Format emotion label
function formatEmotion(
  emotion: (typeof universalEmotionEnum.enumValues)[number],
): string {
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}

// Format specific emotion (convert snake_case to Title Case)
function formatSpecificEmotion(
  emotion: (typeof specificEmotionEnum.enumValues)[number] | null,
): string | null {
  if (!emotion) return null;
  return emotion
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EmotionTimelineChartClient({
  emotionData,
  totalCount,
}: EmotionTimelineChartProps) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  );

  // Sort data points by date (oldest to newest)
  const sortedPoints = [...emotionData].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  if (sortedPoints.length === 0) {
    return null;
  }

  // Graph dimensions
  const width = 1200;
  const height = 400;
  const padding = { top: 80, right: 80, bottom: 60, left: 80 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const numEmotions = emotionHierarchy.length;

  // Scale functions
  const xScale = (index: number) =>
    padding.left + (index / Math.max(sortedPoints.length - 1, 1)) * graphWidth;
  const yScale = (emotionPosition: number) =>
    padding.top + (emotionPosition / (numEmotions - 1)) * graphHeight;

  // Find the nearest point to the mouse cursor
  const findNearestPoint = (mouseX: number, mouseY: number) => {
    let nearestIndex = -1;
    let minDistance = Infinity;

    sortedPoints.forEach((point, index) => {
      const x = xScale(index);
      const y = yScale(getEmotionPosition(point.emotion));
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    // Only highlight if within 30px of a point
    return minDistance < 30 ? nearestIndex : null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    // Transform screen coordinates to SVG coordinates
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    const nearest = findNearestPoint(svgPoint.x, svgPoint.y);
    setHoveredPointIndex(nearest);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  return (
    <div className="w-full rounded-lg border bg-white p-6">
      <div className="mb-4">
        <div className="font-semibold text-base">Emotion Timeline</div>
        <Muted className="text-sm">
          {sortedPoints.length < totalCount
            ? `Showing most recent ${sortedPoints.length} of ${totalCount} check-ins`
            : `${sortedPoints.length} check-in${sortedPoints.length !== 1 ? "s" : ""} recorded`}
        </Muted>
      </div>

      <div className="w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full rounded-lg"
          style={{ maxHeight: "400px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Emotion labels on left side */}
          {emotionHierarchy.map((emotion, index) => {
            const y = yScale(index);
            return (
              <text
                key={emotion}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
                fontSize="11"
              >
                {formatEmotion(emotion)}
              </text>
            );
          })}

          {/* Horizontal grid lines */}
          {emotionHierarchy.map((emotion, index) => {
            const y = yScale(index);
            return (
              <line
                key={`grid-${emotion}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgb(0 0 0 / 0.05)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Trend line connecting points */}
          {sortedPoints.length > 1 && (
            <polyline
              points={sortedPoints
                .map((point, index) => {
                  const x = xScale(index);
                  const y = yScale(getEmotionPosition(point.emotion));
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgb(100 116 139)"
              strokeWidth="2"
              opacity={0.3}
            />
          )}

          {/* Data points */}
          {sortedPoints.map((point, index) => {
            const x = xScale(index);
            const y = yScale(getEmotionPosition(point.emotion));
            const isLatest = index === sortedPoints.length - 1;
            const isHovered = hoveredPointIndex === index;
            const color = getEmotionColor(point.emotion);

            return (
              <g key={point.id}>
                {/* Hover indicator ring */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.5}
                    className="animate-pulse"
                  />
                )}
                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : isLatest ? 6 : 4}
                  fill={color}
                  stroke="white"
                  strokeWidth={isHovered ? 3 : isLatest ? 2 : 1}
                  className={cn((isLatest || isHovered) && "drop-shadow-md")}
                />
                {/* Latest date label below graph */}
                {isLatest && (
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="pointer-events-none fill-muted-foreground text-xs"
                    fontSize="10"
                  >
                    {point.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip - render last so it appears on top */}
          {hoveredPointIndex !== null &&
            (() => {
              const point = sortedPoints[hoveredPointIndex];
              if (!point) return null;

              const x = xScale(hoveredPointIndex);
              const y = yScale(getEmotionPosition(point.emotion));
              const specificEmotionText = formatSpecificEmotion(
                point.specificEmotion,
              );
              const hasSpecificEmotion = specificEmotionText !== null;

              // Adjust tooltip height based on whether we have specific emotion
              const tooltipHeight = hasSpecificEmotion ? 42 : 30;
              const tooltipY = y - tooltipHeight - 15;

              return (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={x - 40}
                    y={tooltipY}
                    width={80}
                    height={tooltipHeight}
                    rx={4}
                    fill="rgb(15 23 42)"
                    opacity={0.95}
                    className="pointer-events-none"
                  />
                  {/* Universal Emotion text */}
                  <text
                    x={x}
                    y={tooltipY + 14}
                    textAnchor="middle"
                    className="pointer-events-none fill-white font-semibold text-xs"
                    fontSize="11"
                  >
                    {formatEmotion(point.emotion)}
                  </text>
                  {/* Specific Emotion text */}
                  {hasSpecificEmotion && (
                    <text
                      x={x}
                      y={tooltipY + 26}
                      textAnchor="middle"
                      className="pointer-events-none fill-white/70 text-xs"
                      fontSize="9"
                    >
                      {specificEmotionText}
                    </text>
                  )}
                  {/* Date text */}
                  <text
                    x={x}
                    y={tooltipY + (hasSpecificEmotion ? 38 : 26)}
                    textAnchor="middle"
                    className="pointer-events-none fill-white/80 text-xs"
                    fontSize="9"
                  >
                    {point.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </text>
                </g>
              );
            })()}

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
