"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DeactivateUsersModal } from "./deactivate-users-modal";
import { UsersBulkActions } from "./users-bulk-actions";
import type { AdminUser, UsersPageData } from "./users-data";
import { UsersFilters } from "./users-filters";
import { UsersPagination } from "./users-pagination";
import { UsersStatCards } from "./users-stat-cards";
import { UsersTable } from "./users-table";

type Props = { data: UsersPageData };

export function UsersClient({ data }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deactivateIds, setDeactivateIds] = useState<string[]>([]);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result: AdminUser[] = data.users;

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (orgFilter !== "all") {
      result = result.filter((u) => u.organization === orgFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    return result;
  }, [search, roleFilter, orgFilter, statusFilter, data.users]);

  const totalItems = filtered.length;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  function handleReset() {
    setSearch("");
    setRoleFilter("all");
    setOrgFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    setSelectedIds(new Set());
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleAll() {
    if (selectedIds.size === paginatedRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRows.map((u) => u.id)));
    }
  }

  function handleDeactivateSingle(userId: string) {
    setDeactivateIds([userId]);
    setDeactivateModalOpen(true);
  }

  function handleDeactivateBulk() {
    setDeactivateIds(Array.from(selectedIds));
    setDeactivateModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-500">
            View and manage all users across organizations with role-based
            filtering
          </p>
        </div>
        <Link
          href="/dashboard/admin/users/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Add New User
        </Link>
      </div>

      {/* Stat Cards */}
      <UsersStatCards stats={data.stats} />

      {/* Filters */}
      <UsersFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(v) => {
          setRoleFilter(v);
          setCurrentPage(1);
        }}
        orgFilter={orgFilter}
        onOrgFilterChange={(v) => {
          setOrgFilter(v);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        onReset={handleReset}
        orgs={data.orgs}
      />

      {/* Table Section */}
      <div>
        <h2 className="mb-1 font-semibold text-gray-900 text-xl">
          All Users{" "}
          <span className="font-normal text-base text-gray-500">
            ({totalItems.toLocaleString()} total)
          </span>
        </h2>
      </div>

      <UsersTable
        rows={paginatedRows}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAll}
        onDeactivate={handleDeactivateSingle}
      />

      {/* Pagination */}
      <UsersPagination
        currentPage={currentPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={setCurrentPage}
      />

      {/* Bulk Actions */}
      <UsersBulkActions
        selectedCount={selectedIds.size}
        onDeactivate={handleDeactivateBulk}
      />

      <DeactivateUsersModal
        open={deactivateModalOpen}
        onOpenChange={setDeactivateModalOpen}
        userIds={deactivateIds}
        onComplete={() => setSelectedIds(new Set())}
      />

    </div>
  );
}
