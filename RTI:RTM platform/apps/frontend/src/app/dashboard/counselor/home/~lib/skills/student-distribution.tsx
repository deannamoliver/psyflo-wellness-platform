"use client";

/**
 * Student Distribution by Performance Level.
 *
 * Shows a horizontal bar chart, donut chart, and scrollable student list,
 * matching the layout used in the Mental Health tab.
 */

import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { chartConfig } from "@/lib/analytics/chart-config";
import { ChartContainer } from "@/lib/core-ui/chart";
import { cn } from "@/lib/tailwind-utils";
import StudentList from "../student-list";
import type { Student } from "../type";
import type { PerformanceLevel } from "./config";
import {
  getPerformanceLevel,
  getPerformanceLevelColor,
  getPerformanceLevelLabel,
} from "./config";
import type { SkillsStudent } from "./data";

type LevelGroup = {
  level: PerformanceLevel;
  label: string;
  range: string;
  count: number;
  color: string;
};

function buildGroups(students: SkillsStudent[]): LevelGroup[] {
  const counts: Record<PerformanceLevel, number> = {
    strong: 0,
    developing: 0,
    needs_support: 0,
  };
  for (const s of students) {
    counts[getPerformanceLevel(s.avgScore)]++;
  }
  return [
    {
      level: "strong",
      label: "Strong (3.0-4.0)",
      range: "3.0-4.0",
      count: counts.strong,
      color: getPerformanceLevelColor("strong"),
    },
    {
      level: "developing",
      label: "Developing (2.0-2.9)",
      range: "2.0-2.9",
      count: counts.developing,
      color: getPerformanceLevelColor("developing"),
    },
    {
      level: "needs_support",
      label: "Needs Support (<2.0)",
      range: "<2.0",
      count: counts.needs_support,
      color: getPerformanceLevelColor("needs_support"),
    },
  ];
}

function HorizontalBars({
  groups,
  total,
  selectedLevel,
  onSelect,
}: {
  groups: LevelGroup[];
  total: number;
  selectedLevel: PerformanceLevel | null;
  onSelect: (level: PerformanceLevel | null) => void;
}) {
  const maxCount = Math.max(...groups.map((g) => g.count), 1);

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const isActive = selectedLevel === g.level;
        const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
        return (
          <button
            key={g.level}
            type="button"
            onClick={() => onSelect(isActive ? null : g.level)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
              isActive ? "bg-gray-100" : "hover:bg-gray-50",
            )}
          >
            <span className="w-[170px] shrink-0 font-medium text-gray-600 text-xs">
              {g.label}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-gray-100">
              <div
                className="absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${(g.count / maxCount) * 100}%`,
                  backgroundColor: g.color,
                }}
              />
            </div>
            <span className="w-[120px] shrink-0 text-right font-semibold text-blue-600 text-xs">
              {g.count} student{g.count !== 1 ? "s" : ""} ({pct}%)
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DonutChart({
  groups,
  selectedLevel,
}: {
  groups: LevelGroup[];
  selectedLevel: PerformanceLevel | null;
}) {
  const chartData = groups.map((g) => ({
    name: g.label,
    value: g.count,
    fill:
      selectedLevel !== null && g.level !== selectedLevel ? "#e5e7eb" : g.color,
  }));

  const nonZeroSegments = chartData.filter((d) => d.value > 0).length;
  const size = 200;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - 36;

  return (
    <div className="flex flex-1 items-center justify-center">
      <ChartContainer
        config={chartConfig}
        style={{ width: size, height: size }}
      >
        <PieChart width={size} height={size}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={nonZeroSegments > 1 ? 2 : 0}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

function toStudentListItems(
  students: SkillsStudent[],
  level: PerformanceLevel | null,
): Student[] {
  const filtered = level
    ? students.filter((s) => getPerformanceLevel(s.avgScore) === level)
    : students;

  return filtered
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      avatar: null,
      actionAt: s.completedAt,
      severityLabel: getPerformanceLevelLabel(getPerformanceLevel(s.avgScore)),
    }));
}

export function StudentDistribution({
  students,
}: {
  students: SkillsStudent[];
}) {
  const [selectedLevel, setSelectedLevel] = useState<PerformanceLevel | null>(
    null,
  );
  const groups = buildGroups(students);
  const total = students.length;
  const listStudents = toStudentListItems(students, selectedLevel);

  return (
    <div className="grid h-[480px] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-4 overflow-hidden rounded bg-white p-6">
        <HorizontalBars
          groups={groups}
          total={total}
          selectedLevel={selectedLevel}
          onSelect={setSelectedLevel}
        />
        <DonutChart groups={groups} selectedLevel={selectedLevel} />
      </div>
      <div className="flex min-h-0 flex-col overflow-hidden bg-white">
        <StudentList
          students={listStudents}
          title={`Patient List (${listStudents.length})`}
          showSeverity
          showRelativeTime
        />
      </div>
    </div>
  );
}
