"use client";

/** Student skills table with per-student, per-subtype SEL scores. */

import { Search } from "lucide-react";
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
import {
  getPerformanceLevel,
  getPerformanceLevelColor,
  SEL_SUBTYPE_ORDER,
  SEL_SUBTYPE_SHORT_LABELS,
} from "./config";
import { TablePagination } from "./table-pagination";
import type { SkillsStudentTableRow } from "./types";

const ITEMS_PER_PAGE = 8;
type SortOption = "name-a-z" | "score-high" | "score-low";
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-a-z", label: "Name A-Z" },
  { value: "score-high", label: "Highest Overall" },
  { value: "score-low", label: "Lowest Overall" },
];

function ScoreCell({ score }: { score: number | undefined }) {
  if (score == null) return <span className="text-gray-300">-</span>;
  const color = getPerformanceLevelColor(getPerformanceLevel(score));
  return (
    <span className="font-semibold" style={{ color }}>
      {score.toFixed(1)}
    </span>
  );
}

export function SkillsTable({ rows }: { rows: SkillsStudentTableRow[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("score-high");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    let result = rows;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((r) => r.studentName.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name-a-z":
          return a.studentName.localeCompare(b.studentName);
        case "score-high":
          return b.overallScore - a.overallScore;
        case "score-low":
          return a.overallScore - b.overallScore;
        default:
          return 0;
      }
    });
    return result;
  }, [rows, search, sort]);

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
      <p className="text-blue-600 text-sm">
        Showing all {filteredRows.length} patients
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 text-gray-900 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-gray-300 sm:w-[400px]"
          />
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

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 border-b bg-gray-50/50">
              <TableHead className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Patient
              </TableHead>
              {SEL_SUBTYPE_ORDER.map((s) => (
                <TableHead
                  key={s}
                  className="px-2 text-center font-semibold text-[10px] text-gray-500 uppercase tracking-wider"
                >
                  {SEL_SUBTYPE_SHORT_LABELS[s]}
                </TableHead>
              ))}
              <TableHead className="px-4 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Overall Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32">
                  <div className="flex items-center justify-center">
                    <Muted>No patients found.</Muted>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow
                  key={row.studentId}
                  className="border-gray-100 border-b transition-colors hover:bg-gray-50"
                >
                  <TableCell className="px-4">
                    <div className="flex flex-col">
                      <span className="font-dm font-medium text-gray-900 text-sm">
                        {row.studentName}
                      </span>
                    </div>
                  </TableCell>
                  {SEL_SUBTYPE_ORDER.map((s) => (
                    <TableCell key={s} className="px-2 text-center text-sm">
                      <ScoreCell score={row.subtypeScores[s]} />
                    </TableCell>
                  ))}
                  <TableCell className="px-4 text-center">
                    <ScoreCell score={row.overallScore} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          cur={currentPage}
          total={totalPages}
          count={filteredRows.length}
          onPage={setPage}
        />
      )}
    </div>
  );
}
