"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { chartConfig } from "@/lib/analytics/chart-config";
import { ChartContainer, ChartTooltip } from "@/lib/core-ui/chart";

const CustomLabel = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: string;
}) => {
  const { x = 0, y = 0, height = 0, value } = props;

  return (
    <text
      x={x - 8}
      y={y + height / 2}
      textAnchor="end"
      dominantBaseline="middle"
      className="font-semibold text-sm"
      style={{
        fill: "hsl(var(--primary))",
        paintOrder: "stroke",
        stroke: "white",
        strokeWidth: 3,
        strokeLinejoin: "round",
      }}
    >
      {value?.split(" ").map((word, i, arr) => {
        const lineHeight = 16;
        const maxWordsPerLine = 3;
        const lineIndex = Math.floor(i / maxWordsPerLine);
        const yOffset =
          lineHeight *
          (lineIndex - (Math.ceil(arr.length / maxWordsPerLine) - 1) / 2);
        const wordPosition = i % maxWordsPerLine;

        if (wordPosition === 0) {
          return (
            <tspan
              key={`${value}-line${lineIndex}-${word}`}
              x={x - 8}
              dy={i === 0 ? yOffset : lineHeight}
            >
              {word}
            </tspan>
          );
        }
        return (
          <tspan key={`${value}-line${lineIndex}-pos${wordPosition}-${word}`}>
            {" "}
            {word}
          </tspan>
        );
      })}
    </text>
  );
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { label: string; score: number; maxScore: number };
  }>;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">{data.label}</p>
        <p className="text-muted-foreground text-xs">
          score: {data.score.toFixed(1)} / {data.maxScore.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export function SELDomainsChart({
  data,
  onSelect,
}: {
  data: { domain: string; label: string; score: number; maxScore: number }[];
  onSelect: (domain: string) => void;
}) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 180 }}
      >
        <YAxis dataKey="label" type="category" hide />
        <XAxis dataKey="score" type="number" hide />
        <ChartTooltip content={<CustomTooltip />} />
        <Bar dataKey="score" layout="vertical" radius={8}>
          {data.map((entry) => (
            <Cell
              key={entry.domain}
              fill={"var(--color-primary)"}
              onClick={() => onSelect(entry.domain)}
              className="cursor-pointer"
            />
          ))}
          <LabelList dataKey="label" content={<CustomLabel />} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
