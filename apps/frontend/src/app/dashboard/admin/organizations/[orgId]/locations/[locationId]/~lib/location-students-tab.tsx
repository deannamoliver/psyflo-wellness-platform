"use client";

import { ChevronLeft, ChevronRight, Filter, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import type { LocationDetail, StudentRecord } from "./location-detail-data";
import { StudentsTable } from "./location-students-table";

const PER_PAGE = 8;

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const selected = options.find((o) => o.value === value)?.label ?? label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          {selected}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "bg-white font-dm",
          "[&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9",
          "[&_[data-slot=dropdown-menu-radio-item]]:text-gray-900 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary",
        )}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LocationStudentsTab({
  location,
}: {
  location: LocationDetail;
}) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result: StudentRecord[] = location.patients;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }
    if (gradeFilter !== "all") {
      result = result.filter((s) => s.grade === Number(gradeFilter));
    }
    if (statusFilter === "alert") {
      result = result.filter((s) => s.alertStatus);
    }
    return result;
  }, [location.patients, search, gradeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const start = filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const end = Math.min(page * PER_PAGE, filtered.length);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Patients</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Manage and view all patients at this location
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-lg flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients by name, ID, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 border-gray-200 bg-white pl-10 font-dm"
          />
        </div>
        <FilterDropdown
          label="All Grades"
          value={gradeFilter}
          options={[
            { value: "all", label: "All Grades" },
            ...Array.from({ length: 13 }, (_, i) => ({
              value: String(i),
              label: i === 0 ? "Kindergarten" : `Grade ${i}`,
            })),
          ]}
          onChange={(v) => {
            setGradeFilter(v);
            setPage(1);
          }}
        />
        <FilterDropdown
          label="All Statuses"
          value={statusFilter}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "alert", label: "Safety Alert" },
          ]}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
        <Button
          variant="outline"
          className="h-10 w-10 border-gray-200 bg-white p-0 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <StudentsTable rows={paged} />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-gray-500 text-sm">
          Showing{" "}
          <span className="font-semibold">
            {start}-{end}
          </span>{" "}
          of {filtered.length} patients
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn(
              "flex h-9 items-center justify-center rounded-md border border-gray-200 px-2",
              page === 1
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-700 hover:bg-gray-50",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(
            (n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md font-medium text-sm",
                  page === n
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                {n}
              </button>
            ),
          )}
          {totalPages > 3 && (
            <>
              <span className="px-2 text-gray-400 text-sm">...</span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md font-medium text-sm",
                  page === totalPages
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={cn(
              "flex h-9 items-center justify-center rounded-md border border-gray-200 px-2",
              page === totalPages
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-700 hover:bg-gray-50",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
