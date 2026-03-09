"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { archiveStudents, unarchiveStudents } from "../../students/~lib/archive-students";
import { BlockedStudentsSection } from "../../students/~lib/blocked-students";
import { BulkActions } from "../../students/~lib/bulk-actions";
import { BulkBlockModal } from "../../students/~lib/bulk-block-modal";
import { BulkImportModal } from "../../students/~lib/bulk-import-modal";
import { ConfirmActionModal } from "../../students/~lib/confirm-action-modal";
import { exportStudentsCsv } from "../../students/~lib/export-students";
import type {
  SortColumn,
  SortState,
  Student,
  StudentsPageData,
} from "../../students/~lib/students-data";
import { PatientsFilters, type PatientsFiltersState } from "./patients-filters";
import { StudentsPagination } from "../../students/~lib/students-pagination";
import { PatientsStats } from "./patients-stats";
import { PatientsTable } from "./patients-table";
import { UnblockModal } from "../../students/~lib/unblock-modal";

const DEFAULT_FILTERS: PatientsFiltersState = {
  search: "",
  organization: "all",
  status: "all",
  sortBy: "recently-added",
};

type ConfirmAction = "export" | "archive" | "unarchive" | null;

type Props = { data: StudentsPageData };

export function PatientsClient({ data }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<PatientsFiltersState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [unblockStudentId, setUnblockStudentId] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sort, setSort] = useState<SortState>(null);

  const filtered = useMemo(() => {
    let result: Student[] = data.students;

    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.studentId.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      );
    }
    if (filters.organization !== "all") {
      result = result.filter((s) => s.school === filters.organization);
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
  }, [filters, data.students, sort]);

  const totalItems = filtered.length;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const allSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((r) => selectedIds.has(r.id));

  const isUnarchive =
    selectedIds.size > 0 &&
    data.students
      .filter((s) => selectedIds.has(s.id))
      .every((s) => s.status === "Archived");

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
      : confirmAction === "archive"
        ? "archive the selected patients"
        : confirmAction === "unarchive"
          ? "unarchive the selected patients"
          : "";

  async function handleConfirmedAction() {
    const ids = Array.from(selectedIds);

    if (confirmAction === "export") {
      const csv = await exportStudentsCsv(ids);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (confirmAction === "archive") {
      await archiveStudents(ids);
      router.refresh();
    } else if (confirmAction === "unarchive") {
      await unarchiveStudents(ids);
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
        organizations={data.schools}
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

      <StudentsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={(v) => {
          setPerPage(v);
          setCurrentPage(1);
        }}
      />

      <BlockedStudentsSection
        blockedStudents={data.blockedStudents}
        blockedCount={data.stats.blocked}
        onUnblock={(id) => {
          setUnblockStudentId(id);
          setUnblockModalOpen(true);
        }}
      />

      <BulkActions
        selectedCount={selectedIds.size}
        isUnarchive={isUnarchive}
        onExport={() => setConfirmAction("export")}
        onBlock={() => setBlockModalOpen(true)}
        onArchive={() =>
          setConfirmAction(isUnarchive ? "unarchive" : "archive")
        }
        onImport={() => setImportModalOpen(true)}
      />

      <ConfirmActionModal
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        actionLabel={confirmLabel}
        onConfirm={handleConfirmedAction}
      />

      <BulkBlockModal
        open={blockModalOpen}
        onOpenChange={setBlockModalOpen}
        studentIds={Array.from(selectedIds)}
        onComplete={() => setSelectedIds(new Set())}
      />

      <UnblockModal
        open={unblockModalOpen}
        onOpenChange={setUnblockModalOpen}
        studentId={unblockStudentId}
      />

      <BulkImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
}
