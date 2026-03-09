"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/lib/core-ui/chart";
import { type ChartDataPoint, MOOD_DISPLAY_ORDER } from "./mood-trends-config";

function buildChartConfig(): ChartConfig {
  const config: ChartConfig = {};
  for (const m of MOOD_DISPLAY_ORDER) {
    config[m.key] = { label: m.label, color: m.color };
  }
  return config;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1.5 font-medium text-gray-900 text-xs">
        {point?.label ?? label}
      </p>
      {payload
        .filter((e) => (e.value ?? 0) > 0)
        .map((entry) => {
          const mood = MOOD_DISPLAY_ORDER.find((m) => m.key === entry.dataKey);
          return (
            <div
              key={entry.dataKey}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{mood?.label}:</span>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          );
        })}
    </div>
  );
}

export function MoodTrendsChart({ data }: { data: ChartDataPoint[] }) {
  const config = buildChartConfig();

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-gray-500 text-sm">
        No mood data for this time range
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-[2.5/1] w-full">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={35}
          allowDecimals={false}
        />
        <ChartTooltip content={<CustomTooltip />} />
        {MOOD_DISPLAY_ORDER.map((m) => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            stroke={m.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
