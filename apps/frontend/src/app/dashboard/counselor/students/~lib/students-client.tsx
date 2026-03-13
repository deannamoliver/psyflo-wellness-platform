"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Plus, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import { getInitials } from "@/lib/string-utils";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import { cn } from "@/lib/tailwind-utils";
import type { StudentRow } from "./data";

type SortKey = "name" | "lastCheckIn" | "status";
type SortDir = "asc" | "desc";
type PageSize = 10 | 25 | 50;
type PatientStatus = "active" | "invite_sent" | "deactivated";

const INDICATOR_BADGE_STYLES: Record<string, string> = {
  anxiety: "bg-blue-100 text-blue-800",
  depression: "bg-purple-100 text-purple-800",
};

function getStatusBadge(status: PatientStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "invite_sent":
      return "bg-amber-50 text-amber-700";
    case "deactivated":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusLabel(status: PatientStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "invite_sent":
      return "Invite Sent";
    case "deactivated":
      return "Deactivated";
    default:
      return status;
  }
}

// Mock providers list for demo
const MOCK_PROVIDERS = [
  "Dr. Sarah Johnson",
  "Dr. Michael Chen",
  "Lisa Martinez, LCSW",
  "Dr. Emily Williams",
];

function formatLastCheckIn(dateStr: string | null): string {
  if (!dateStr) return "No check-ins";
  const checkIn = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDay = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.round(
    (checkInDay.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  return checkIn.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function StudentsClient({ students }: { students: StudentRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState<string>("all");
  const [mentalHealthFilter, setMentalHealthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Mock status for each student (in production this would come from the database)
  const studentsWithStatus = useMemo(() => {
    return students.map((s, i) => ({
      ...s,
      status: (i % 10 === 0 ? "invite_sent" : i % 15 === 0 ? "deactivated" : "active") as PatientStatus,
    }));
  }, [students]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = studentsWithStatus;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (safetyFilter === "none") {
      result = result.filter((s) => s.safetyRisk === null);
    } else if (safetyFilter === "has_alert") {
      result = result.filter((s) => s.safetyRisk !== null);
    } else if (safetyFilter !== "all") {
      result = result.filter((s) => s.safetyRisk === safetyFilter);
    }
    if (mentalHealthFilter === "none") {
      result = result.filter((s) => s.mentalHealth.length === 0);
    } else if (mentalHealthFilter !== "all") {
      result = result.filter((s) =>
        s.mentalHealth.some((m) => m.category === mentalHealthFilter),
      );
    }
    if (statusFilter === "active") {
      result = result.filter((s) => s.status === "active");
    } else if (statusFilter === "inactive") {
      result = result.filter((s) => s.status !== "active");
    }
    return [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "lastCheckIn") {
        const aDate = a.lastCheckIn ? new Date(a.lastCheckIn).getTime() : 0;
        const bDate = b.lastCheckIn ? new Date(b.lastCheckIn).getTime() : 0;
        return (aDate - bDate) * dir;
      }
      if (sortKey === "status") return a.status.localeCompare(b.status) * dir;
      return 0;
    });
  }, [studentsWithStatus, search, safetyFilter, mentalHealthFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const activeFilterCount = (safetyFilter !== "all" ? 1 : 0) + (mentalHealthFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  // Summary stats
  const activeCount = studentsWithStatus.filter((s) => s.status === "active").length;
  const alertCount = studentsWithStatus.filter((s) => s.safetyRisk !== null).length;

  const resetFilters = () => {
    setSafetyFilter("all");
    setMentalHealthFilter("all");
    setStatusFilter("all");
  };

  function SortHeader({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) {
    const active = sortKey === sortKeyName;
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKeyName)}
        className="flex items-center gap-1 text-left"
      >
        <span>{label}</span>
        <ArrowUpDown className={cn("h-3 w-3", active ? "text-gray-900" : "text-gray-300")} />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Invite Patient Button */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => console.log("Invite patient modal - TODO")}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Invite Patient
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
          <div>
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-xl font-bold text-gray-900">{studentsWithStatus.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Needs Review</p>
            <p className="text-xl font-bold text-amber-600">{alertCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Inactive</p>
            <p className="text-xl font-bold text-gray-500">{studentsWithStatus.length - activeCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            My Patients <span className="ml-1 text-gray-500">({filtered.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                showFilters || activeFilterCount > 0
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

          {/* Filter Panel */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 border-b bg-gray-50/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <div className="flex items-center gap-1">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setStatusFilter(s); setPage(0); }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      statusFilter === s
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">Alert:</label>
              <select
                value={safetyFilter}
                onChange={(e) => { setSafetyFilter(e.target.value); setPage(0); }}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-gray-400"
              >
                <option value="all">All</option>
                <option value="has_alert">Has Alert</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
                <option value="none">No Alerts</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">Mental Health:</label>
              <select
                value={mentalHealthFilter}
                onChange={(e) => { setMentalHealthFilter(e.target.value); setPage(0); }}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-gray-400"
              >
                <option value="all">All</option>
                <option value="anxiety">Anxiety</option>
                <option value="depression">Depression</option>
                <option value="none">No Indicators</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortHeader label="Patient" sortKeyName="name" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortHeader label="Status" sortKeyName="status" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Alert Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Clinical Indicators
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortHeader label="Last Engagement" sortKeyName="lastCheckIn" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <StudentTableRow key={s.id} student={s} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination + page size */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Show</span>
            {([10, 25, 50] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => { setPageSize(size); setPage(0); }}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  pageSize === size
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            Showing {filtered.length === 0 ? 0 : safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, filtered.length)} of {filtered.length} patients
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-gray-700">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Patient Actions Menu with Add to Care Team, Transfer, Deactivate options
function PatientActionsMenu({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const [showAddProviderMenu, setShowAddProviderMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
      setShowTransferMenu(false);
      setShowAddProviderMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAddToCareTeam = (provider: string) => {
    console.log(`Adding ${provider} to care team for patient:`, patientId);
    setIsOpen(false);
    setShowAddProviderMenu(false);
  };

  const handleTransferCare = (provider: string) => {
    console.log(`Transferring ${patientName} to ${provider}`);
    setIsOpen(false);
    setShowTransferMenu(false);
  };

  const handleDeactivate = () => {
    console.log("Deactivating patient:", patientId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {showAddProviderMenu ? (
            <div className="p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Add provider to care team:</p>
              {MOCK_PROVIDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAddToCareTeam(p)}
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAddProviderMenu(false)}
                className="mt-2 w-full rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Back
              </button>
            </div>
          ) : showTransferMenu ? (
            <div className="p-2">
              <p className="mb-2 text-xs font-medium text-gray-700">Transfer patient to:</p>
              {MOCK_PROVIDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleTransferCare(p)}
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowTransferMenu(false)}
                className="mt-2 w-full rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Back
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowAddProviderMenu(true)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <UserPlus className="h-4 w-4 text-gray-400" />
                Add to Care Team
              </button>
              <button
                type="button"
                onClick={() => setShowTransferMenu(true)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Users className="h-4 w-4 text-gray-400" />
                Transfer Care
              </button>
              <hr className="my-1" />
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <UserMinus className="h-4 w-4 text-red-400" />
                Deactivate Patient
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

type StudentWithStatus = StudentRow & { status: PatientStatus };

function StudentTableRow({ student }: { student: StudentWithStatus }) {
  return (
    <tr className="transition-colors hover:bg-gray-50/50">
      <td className="px-5 py-3">
        <Link
          href={`/dashboard/counselor/students/${student.id}/overview`}
          className="flex items-center gap-3"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-green-500 font-semibold text-white text-xs">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline">
            {student.name}
          </span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getStatusBadge(student.status))}>
          {getStatusLabel(student.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        {student.safetyRisk ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
              RISK_BADGE_CONFIG[student.safetyRisk].bg,
              RISK_BADGE_CONFIG[student.safetyRisk].text,
            )}
          >
            {RISK_BADGE_CONFIG[student.safetyRisk].label}
          </span>
        ) : (
          <span className="text-xs italic text-gray-400">None</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          {student.mentalHealth.map((indicator) => (
            <span
              key={indicator.category}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                INDICATOR_BADGE_STYLES[indicator.category] ?? "bg-gray-100 text-gray-800"
              )}
            >
              {indicator.category === "anxiety" ? "Anxiety" : "Depression"}
              <span className="opacity-60">·</span>
              <span>{indicator.severity}</span>
            </span>
          ))}
          {student.mentalHealth.length === 0 && (
            <span className="text-xs italic text-gray-400">None</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {formatLastCheckIn(student.lastCheckIn)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/dashboard/counselor/students/${student.id}/overview`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            View
            <ChevronRight className="h-3 w-3" />
          </Link>
          <PatientActionsMenu patientId={student.id} patientName={student.name} />
        </div>
      </td>
    </tr>
  );
}
