"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  Search,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { Muted } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";
import type { AssessmentTableRow } from "./data";

const TABLE_HEADERS = [
  "Patient",
  "Assessment Type",
  "Score",
  "Severity",
  "Change",
  "Date",
  "Actions",
];

const ITEMS_PER_PAGE = 8;

type SortOption = "newest" | "oldest" | "name-a-z" | "score-high" | "score-low";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-a-z", label: "Name A-Z" },
  { value: "score-high", label: "Highest Score" },
  { value: "score-low", label: "Lowest Score" },
];

function SeverityBadge({ level }: { level: string }) {
  let badgeClass: string;
  switch (level) {
    case "Minimal":
      badgeClass = "bg-green-100 text-green-700";
      break;
    case "Mild":
      badgeClass = "bg-yellow-100 text-yellow-700";
      break;
    case "Moderate":
      badgeClass = "bg-orange-100 text-orange-700";
      break;
    case "Moderately Severe":
      badgeClass = "bg-red-100 text-red-700";
      break;
    case "Severe":
      badgeClass = "bg-red-100 text-red-700";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-700";
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 font-semibold text-xs",
        badgeClass,
      )}
    >
      {level}
    </span>
  );
}

function ChangeCell({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="flex items-center gap-1 text-gray-400 text-sm">
        <MinusIcon className="h-3 w-3" /> 0
      </span>
    );
  }

  if (change === 0) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  if (change > 0) {
    return (
      <span className="flex items-center gap-1 font-medium text-red-600 text-sm">
        <ArrowUpIcon className="h-3 w-3" /> +{change}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 font-medium text-green-600 text-sm">
      <ArrowDownIcon className="h-3 w-3" /> {change}
    </span>
  );
}

export function AssessmentsTable({ rows }: { rows: AssessmentTableRow[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    let result = rows;

    // Filter by search
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.assessmentLabel.toLowerCase().includes(q) ||
          r.studentCode?.toLowerCase().includes(q),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.completedAt.getTime() - a.completedAt.getTime();
        case "oldest":
          return a.completedAt.getTime() - b.completedAt.getTime();
        case "name-a-z":
          return a.studentName.localeCompare(b.studentName);
        case "score-high":
          return b.score - a.score;
        case "score-low":
          return a.score - b.score;
      }
    });

    return result;
  }, [rows, search, sort]);

  // Reset page when filters change
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / ITEMS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-3">
      {/* Showing count */}
      <p className="text-blue-600 text-sm">
        Showing all {filteredRows.length} patients
      </p>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 font-medium text-gray-700 text-sm">Search</p>
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Name, ID, or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 text-gray-900 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-gray-300 sm:w-[400px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Sort by:</span>
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v as SortOption);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] border-gray-200 bg-white font-medium text-gray-700 text-sm">
              <SelectValue />
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 border-b bg-gray-50/50">
              {TABLE_HEADERS.map((h) => (
                <TableHead
                  key={h}
                  className={cn(
                    "px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider",
                    h === "Actions" && "text-center",
                  )}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32">
                  <div className="flex items-center justify-center">
                    <Muted>No assessments found.</Muted>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow
                  key={row.screenerId}
                  className="border-gray-100 border-b transition-colors hover:bg-gray-50"
                >
                  {/* Patient */}
                  <TableCell className="px-4">
                    <div className="flex flex-col">
                      <span className="font-dm font-medium text-gray-900 text-sm">
                        {row.studentName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Assessment Type */}
                  <TableCell className="px-4">
                    <span className="text-gray-900 text-sm">
                      {row.assessmentLabel}
                    </span>
                  </TableCell>

                  {/* Score */}
                  <TableCell className="px-4">
                    <span className="font-semibold text-gray-900 text-sm">
                      {Math.round(row.score)}/{row.maxScore}
                    </span>
                  </TableCell>

                  {/* Severity */}
                  <TableCell className="px-4">
                    <SeverityBadge level={row.severityLabel} />
                  </TableCell>

                  {/* Change */}
                  <TableCell className="px-4">
                    <ChangeCell change={row.change} />
                  </TableCell>

                  {/* Date */}
                  <TableCell className="px-4">
                    <span className="text-gray-600 text-sm">
                      {formatDistanceToNow(row.completedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 text-center">
                    <Link
                      href={`/dashboard/counselor/students/${row.studentId}/assessments`}
                      className="inline-flex items-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800"
                    >
                      View
                      <UserIcon className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-gray-500 text-xs">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} of{" "}
            {filteredRows.length} assessments
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md font-medium text-xs transition-colors",
                    pageNum === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
