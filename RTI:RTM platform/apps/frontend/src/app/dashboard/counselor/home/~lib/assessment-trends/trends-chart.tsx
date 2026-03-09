"use client";

import { format } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/lib/core-ui/chart";
import { ASSESSMENT_SERIES_CONFIG } from "./config";
import type { AssessmentTimeSeriesRow } from "./data";

type TimeRange = "30d" | "90d" | "6m" | "1y";

type ChartDataPoint = {
  bucket: string;
  label: string;
  [key: string]: number | string | undefined;
};

const SERIES_ENTRIES = Object.entries(ASSESSMENT_SERIES_CONFIG) as [
  string,
  { label: string; color: string },
][];

function buildChartConfig(): ChartConfig {
  const config: ChartConfig = {};
  for (const [key, { label, color }] of SERIES_ENTRIES) {
    config[key] = { label, color };
  }
  return config;
}

type BucketGranularity = "day" | "week" | "month";

function getBucketGranularity(timeRange: TimeRange): BucketGranularity {
  switch (timeRange) {
    case "30d":
      return "day";
    case "90d":
      return "week";
    case "6m":
    case "1y":
      return "month";
  }
}

function toBucketKey(dateStr: string, bucket: BucketGranularity): string {
  const d = new Date(dateStr);
  if (bucket === "day") return format(d, "yyyy-MM-dd");
  if (bucket === "week") {
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    return format(monday, "yyyy-MM-dd");
  }
  return format(d, "yyyy-MM");
}

function formatBucketLabel(key: string, bucket: BucketGranularity): string {
  const d = new Date(key);
  if (bucket === "day") return format(d, "MMM d");
  if (bucket === "week") return format(d, "MMM d");
  return format(d, "MMM yyyy");
}

export function aggregateAssessmentBuckets(
  points: AssessmentTimeSeriesRow[],
  bucket: BucketGranularity,
): ChartDataPoint[] {
  // Group by bucket, then by screener type → weighted average pct
  const bucketMap = new Map<
    string,
    Record<string, { totalPct: number; totalCount: number }>
  >();

  for (const p of points) {
    const key = toBucketKey(p.period, bucket);
    if (!bucketMap.has(key)) bucketMap.set(key, {});
    const types = bucketMap.get(key)!;
    if (!types[p.screenerType]) {
      types[p.screenerType] = { totalPct: 0, totalCount: 0 };
    }
    types[p.screenerType]!.totalPct += p.avgPct * p.count;
    types[p.screenerType]!.totalCount += p.count;
  }

  return Array.from(bucketMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, types]) => {
      const point: ChartDataPoint = {
        bucket: key,
        label: formatBucketLabel(key, bucket),
      };
      for (const [type, agg] of Object.entries(types)) {
        point[type] =
          agg.totalCount > 0
            ? Math.round(agg.totalPct / agg.totalCount)
            : undefined;
      }
      return point;
    });
}

function getDateCutoff(timeRange: TimeRange): Date {
  const now = new Date();
  switch (timeRange) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "6m":
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
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
        .filter((e) => e.value != null)
        .map((entry) => {
          const config =
            ASSESSMENT_SERIES_CONFIG[
              entry.dataKey as keyof typeof ASSESSMENT_SERIES_CONFIG
            ];
          return (
            <div
              key={entry.dataKey}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">
                {config?.label ?? entry.dataKey}:
              </span>
              <span className="font-medium text-gray-900">
                {Math.round(entry.value)}%
              </span>
            </div>
          );
        })}
    </div>
  );
}

export function AssessmentTrendsChart({
  data,
  timeRange,
  grade,
}: {
  data: AssessmentTimeSeriesRow[];
  timeRange: TimeRange;
  grade: string;
}) {
  const config = buildChartConfig();

  // Filter data
  const cutoff = getDateCutoff(timeRange);
  const bucket = getBucketGranularity(timeRange);
  const filtered = data.filter((p) => {
    if (new Date(p.period) < cutoff) return false;
    if (grade !== "all" && p.grade !== Number(grade)) return false;
    return true;
  });

  const chartData = aggregateAssessmentBuckets(filtered, bucket);

  if (chartData.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-gray-500 text-sm">
        No assessment data for this time range
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-[2.5/1] w-full">
      <LineChart
        data={chartData}
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
          domain={[0, 100]}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={35}
          tickFormatter={(v) => `${v}%`}
        />

        <ChartTooltip content={<CustomTooltip />} />

        {SERIES_ENTRIES.map(([key, { color }]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
