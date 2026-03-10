"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { archivePatients, unarchivePatients } from "./archive-patients";
import { BulkActions } from "./bulk-actions";
import { ConfirmActionModal } from "./confirm-action-modal";
import { exportPatientsCsv } from "./export-patients";
import type {
  SortColumn,
  SortState,
  Patient,
  PatientsPageData,
} from "./patients-data";
import { PatientsFilters, type PatientsFiltersState } from "./patients-filters";
import { PatientsPagination } from "./patients-pagination";
import { PatientsStats } from "./patients-stats";
import { PatientsTable } from "./patients-table";

const DEFAULT_FILTERS: PatientsFiltersState = {
  search: "",
  organization: "all",
  status: "all",
  sortBy: "recently-added",
};

type ConfirmAction = "export" | "deactivate" | "reactivate" | null;

type Props = { data: PatientsPageData };

export function PatientsClient({ data }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<PatientsFiltersState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [sort, setSort] = useState<SortState>(null);

  const filtered = useMemo(() => {
    let result: Patient[] = data.patients;

    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.patientId.toLowerCase().includes(q) ||
          s.organization.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      );
    }
    if (filters.organization !== "all") {
      result = result.filter((s) => s.organization === filters.organization);
    }
    if (filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }

    if (sort) {
      result = [...result].sort((a, b) => {
        const aVal = a[sort.column].toLowerCase();
        const bVal = b[sort.column].toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [filters, data.patients, sort]);

  const totalItems = filtered.length;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const allSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((r) => selectedIds.has(r.id));

  const isReactivate =
    selectedIds.size > 0 &&
    data.patients
      .filter((s) => selectedIds.has(s.id))
      .every((s) => s.status === "Archived" || s.status === "Inactive");

  function handleFilterChange(key: keyof PatientsFiltersState, value: string) {
    setFilters((prev: PatientsFiltersState) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSort(null);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(column: SortColumn) {
    setSort((prev) => {
      if (prev?.column === column) {
        return prev.direction === "asc" ? { column, direction: "desc" } : null;
      }
      return { column, direction: "asc" };
    });
    setCurrentPage(1);
  }

  function handleToggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const r of paginatedRows) next.delete(r.id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const r of paginatedRows) next.add(r.id);
        return next;
      });
    }
  }

  const confirmLabel =
    confirmAction === "export"
      ? "export the selected patients"
      : confirmAction === "deactivate"
        ? "deactivate the selected patients"
        : confirmAction === "reactivate"
          ? "reactivate the selected patients"
          : "";

  async function handleConfirmedAction() {
    const ids = Array.from(selectedIds);

    if (confirmAction === "export") {
      const csv = await exportPatientsCsv(ids);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (confirmAction === "deactivate") {
      await archivePatients(ids);
      router.refresh();
    } else if (confirmAction === "reactivate") {
      await unarchivePatients(ids);
      router.refresh();
    }

    setSelectedIds(new Set());
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <div>
        <h1 className="font-bold text-3xl text-gray-900">Patients</h1>
        <p className="mt-1 text-gray-500">Manage and monitor all patients</p>
      </div>

      <PatientsStats stats={data.stats} />

      <PatientsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        organizations={data.organizations}
      />

      <div>
        <h2 className="font-semibold text-gray-900 text-xl">Patient Records</h2>
        <p className="text-gray-500 text-sm">
          {data.stats.total.toLocaleString()} total patients found
        </p>
      </div>

      <PatientsTable
        rows={paginatedRows}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        allSelected={allSelected}
        sort={sort}
        onSort={handleSort}
      />

      <PatientsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={(v) => {
          setPerPage(v);
          setCurrentPage(1);
        }}
      />

      <BulkActions
        selectedCount={selectedIds.size}
        isReactivate={isReactivate}
        onExport={() => setConfirmAction("export")}
        onDeactivate={() =>
          setConfirmAction(isReactivate ? "reactivate" : "deactivate")
        }
      />

      <ConfirmActionModal
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        actionLabel={confirmLabel}
        onConfirm={handleConfirmedAction}
      />
    </div>
  );
}
