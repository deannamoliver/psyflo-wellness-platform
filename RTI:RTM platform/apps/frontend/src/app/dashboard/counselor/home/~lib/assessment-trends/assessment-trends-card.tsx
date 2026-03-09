"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Separator } from "@/lib/core-ui/separator";
import { AssessmentsTable } from "./assessments-table";
import { ASSESSMENT_SERIES_CONFIG } from "./config";
import type { AssessmentTableRow, AssessmentTimeSeriesRow } from "./data";
import { AssessmentTrendsChart } from "./trends-chart";

type TimeRange = "30d" | "90d" | "6m" | "1y";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
];

const LEGEND_ITEMS = Object.entries(ASSESSMENT_SERIES_CONFIG).map(
  ([key, { label, color }]) => ({
    key,
    label,
    color,
  }),
);

export function AssessmentTrendsCard({
  timeSeriesData,
  tableData,
  grades,
}: {
  timeSeriesData: AssessmentTimeSeriesRow[];
  tableData: AssessmentTableRow[];
  grades: number[];
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [grade, setGrade] = useState<string>("all");

  return (
    <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
      <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Mental Health Assessment Score Trends
          </CardTitle>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p
              className="flex items-center gap-1.5 text-gray-500 text-sm"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Info className="h-4 w-4 shrink-0" aria-hidden />
              Average assessment scores as percentage over time
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
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-[140px] border-gray-200 bg-white font-medium text-gray-700 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All grades</SelectItem>
                  {grades.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 bg-white px-6 pt-0 pb-6">
        <AssessmentTrendsChart
          data={timeSeriesData}
          timeRange={timeRange}
          grade={grade}
        />

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-xs">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>

        <Separator />

        <AssessmentsTable rows={tableData} />
      </CardContent>
    </Card>
  );
}
