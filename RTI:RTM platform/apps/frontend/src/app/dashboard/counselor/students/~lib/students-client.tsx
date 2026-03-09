"use client";

import { ChevronDownIcon, SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { getInitials } from "@/lib/string-utils";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import { cn } from "@/lib/tailwind-utils";
import type { StudentRow } from "./data";

const PAGE_SIZE = 10;

const INDICATOR_BADGE_STYLES: Record<string, string> = {
  anxiety: "bg-blue-100 text-blue-800",
  depression: "bg-purple-100 text-purple-800",
};

function formatLastCheckIn(dateStr: string | null): string {
  if (!dateStr) return "No check-ins";
  const checkIn = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDay = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.round(
    (checkInDay.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  return checkIn.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function StudentsClient({ students }: { students: StudentRow[] }) {
  const [search, setSearch] = useState("");
  const [safetyFilter, setSafetyFilter] = useState("all");
  const [mentalHealthFilter, setMentalHealthFilter] = useState("all");
  const [sort, setSort] = useState("name_asc");
  const [page, setPage] = useState(0);

  const hasFilters =
    search !== "" ||
    safetyFilter !== "all" ||
    mentalHealthFilter !== "all" ||
    sort !== "name_asc";

  const filtered = useMemo(() => {
    let result = students;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (safetyFilter === "none") {
      result = result.filter((s) => s.safetyRisk === null);
    } else if (safetyFilter === "has_alert") {
      result = result.filter((s) => s.safetyRisk !== null);
    } else if (safetyFilter !== "all") {
      result = result.filter((s) => s.safetyRisk === safetyFilter);
    }
    if (mentalHealthFilter === "none") {
      result = result.filter((s) => s.mentalHealth.length === 0);
    } else if (mentalHealthFilter !== "all") {
      result = result.filter((s) =>
        s.mentalHealth.some((m) => m.category === mentalHealthFilter),
      );
    }
    const sorted = [...result];
    if (sort === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name_desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "most_recent") {
      sorted.sort((a, b) => {
        const aDate = a.lastCheckIn ? new Date(a.lastCheckIn).getTime() : 0;
        const bDate = b.lastCheckIn ? new Date(b.lastCheckIn).getTime() : 0;
        return bDate - aDate;
      });
    } else if (sort === "least_recent") {
      sorted.sort((a, b) => {
        const aDate = a.lastCheckIn ? new Date(a.lastCheckIn).getTime() : 0;
        const bDate = b.lastCheckIn ? new Date(b.lastCheckIn).getTime() : 0;
        return aDate - bDate;
      });
    }
    return sorted;
  }, [students, search, safetyFilter, mentalHealthFilter, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearAll = () => {
    setSearch("");
    setSafetyFilter("all");
    setMentalHealthFilter("all");
    setSort("name_asc");
    setPage(0);
  };

  return (
    <div style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Filters & Search — same layout as Safety page */}
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
            <Input
              placeholder="Search by patient name..."
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-10 border-gray-200 bg-white pl-10 font-dm"
            />
          </div>
          <FilterDropdown
            label="Alert Status"
            value={safetyFilter}
            options={[
              { value: "all", label: "All Alert Levels" },
              { value: "has_alert", label: "Has Safety Alert" },
              { value: "emergency", label: "Emergency" },
              { value: "high", label: "High" },
              { value: "moderate", label: "Moderate" },
              { value: "low", label: "Low" },
              { value: "none", label: "No Alerts" },
            ]}
            onChange={(v) => {
              setSafetyFilter(v);
              setPage(0);
            }}
          />
          <FilterDropdown
            label="Mental Health"
            value={mentalHealthFilter}
            options={[
              { value: "all", label: "All Indicators" },
              { value: "anxiety", label: "Has Anxiety Indicator" },
              { value: "depression", label: "Has Depression Indicator" },
              { value: "none", label: "No Indicators" },
            ]}
            onChange={(v) => {
              setMentalHealthFilter(v);
              setPage(0);
            }}
          />
          <FilterDropdown
            label="Sort"
            value={sort}
            options={[
              { value: "name_asc", label: "Sort by: Name (A-Z)" },
              { value: "name_desc", label: "Sort by: Name (Z-A)" },
              { value: "most_recent", label: "Sort by: Most Recent Check-in" },
              { value: "least_recent", label: "Sort by: Oldest Check-in" },
            ]}
            onChange={(v) => {
              setSort(v);
              setPage(0);
            }}
          />
          <button
            type="button"
            onClick={clearAll}
            disabled={!hasFilters}
            className={cn(
              "font-medium text-sm",
              hasFilters
                ? "text-blue-600 hover:text-blue-800"
                : "cursor-not-allowed text-gray-400",
            )}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-gray-200 border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Patient
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                Alert Status
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                Clinical Indicators
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                Last Engagement
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            ) : (
              pageData.map((s) => <StudentTableRow key={s.id} student={s} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <span className="text-gray-500 text-sm">
            Showing {page * PAGE_SIZE + 1} to{" "}
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              Previous
            </Button>
            {(() => {
              const maxVisible = 7;
              if (totalPages <= maxVisible) {
                return Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i)}
                    className={
                      page === i
                        ? "min-w-9 border-gray-300 bg-gray-700 text-white hover:bg-gray-800"
                        : "min-w-9 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    }
                  >
                    {i + 1}
                  </Button>
                ));
              }
              const showLeft = page <= 2;
              const showRight = page >= totalPages - 3;
              const start = showLeft
                ? 0
                : showRight
                  ? totalPages - 5
                  : page - 2;
              const end = showLeft ? 5 : showRight ? totalPages : page + 3;
              const indices: (number | "ellipsis")[] = [];
              if (start > 0) {
                indices.push(0);
                indices.push("ellipsis");
              }
              for (let i = start; i < end && i < totalPages; i++)
                indices.push(i);
              if (end < totalPages) {
                indices.push("ellipsis");
                indices.push(totalPages - 1);
              }
              return indices.map((v, idx) =>
                v === "ellipsis" ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-400">
                    …
                  </span>
                ) : (
                  <Button
                    key={v}
                    variant={page === v ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(v)}
                    className={
                      page === v
                        ? "min-w-9 border-gray-300 bg-gray-700 text-white hover:bg-gray-800"
                        : "min-w-9 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    }
                  >
                    {v + 1}
                  </Button>
                ),
              );
            })()}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          {selectedLabel}
          <ChevronDownIcon className="size-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:[--item-text:rgb(17,24,39)] [&_[data-slot=dropdown-menu-radio-item]]:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary [&_[data-slot=dropdown-menu-radio-item]]:hover:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:focus:[color:var(--item-text)]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StudentTableRow({ student }: { student: StudentRow }) {
  return (
    <tr className="border-gray-100 border-b transition-colors hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-green-500 font-semibold text-white text-xs">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{student.name}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {student.safetyRisk ? (
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 font-bold text-xs",
              RISK_BADGE_CONFIG[student.safetyRisk].bg,
              RISK_BADGE_CONFIG[student.safetyRisk].text,
            )}
          >
            {RISK_BADGE_CONFIG[student.safetyRisk].label}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1.5">
          {student.mentalHealth.map((indicator) => (
            <span
              key={indicator.category}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium text-xs ${
                INDICATOR_BADGE_STYLES[indicator.category] ??
                "bg-gray-100 text-gray-800"
              }`}
            >
              {indicator.category === "anxiety" ? "Anxiety" : "Depression"}
              <span className="opacity-60">·</span>
              <span>{indicator.severity}</span>
            </span>
          ))}
          {student.mentalHealth.length === 0 && (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center text-gray-600">
        {formatLastCheckIn(student.lastCheckIn)}
      </td>
      <td className="px-4 py-3 text-center">
        <Link
          href={`/dashboard/counselor/students/${student.id}`}
          className="inline-flex items-center justify-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800"
        >
          View
          <UserIcon className="size-4" />
        </Link>
      </td>
    </tr>
  );
}
