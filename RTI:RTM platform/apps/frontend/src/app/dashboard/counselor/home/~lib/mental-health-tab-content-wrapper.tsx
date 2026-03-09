"use client";

import { useState } from "react";
import type { RiskLevel } from "@/lib/screener/type";
import { getRiskLevelTitle } from "@/lib/screener/utils";
import { cn } from "@/lib/tailwind-utils";
import type { MentalHealthData } from "./mental-health-overview";
import { MentalHealthDonutChart } from "./mental-health-overview-chart";
import StudentList from "./student-list";

export default function MentalHealthTabContentWrapper({
  data,
}: {
  data: MentalHealthData;
}) {
  const { scoreCounts, students, screenerType } = data;

  const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel | null>(
    null,
  );

  // Sort severity levels from highest to lowest (Severe first)
  const sortedScoreCounts = [...scoreCounts].sort((a, b) => b.level - a.level);

  const filteredStudents =
    selectedSeverity === null
      ? students
      : students.filter((s) => {
          const title = getRiskLevelTitle({
            type: screenerType,
            riskLevel: selectedSeverity,
          });
          return s.severityLabel === title;
        });

  return (
    <div className="grid h-[480px] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 overflow-hidden rounded bg-white p-6">
        <div className="mb-10 flex flex-wrap gap-2">
          {sortedScoreCounts.map((item) => {
            const isActive = selectedSeverity === item.level;
            const hasData = item.count > 0;
            return (
              <button
                key={item.level}
                type="button"
                disabled={!hasData}
                onClick={() =>
                  setSelectedSeverity(isActive ? null : item.level)
                }
                className={cn(
                  "rounded-[8px] border border-gray-200 px-4 py-2 font-dm font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-white text-gray-700",
                  hasData && !isActive && "hover:bg-gray-50",
                  !hasData && "cursor-not-allowed opacity-40",
                )}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <MentalHealthDonutChart
            data={scoreCounts}
            selectedLevel={selectedSeverity}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden bg-white">
        <StudentList
          students={filteredStudents}
          title={`Student List (${filteredStudents.length})`}
          showSeverity
          showRelativeTime
        />
      </div>
    </div>
  );
}
