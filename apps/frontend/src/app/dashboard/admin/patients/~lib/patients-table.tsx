"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import type { SortColumn, SortState, Patient } from "./patients-data";

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Active: { bg: "bg-green-100", text: "text-green-700" },
  Inactive: { bg: "bg-gray-100", text: "text-gray-700" },
  "Invite Sent": { bg: "bg-yellow-100", text: "text-yellow-700" },
  Archived: { bg: "bg-gray-100", text: "text-gray-700" },
  Blocked: { bg: "bg-red-100", text: "text-red-700" },
};

type Props = {
  rows: Patient[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  sort: SortState;
  onSort: (column: SortColumn) => void;
};

function SortableHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sort?.column === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="flex items-center gap-1 uppercase"
    >
      {label}
      {isActive ? (
        sort.direction === "asc" ? (
          <ArrowUp className="size-3 text-gray-900" />
        ) : (
          <ArrowDown className="size-3 text-gray-900" />
        )
      ) : (
        <ArrowUpDown className="size-3 text-gray-400" />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_BADGE_COLORS[status] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 font-semibold text-xs",
        colors.bg,
        colors.text,
      )}
    >
      {status}
    </span>
  );
}

export function PatientsTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  sort,
  onSort,
}: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm">
        No patients found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="size-4 rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Name"
                column="name"
                sort={sort}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Organization"
                column="organization"
                sort={sort}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Status"
                column="status"
                sort={sort}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <div className="flex justify-center">
                <SortableHeader
                  label="Created Date"
                  column="addedAt"
                  sort={sort}
                  onSort={onSort}
                />
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((patient) => (
            <TableRow
              key={patient.id}
              className={cn(
                "border-gray-100 border-b transition-colors",
                patient.status === "Blocked"
                  ? "bg-red-50/60 hover:bg-red-50"
                  : "hover:bg-gray-50",
              )}
            >
              <TableCell className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(patient.id)}
                  onChange={() => onToggleSelect(patient.id)}
                  className="size-4 rounded border-gray-300"
                />
              </TableCell>
              <TableCell className="px-4 py-4 font-semibold text-gray-900">
                {patient.name || "-"}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700">
                {patient.organization || "-"}
              </TableCell>
              <TableCell className="px-4 py-4">
                <StatusBadge status={patient.status} />
              </TableCell>
              <TableCell className="px-4 py-4 text-center text-gray-600">
                {patient.addedAt || "-"}
              </TableCell>
              <TableCell className="px-4 py-4 text-center">
                <Link
                  href={`/dashboard/admin/patients/${patient.id}`}
                  className="font-medium text-blue-600 text-sm hover:text-blue-800"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
