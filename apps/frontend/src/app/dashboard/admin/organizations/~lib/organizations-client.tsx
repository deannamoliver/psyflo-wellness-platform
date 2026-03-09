"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OrganizationsFilters } from "./organizations-filters";
import { OrganizationsPagination } from "./organizations-pagination";
import { OrganizationsTable } from "./organizations-table";
import type { Organization } from "./organizations-types";

type SortField = "name" | "type" | "students" | null;
type SortDirection = "asc" | "desc";

export function OrganizationsClient({
  organizations,
}: {
  organizations: Organization[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const filtered = useMemo(() => {
    let result: Organization[] = organizations;

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((org) => org.name.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") {
      result = result.filter((org) => org.type === typeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((org) => org.status === statusFilter);
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        const dir = sortDirection === "asc" ? 1 : -1;
        switch (sortField) {
          case "name":
            return dir * a.name.localeCompare(b.name);
          case "type":
            return dir * a.type.localeCompare(b.type);
          case "students":
            return dir * (a.students - b.students);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [
    search,
    typeFilter,
    statusFilter,
    sortField,
    sortDirection,
    organizations,
  ]);

  const totalItems = filtered.length;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function handleReset() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function handlePerPageChange(newPerPage: number) {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Organization Management
          </h1>
          <p className="mt-1 text-gray-500">
            Manage organizations, locations, and configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/organizations/add-location"
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="size-4" />
            Add Location
          </Link>
          <Link
            href="/dashboard/admin/organizations/add"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Add Organization
          </Link>
        </div>
      </div>

      {/* Filters */}
      <OrganizationsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => {
          setTypeFilter(v);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        onReset={handleReset}
      />

      {/* Directory Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">
            Organization Directory
          </h2>
          <p className="text-gray-500 text-sm">
            Showing {paginatedRows.length} of {totalItems} organizations
          </p>
        </div>
        {sortField && (
          <button
            type="button"
            onClick={() => {
              setSortField(null);
              setSortDirection("asc");
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50"
          >
            <X className="size-4" />
            Clear Sort
          </button>
        )}
      </div>

      {/* Table */}
      <OrganizationsTable
        rows={paginatedRows}
        sortField={sortField}
        onSort={handleSort}
      />

      {/* Pagination */}
      <OrganizationsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
}
