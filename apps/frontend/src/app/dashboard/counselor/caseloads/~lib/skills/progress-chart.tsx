"use client";

/**
 * Recharts line chart for SEL skill development progress over time.
 *
 * Shows one line per SEL subtype, with the Y axis on a 1.0-4.0 scale.
 */

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/lib/core-ui/chart";
import {
  SEL_SUBTYPE_COLORS,
  SEL_SUBTYPE_LABELS,
  SEL_SUBTYPE_ORDER,
} from "./config";

export type SkillsChartDataPoint = {
  bucket: string;
  label: string;
  [key: string]: number | string | undefined;
};

const SERIES = SEL_SUBTYPE_ORDER.map((key) => ({
  key,
  label: SEL_SUBTYPE_LABELS[key] ?? key,
  color: SEL_SUBTYPE_COLORS[key] ?? "#6b7280",
}));

function buildChartConfig(): ChartConfig {
  const config: ChartConfig = {};
  for (const s of SERIES) {
    config[s.key] = { label: s.label, color: s.color };
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
    payload: SkillsChartDataPoint;
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
        .filter((e) => e.value != null)
        .map((entry) => {
          const s = SERIES.find((s) => s.key === entry.dataKey);
          return (
            <div
              key={entry.dataKey}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{s?.label}:</span>
              <span className="font-medium text-gray-900">
                {typeof entry.value === "number"
                  ? entry.value.toFixed(1)
                  : entry.value}
              </span>
            </div>
          );
        })}
    </div>
  );
}

export function ProgressChart({ data }: { data: SkillsChartDataPoint[] }) {
  const config = buildChartConfig();

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-gray-500 text-sm">
        No skill development data for this time range
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
          domain={[0, 4]}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={35}
          tickFormatter={(v) => `${v}`}
        />
        <ChartTooltip content={<CustomTooltip />} />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

/** Legend strip showing all 8 subtype colors + labels. */
export function ProgressLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-xs">
      {SERIES.map((s) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: s.color }}
          />
          {s.label}
        </div>
      ))}
    </div>
  );
}
