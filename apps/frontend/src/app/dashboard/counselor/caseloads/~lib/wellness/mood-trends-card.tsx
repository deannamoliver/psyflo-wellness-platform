"use client";

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
import { MoodTrendsChart } from "./mood-trends-chart";
import {
  MOOD_DISPLAY_ORDER,
  TIME_RANGE_OPTIONS,
  type TimeRange,
} from "./mood-trends-config";
import type { StudentBreakdown, TimeSeriesRow } from "./mood-trends-data";
import { MoodTrendsStudents, type SortOption } from "./mood-trends-students";
import {
  aggregateIntoBuckets,
  getBucketGranularity,
  getDateCutoff,
} from "./mood-trends-utils";

export function MoodTrendsCard({
  timeSeriesData,
  studentBreakdowns,
}: {
  timeSeriesData: TimeSeriesRow[];
  studentBreakdowns: StudentBreakdown[];
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("most-checkins");

  const chartData = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    const bucket = getBucketGranularity(timeRange);
    const filtered = timeSeriesData.filter((p) => {
      if (new Date(p.period) < cutoff) return false;
      return true;
    });
    return aggregateIntoBuckets(filtered, bucket);
  }, [timeSeriesData, timeRange]);

  const displayStudents = useMemo(() => {
    let list = studentBreakdowns;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "most-checkins":
          return b.totalCheckIns - a.totalCheckIns;
        case "least-checkins":
          return a.totalCheckIns - b.totalCheckIns;
        case "name-a-z":
          return a.name.localeCompare(b.name);
        case "recent":
          return (
            new Date(b.lastCheckInAt).getTime() -
            new Date(a.lastCheckInAt).getTime()
          );
      }
    });
  }, [studentBreakdowns, search, sort]);

  return (
    <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
      <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Mood Trends
          </CardTitle>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p
              className="flex items-center gap-1.5 text-gray-500 text-sm"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Info className="h-4 w-4 shrink-0" aria-hidden />
              Check-in counts over time by mood
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
        <MoodTrendsChart data={chartData} />

        <div className="grid w-full grid-cols-7 gap-2 text-gray-600 text-xs">
          {MOOD_DISPLAY_ORDER.map((m) => (
            <div
              key={m.key}
              className="flex items-center justify-center gap-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              {m.label}
            </div>
          ))}
        </div>

        <Separator />

        <MoodTrendsStudents
          students={displayStudents}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
      </CardContent>
    </Card>
  );
}
