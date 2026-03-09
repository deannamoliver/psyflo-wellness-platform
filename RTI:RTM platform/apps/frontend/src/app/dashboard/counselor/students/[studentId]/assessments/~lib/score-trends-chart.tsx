"use client";

import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card } from "@/lib/core-ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/lib/core-ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { TrendSeries } from "./score-trends-data";

type TimeRange = "30d" | "90d" | "6m" | "1y" | "all";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
];

type MergedPoint = {
  date: string;
  dateLabel: string;
  [key: string]: number | string | undefined;
};

function rawKey(type: string) {
  return `${type}_raw`;
}
function maxKey(type: string) {
  return `${type}_max`;
}

function getDateCutoff(timeRange: TimeRange): Date | null {
  if (timeRange === "all") return null;
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

function filterSeries(
  series: TrendSeries[],
  cutoff: Date | null,
): TrendSeries[] {
  if (!cutoff) return series;
  return series
    .map((s) => ({
      ...s,
      points: s.points.filter((pt) => new Date(pt.date) >= cutoff),
    }))
    .filter((s) => s.points.length > 0);
}

function buildChartConfig(series: TrendSeries[]): ChartConfig {
  const config: ChartConfig = {};
  for (const s of series) {
    config[s.type] = { label: s.label, color: s.color };
  }
  return config;
}

function mergeSeriesData(series: TrendSeries[]): MergedPoint[] {
  const dateMap = new Map<string, MergedPoint>();

  for (const s of series) {
    const baseline = s.points.length > 0 ? s.points[0]!.score : 0;
    let prevScore: number | null = null;

    for (const pt of s.points) {
      const dateKey = pt.date.slice(0, 10);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          dateLabel: format(new Date(pt.date), "MMM d, yyyy"),
        });
      }
      const merged = dateMap.get(dateKey)!;
      merged[s.type] = pt.pct;
      merged[rawKey(s.type)] = pt.score;
      merged[maxKey(s.type)] = pt.maxScore;
      merged[baselineKey(s.type)] = baseline;
      if (prevScore !== null) {
        merged[prevKey(s.type)] = prevScore;
      }
      prevScore = pt.score;
    }
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function getSeverityForScore(type: string, score: number): string {
  if (type === "sel") {
    if (score >= 3) return "Strong";
    if (score >= 2) return "Moderate";
    return "Needs Support";
  }
  if (type === "phq_a" || type === "phq_9") {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Moderately Severe";
    return "Severe";
  }
  if (type === "gad_7") {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    return "Severe";
  }
  if (type === "gad_child") {
    if (score <= 4) return "None";
    if (score <= 14) return "Minimal";
    if (score <= 24) return "Mild";
    if (score <= 34) return "Moderate";
    return "Severe";
  }
  return "";
}

function baselineKey(type: string) {
  return `${type}_baseline`;
}
function prevKey(type: string) {
  return `${type}_prev`;
}

function CustomTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: MergedPoint;
  }>;
  label?: string;
  series: TrendSeries[];
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const dateLabel = point?.dateLabel || label || "";

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-xl min-w-[240px]">
      <p className="mb-2 font-semibold text-gray-900 text-sm">{dateLabel}</p>
      <div className="space-y-3">
        {payload.map((entry) => {
          const s = series.find((s) => s.type === entry.dataKey);
          const raw = point?.[rawKey(entry.dataKey)] as number | undefined;
          const max = point?.[maxKey(entry.dataKey)] as number | undefined;
          const baseline = point?.[baselineKey(entry.dataKey)] as number | undefined;
          const prev = point?.[prevKey(entry.dataKey)] as number | undefined;

          const severity = raw !== undefined ? getSeverityForScore(entry.dataKey, raw) : "";
          const isSEL = entry.dataKey === "sel";

          const changeSinceLast = raw !== undefined && prev !== undefined ? raw - prev : null;
          const changeSinceBaseline = raw !== undefined && baseline !== undefined ? raw - baseline : null;

          return (
            <div key={entry.dataKey}>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-semibold text-sm text-gray-900">{s?.label ?? entry.dataKey}</span>
              </div>
              {raw !== undefined && max !== undefined && (
                <p className="ml-[18px] text-xs text-gray-600">
                  {severity} ({isSEL ? raw.toFixed(1) : Math.round(raw)} out of {max})
                </p>
              )}
              {(changeSinceLast !== null || changeSinceBaseline !== null) && (
                <div className="ml-[18px] mt-0.5 flex flex-wrap items-center gap-1 text-[11px]">
                  {changeSinceLast !== null && changeSinceLast !== 0 && (
                    <span className={isSEL
                      ? (changeSinceLast > 0 ? "text-emerald-600" : "text-red-500")
                      : (changeSinceLast <= 0 ? "text-emerald-600" : "text-red-500")
                    }>
                      {changeSinceLast > 0 ? "↑" : "↓"} {Math.abs(isSEL ? Math.round(changeSinceLast * 10) / 10 : Math.round(changeSinceLast))} pts since last
                    </span>
                  )}
                  {changeSinceLast !== null && changeSinceLast === 0 && (
                    <span className="text-gray-500">· since last</span>
                  )}
                  {changeSinceLast !== null && changeSinceBaseline !== null && (
                    <span className="text-gray-300">|</span>
                  )}
                  {changeSinceBaseline !== null && (
                    <span className={isSEL
                      ? (changeSinceBaseline > 0 ? "text-emerald-600" : changeSinceBaseline < 0 ? "text-red-500" : "text-gray-500")
                      : (changeSinceBaseline <= 0 ? "text-emerald-600" : "text-red-500")
                    }>
                      {changeSinceBaseline > 0 ? "↑" : changeSinceBaseline < 0 ? "↓" : "·"} {Math.abs(isSEL ? Math.round(changeSinceBaseline * 10) / 10 : Math.round(changeSinceBaseline))} pts since baseline
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScoreTrendsChart({ series }: { series: TrendSeries[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("90d");
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(() => new Set(series.map((s) => s.type)));

  const cutoff = getDateCutoff(timeRange);
  const allFiltered = useMemo(() => filterSeries(series, cutoff), [series, cutoff]);
  const filtered = useMemo(() => allFiltered.filter((s) => enabledTypes.has(s.type)), [allFiltered, enabledTypes]);
  const data = useMemo(() => mergeSeriesData(filtered), [filtered]);
  const config = buildChartConfig(filtered.length > 0 ? filtered : series);

  const toggleType = (type: string) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <Card className="bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-base text-gray-900">
          Progress
        </h3>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <SelectTrigger className="w-[160px] border-gray-200 bg-white font-medium text-gray-700 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-gray-400">
          <ClipboardList className="h-10 w-10" />
          <p className="text-sm">No assessment data for this time range</p>
        </div>
      ) : (
        <>
          <ChartContainer config={config} className="aspect-[2.5/1] w-full">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                width={35}
                tickFormatter={(v) => v === 0 ? "Low" : v === 100 ? "High" : ""}
              />

              <ChartTooltip content={<CustomTooltip series={filtered} />} />

              {filtered.map((s) => (
                <Line
                  key={s.type}
                  type="monotone"
                  dataKey={s.type}
                  name={s.type}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: s.color,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartContainer>

          {/* Blueprint Health-style checkbox toggles */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {allFiltered.map((s) => (
              <label
                key={s.type}
                className="flex cursor-pointer items-center gap-2 select-none"
              >
                <div
                  className="flex h-4 w-4 items-center justify-center rounded border-2 transition-colors"
                  style={{
                    borderColor: s.color,
                    backgroundColor: enabledTypes.has(s.type) ? s.color : "transparent",
                  }}
                  onClick={() => toggleType(s.type)}
                  onKeyDown={(e) => e.key === "Enter" && toggleType(s.type)}
                  role="checkbox"
                  aria-checked={enabledTypes.has(s.type)}
                  tabIndex={0}
                >
                  {enabledTypes.has(s.type) && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">{s.label.split(" (")[0]}</span>
                <span className="text-[10px] text-gray-400">{s.label.match(/\(([^)]+)\)/)?.[1] ?? ""}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
