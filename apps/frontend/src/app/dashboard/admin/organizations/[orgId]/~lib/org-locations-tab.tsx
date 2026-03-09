"use client";

import { ArrowUpDown, Plus, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/lib/core-ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import type { Location, OrgDetail } from "./org-detail-data";

type SortField = "name" | "students" | null;
type SortDirection = "asc" | "desc";

export function OrgLocationsTab({ org }: { org: OrgDetail }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filtered = useMemo(() => {
    let result: Location[] = org.locations;

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q),
      );
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        const dir = sortDirection === "asc" ? 1 : -1;
        if (sortField === "name") return dir * a.name.localeCompare(b.name);
        if (sortField === "students") return dir * (a.students - b.students);
        return 0;
      });
    }

    return result;
  }, [org.locations, search, sortField, sortDirection]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Locations</h2>
          <p className="mt-1 text-gray-500 text-sm">
            All locations associated with this organization
          </p>
        </div>
        <Link
          href={`/dashboard/admin/organizations/add-location?orgId=${org.id}`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-lg">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 border-gray-200 bg-white pl-10 font-dm"
        />
      </div>

      {/* Table */}
      <LocationsTable
        rows={filtered}
        orgId={org.id}
        sortField={sortField}
        onSort={handleSort}
      />
    </div>
  );
}

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
          "h-3 w-3",
          currentField === field ? "text-blue-600" : "text-gray-400",
        )}
      />
    </button>
  );
}

function LocationsTable({
  rows,
  orgId,
  sortField,
  onSort,
}: {
  rows: Location[];
  orgId: string;
  sortField: SortField;
  onSort: (field: SortField) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
        No locations found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="Location Name"
                field="name"
                currentField={sortField}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Grade Levels
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs tracking-wider">
              <SortableHeader
                label="# of Patients"
                field="students"
                currentField={sortField}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Primary Contact
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((loc) => (
            <TableRow
              key={loc.id}
              className="border-gray-100 border-b transition-colors hover:bg-gray-50"
            >
              <TableCell className="px-6 py-4 font-medium text-gray-900">
                {loc.name}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {loc.gradeLevels}
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="font-semibold text-gray-900">
                  {loc.students.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs">Active</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="text-gray-900">{loc.contactName}</div>
                <div className="text-gray-500 text-xs">{loc.contactEmail}</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <Link
                  href={`/dashboard/admin/organizations/${orgId}/locations/${loc.id}`}
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
