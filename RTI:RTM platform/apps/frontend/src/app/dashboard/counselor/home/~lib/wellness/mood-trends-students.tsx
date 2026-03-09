"use client";

import { Search } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { StudentBreakdown } from "./mood-trends-data";
import { MoodTrendsStudentRow } from "./mood-trends-student-row";

export type SortOption =
  | "most-checkins"
  | "least-checkins"
  | "name-a-z"
  | "recent";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "most-checkins", label: "Most check-ins" },
  { value: "least-checkins", label: "Least check-ins" },
  { value: "name-a-z", label: "Name A-Z" },
  { value: "recent", label: "Most recent" },
];

export function MoodTrendsStudents({
  students,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: {
  students: StudentBreakdown[];
  search: string;
  onSearchChange: (v: string) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-gray-500 text-sm">
        Showing all {students.length} patient{students.length !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white pl-9 text-gray-900 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-gray-300"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <SelectTrigger className="w-[180px] border-gray-200 bg-white font-medium text-gray-700 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="divide-y divide-gray-100">
        {students.map((student) => (
          <MoodTrendsStudentRow key={student.id} student={student} />
        ))}
        {students.length === 0 && (
          <p className="py-8 text-center text-gray-500 text-sm">
            No patients match your filters
          </p>
        )}
      </div>
    </div>
  );
}
