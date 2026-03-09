"use client";

/**
 * Skill Development Progress Timeline card.
 *
 * Combines a line chart showing SEL subtype averages over time with a
 * student breakdown table, matching the assessment trends card style.
 */

import { format } from "date-fns";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Separator } from "@/lib/core-ui/separator";
import { SEL_SUBTYPE_ORDER } from "./config";
import type { SkillsStudentTableRow, SkillsTimeSeriesRow } from "./data";
import {
  ProgressChart,
  ProgressLegend,
  type SkillsChartDataPoint,
} from "./progress-chart";
import { SkillsTable } from "./skills-table";

type TimeRange = "30d" | "90d" | "6m" | "1y";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
];

type BucketGranularity = "day" | "week" | "month";

function getBucketGranularity(tr: TimeRange): BucketGranularity {
  if (tr === "30d") return "day";
  if (tr === "90d") return "week";
  return "month";
}

function getDateCutoff(tr: TimeRange): Date {
  const now = new Date();
  const ms = { "30d": 30, "90d": 90, "6m": 180, "1y": 365 }[tr];
  return new Date(now.getTime() - ms * 24 * 60 * 60 * 1000);
}

function toBucketKey(dateStr: string, bucket: BucketGranularity): string {
  const d = new Date(dateStr);
  if (bucket === "day") return format(d, "yyyy-MM-dd");
  if (bucket === "week") {
    const dow = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dow + 6) % 7));
    return format(monday, "yyyy-MM-dd");
  }
  return format(d, "yyyy-MM");
}

function formatBucketLabel(key: string, bucket: BucketGranularity): string {
  const d = new Date(key);
  if (bucket === "month") return format(d, "MMM yyyy");
  return format(d, "MMM d");
}

function aggregateBuckets(
  points: SkillsTimeSeriesRow[],
  bucket: BucketGranularity,
): SkillsChartDataPoint[] {
  const map = new Map<
    string,
    Record<string, { total: number; count: number }>
  >();

  for (const p of points) {
    const key = toBucketKey(p.period, bucket);
    if (!map.has(key)) map.set(key, {});
    const types = map.get(key) ?? {};
    if (!types[p.subtype]) types[p.subtype] = { total: 0, count: 0 };
    const agg = types[p.subtype];
    if (agg) {
      agg.total += p.avgScore * p.count;
      agg.count += p.count;
    }
    map.set(key, types);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, types]) => {
      const point: SkillsChartDataPoint = {
        bucket: key,
        label: formatBucketLabel(key, bucket),
      };
      for (const st of SEL_SUBTYPE_ORDER) {
        const agg = types[st];
        if (agg && agg.count > 0) {
          point[st] = Math.round((agg.total / agg.count) * 10) / 10;
        }
      }
      return point;
    });
}

export function ProgressCard({
  timeSeriesData,
  tableData,
}: {
  timeSeriesData: SkillsTimeSeriesRow[];
  tableData: SkillsStudentTableRow[];
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const chartData = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    const bucket = getBucketGranularity(timeRange);
    const filtered = timeSeriesData.filter((p) => {
      if (new Date(p.period) < cutoff) return false;
      return true;
    });
    return aggregateBuckets(filtered, bucket);
  }, [timeSeriesData, timeRange]);

  return (
    <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
      <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Skill Development Progress Timeline
          </CardTitle>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p
              className="flex items-center gap-1.5 text-gray-500 text-sm"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Info className="h-4 w-4 shrink-0" aria-hidden />
              Average SEL domain scores over time
            </p>
            <div className="flex items-center gap-3">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 bg-white px-6 pt-0 pb-6">
        <ProgressChart data={chartData} />
        <ProgressLegend />
        <Separator />
        <SkillsTable rows={tableData} />
      </CardContent>
    </Card>
  );
}
