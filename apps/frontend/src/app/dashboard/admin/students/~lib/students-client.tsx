"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { archiveStudents, unarchiveStudents } from "./archive-students";
import { BlockedStudentsSection } from "./blocked-students";
import { BulkActions } from "./bulk-actions";
import { BulkBlockModal } from "./bulk-block-modal";
import { BulkImportModal } from "./bulk-import-modal";
import { ConfirmActionModal } from "./confirm-action-modal";
import { exportStudentsCsv } from "./export-students";
import type {
  SortColumn,
  SortState,
  Student,
  StudentsPageData,
} from "./students-data";
import { StudentsFilters, type StudentsFiltersState } from "./students-filters";
import { StudentsPagination } from "./students-pagination";
import { StudentsStats } from "./students-stats";
import { StudentsTable } from "./students-table";
import { UnblockModal } from "./unblock-modal";

const DEFAULT_FILTERS: StudentsFiltersState = {
  search: "",
  school: "all",
  district: "all",
  grade: "all",
  status: "all",
  sortBy: "recently-added",
};

type ConfirmAction = "export" | "deactivate" | "reactivate" | null;

type Props = { data: StudentsPageData };

export function StudentsClient({ data }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<StudentsFiltersState>(DEFAULT_FILTERS);
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
          s.district.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      );
    }
    if (filters.school !== "all") {
      result = result.filter((s) => s.school === filters.school);
    }
    if (filters.district !== "all") {
      result = result.filter((s) => s.district === filters.district);
    }
    if (filters.grade !== "all") {
      result = result.filter((s) => s.grade === filters.grade);
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

  const isReactivate =
    selectedIds.size > 0 &&
    data.students
      .filter((s) => selectedIds.has(s.id))
      .every((s) => s.status === "Inactive");

  function handleFilterChange(key: keyof StudentsFiltersState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      const csv = await exportStudentsCsv(ids);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (confirmAction === "deactivate") {
      await archiveStudents(ids);
      router.refresh();
    } else if (confirmAction === "reactivate") {
      await unarchiveStudents(ids);
      router.refresh();
    }

    setSelectedIds(new Set());
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <div>
        <h1 className="font-bold text-3xl text-gray-900">Clients</h1>
        <p className="mt-1 text-gray-500">Manage and monitor all clients</p>
      </div>

      <StudentsStats stats={data.stats} />

      <StudentsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        schools={data.schools}
        districts={data.districts}
      />

      <div>
        <h2 className="font-semibold text-gray-900 text-xl">Client Records</h2>
        <p className="text-gray-500 text-sm">
          {data.stats.total.toLocaleString()} total clients found
        </p>
      </div>

      <StudentsTable
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
        blockedCount={data.blockedStudents.length}
        onUnblock={(id) => {
          setUnblockStudentId(id);
          setUnblockModalOpen(true);
        }}
      />

      <BulkActions
        selectedCount={selectedIds.size}
        isReactivate={isReactivate}
        onExport={() => setConfirmAction("export")}
        onDeactivate={() =>
          setConfirmAction(isReactivate ? "reactivate" : "deactivate")
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
