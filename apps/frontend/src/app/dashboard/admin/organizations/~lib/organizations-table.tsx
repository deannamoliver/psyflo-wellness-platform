"use client";

import { ArrowUpDown } from "lucide-react";
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
import {
  type Organization,
  type OrgStatus,
  type OrgType,
  STATUS_BADGE_COLORS,
  TYPE_BADGE_COLORS,
} from "./organizations-types";

type SortField = "name" | "type" | "students" | null;

type Props = {
  rows: Organization[];
  sortField: SortField;
  onSort: (field: SortField) => void;
};

function SortableHeader({
  label,
  field,
  currentField,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  onSort: (field: SortField) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 uppercase"
    >
      {label}
      <ArrowUpDown
        className={cn(
          "size-3",
          currentField === field ? "text-blue-600" : "text-gray-400",
        )}
      />
    </button>
  );
}

function TypeBadge({ type }: { type: OrgType }) {
  const colors = TYPE_BADGE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 font-semibold text-xs",
        colors.bg,
        colors.text,
      )}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: OrgStatus }) {
  const colors = STATUS_BADGE_COLORS[status];
  const dotColors: Record<OrgStatus, string> = {
    Active: "bg-green-500",
    Inactive: "bg-gray-400",
    Onboarding: "bg-yellow-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold text-xs",
        colors.bg,
        colors.text,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full border border-white",
          dotColors[status],
        )}
      />
      {status}
    </span>
  );
}

export function OrganizationsTable({ rows, sortField, onSort }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white font-dm text-gray-500 shadow-sm">
        No organizations found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Organization"
                field="name"
                currentField={sortField}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Type"
                field="type"
                currentField={sortField}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              State
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              # of Locations
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Patients"
                field="students"
                currentField={sortField}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((org) => (
            <TableRow
              key={org.id}
              className="border-gray-100 border-b transition-colors hover:bg-gray-50"
            >
              <TableCell className="px-6 py-4 font-medium text-gray-900">
                {org.name}
              </TableCell>
              <TableCell className="px-4 py-4">
                <TypeBadge type={org.type} />
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {org.location}
              </TableCell>
              <TableCell className="px-4 py-4 text-center text-gray-600">
                {org.locationCount}
              </TableCell>
              <TableCell className="px-4 py-4 font-semibold text-gray-900">
                {org.students.toLocaleString()}
              </TableCell>
              <TableCell className="px-4 py-4">
                <StatusBadge status={org.status} />
              </TableCell>
              <TableCell className="px-4 py-4">
                <Link
                  href={`/dashboard/admin/organizations/${org.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
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
