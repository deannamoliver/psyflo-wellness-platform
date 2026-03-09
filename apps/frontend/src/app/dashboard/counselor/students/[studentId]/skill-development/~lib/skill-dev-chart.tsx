"use client";

import { formatDate } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/lib/core-ui/chart";

export type SkillDevelopmentData = {
  week: number;
  cognitive: number;
  emotion: number;
  social: number;
  values: number;
  perspective: number;
  identity: number;
};

const chartConfig = {
  cognitive: {
    label: "Cognitive",
    color: "#3b82f6",
  },
  emotion: {
    label: "Emotion",
    color: "#ef4444",
  },
  social: {
    label: "Social",
    color: "#10b981",
  },
  values: {
    label: "Values",
    color: "#f59e0b",
  },
  perspective: {
    label: "Perspective",
    color: "#8b5cf6",
  },
  identity: {
    label: "Identity",
    color: "#ec4899",
  },
};

export default function SkillDevelopmentChart({
  data,
  className,
}: {
  data: SkillDevelopmentData[];
  className?: string;
}) {
  return (
    <ChartContainer config={chartConfig} className={className}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="week"
          type="number"
          scale="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={["dataMin", "dataMax"]}
          tickFormatter={(value) => formatDate(new Date(value), "MMM yyyy")}
        />
        <YAxis orientation="right" axisLine={false} tickLine={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="cognitive"
          type="linear"
          stroke="var(--color-cognitive)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="emotion"
          type="linear"
          stroke="var(--color-emotion)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="social"
          type="linear"
          stroke="var(--color-social)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="values"
          type="linear"
          stroke="var(--color-values)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="perspective"
          type="linear"
          stroke="var(--color-perspective)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="identity"
          type="linear"
          stroke="var(--color-identity)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
