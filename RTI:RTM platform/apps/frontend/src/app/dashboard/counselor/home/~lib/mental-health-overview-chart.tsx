"use client";

import type { screenerTypeEnum } from "@feelwell/database";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { chartConfig } from "@/lib/analytics/chart-config";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/lib/core-ui/chart";
import type { RiskLevel } from "@/lib/screener/type";

export type ScoreCount = {
  level: RiskLevel;
  count: number;
  title: string;
};

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

function getFill(level: RiskLevel): string {
  switch (level) {
    case 0:
      return "#22c55e"; // green-500
    case 1:
      return "#84cc16"; // lime-500
    case 2:
      return "#eab308"; // yellow-500
    case 3:
      return "#f97316"; // orange-500
    case 4:
      return "#ef4444"; // red-500
    case 5:
      return "#dc2626"; // red-600
  }
}

// Donut chart colors matching snapshot design: Severe=blue, Moderately Severe=light blue, etc.
function getDonutFill(level: RiskLevel): string {
  switch (level) {
    case 0:
      return "#c4b5fd"; // None - very light purple
    case 1:
      return "#a78bfa"; // Minimal - light purple
    case 2:
      return "#7c3aed"; // Mild - purple
    case 3:
      return "#0d9488"; // Moderate - teal
    case 4:
      return "#60a5fa"; // Moderately Severe - light blue
    case 5:
      return "#2563eb"; // Severe - blue
  }
}

function getScoreRange(
  type: ScreenerType,
  riskLevel: RiskLevel,
): string | null {
  if (type === "sel") {
    return null;
  }

  if (type === "phq_a" || type === "phq_9") {
    switch (riskLevel) {
      case 1:
        return "0-4";
      case 2:
        return "5-9";
      case 3:
        return "10-14";
      case 4:
        return "15-19";
      case 5:
        return "20+";
    }
  }

  if (type === "gad_child") {
    switch (riskLevel) {
      case 0:
        return "Avg <0.5";
      case 1:
        return "Avg 0.5-1.4";
      case 2:
        return "Avg 1.5-2.4";
      case 3:
        return "Avg 2.5-3.4";
      case 5:
        return "Avg 3.5+";
    }
  }

  if (type === "gad_7") {
    switch (riskLevel) {
      case 1:
        return "0-4";
      case 2:
        return "5-9";
      case 3:
        return "10-14";
      case 5:
        return "15+";
    }
  }

  return null;
}

// Custom tick component for multi-line labels
function CustomTick({
  x,
  y,
  payload,
}: {
  x: number;
  y: number;
  payload: { value: string };
}) {
  const lines = payload.value.split("\n");

  return (
    <g transform={`translate(${x},${y + 12})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="#666"
        fontSize={12}
        fontWeight="600"
      >
        <tspan x="0" dy="0">
          {lines[0]}
        </tspan>
        {lines[1] && (
          <tspan x="0" dy="16">
            {lines[1]}
          </tspan>
        )}
      </text>
    </g>
  );
}

export function MentalHealthOverviewChart({
  data,
  screenerType,
}: {
  data: ScoreCount[];
  screenerType: ScreenerType;
}) {
  const chartData = data.map((item) => {
    const fill = getFill(item.level);
    const scoreRange = getScoreRange(screenerType, item.level);
    const label = scoreRange ? `${item.title}\n(${scoreRange})` : item.title;
    return { ...item, fill, label };
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-center" aria-hidden>
        <ChartContainer
          config={chartConfig}
          style={{ width: "100%", height: 380 }}
        >
          <BarChart
            data={chartData}
            width={500}
            height={380}
            margin={{ top: 20, right: 20, bottom: 55, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={<CustomTick x={0} y={0} payload={{ value: "" }} />}
              interval={0}
              height={55}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              label={{
                value: "Number of Students",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.level}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

const SEVERITY_ORDER: RiskLevel[] = [5, 4, 3, 2, 1, 0];

export function MentalHealthDonutChart({
  data,
  selectedLevel,
}: {
  data: ScoreCount[];
  selectedLevel: RiskLevel | null;
}) {
  const chartData = data.map((item) => ({
    ...item,
    fill:
      selectedLevel !== null && item.level !== selectedLevel
        ? "#e5e7eb"
        : getDonutFill(item.level),
    value: item.count,
  }));

  const size = 320;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - 48;

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 gap-y-6 sm:flex-nowrap">
      <div className="flex shrink-0" aria-hidden>
        <ChartContainer
          config={chartConfig}
          style={{ width: size, height: size }}
        >
          <PieChart width={size} height={size}>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="title"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={1}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.level} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {SEVERITY_ORDER.filter((level) =>
          data.some((d) => d.level === level),
        ).map((level) => {
          const item = data.find((d) => d.level === level);
          if (!item) return null;
          const isSelected = selectedLevel === null || selectedLevel === level;
          return (
            <div
              key={level}
              className="flex items-center gap-2"
              style={{ color: isSelected ? getDonutFill(level) : "#9ca3af" }}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: getDonutFill(level) }}
                aria-hidden
              />
              <span className={!isSelected ? "text-gray-400" : undefined}>
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
