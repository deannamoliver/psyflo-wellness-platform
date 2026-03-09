"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Filter,
  MessageSquare,
  Phone,
  Search,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgPatientRow } from "../page";

type SortKey = "name" | "assignedProvider" | "billableDays" | "providerMinutes" | "daysAgo";
type SortDir = "asc" | "desc";
type ViewMode = "my-caseload" | "organization";

function getBillableDaysColor(days: number) {
  if (days >= 16) return "bg-emerald-50 text-emerald-700";
  if (days >= 2) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function getProviderTimeColor(minutes: number) {
  if (minutes >= 20) return "bg-emerald-50 text-emerald-700";
  if (minutes >= 10) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export function CaseloadsClient({
  patients,
  providers,
  currentUserProvider,
}: {
  patients: OrgPatientRow[];
  providers: string[];
  currentUserProvider: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("my-caseload");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 15;

  // Get base patients based on view mode
  const basePatients = viewMode === "my-caseload" 
    ? patients.filter(p => p.assignedProvider === currentUserProvider)
    : patients;

  // Filter
  let filtered = basePatients;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.assignedProvider.toLowerCase().includes(q),
    );
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }
  if (providerFilter !== "all" && viewMode === "organization") {
    filtered = filtered.filter((p) => p.assignedProvider === providerFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "assignedProvider") cmp = a.assignedProvider.localeCompare(b.assignedProvider);
    else if (sortKey === "billableDays") cmp = a.billableDays - b.billableDays;
    else if (sortKey === "providerMinutes") cmp = a.providerMinutes - b.providerMinutes;
    else if (sortKey === "daysAgo") cmp = a.daysAgo - b.daysAgo;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paginated = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const activeCount = basePatients.filter((p) => p.status === "active").length;
  const alertCount = basePatients.filter((p) => p.riskLevel && p.riskLevel !== "low").length;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(0);
    setProviderFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleViewModeChange("my-caseload")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            viewMode === "my-caseload"
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          <User className="h-4 w-4" />
          My Caseload
        </button>
        <button
          type="button"
          onClick={() => handleViewModeChange("organization")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            viewMode === "organization"
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          <Users className="h-4 w-4" />
          Organization Caseloads
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
          <div>
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-xl font-bold text-gray-900">{basePatients.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{viewMode === "my-caseload" ? "Your Patients" : "Providers"}</p>
            <p className="text-xl font-bold text-blue-600">
              {viewMode === "my-caseload" ? basePatients.length : providers.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Needs Attention</p>
            <p className="text-xl font-bold text-orange-600">{alertCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {viewMode === "my-caseload" ? "My Patients" : "All Caseloads"}{" "}
              <span className="ml-1 text-gray-500">({filtered.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                showFilters ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600 hover:bg-gray-50",
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex items-center gap-4 border-b bg-gray-50/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <div className="flex items-center gap-1">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(0);
                    }}
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
            {viewMode === "organization" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Provider:</span>
                <select
                  value={providerFilter}
                  onChange={(e) => {
                    setProviderFilter(e.target.value);
                    setPage(0);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-gray-400"
                >
                  <option value="all">All Providers</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Table - matching provider dashboard columns */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th
                  className="cursor-pointer px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("name")}
                >
                  Patient {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                {viewMode === "organization" && (
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => toggleSort("assignedProvider")}
                  >
                    Provider {sortKey === "assignedProvider" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                )}
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("billableDays")}
                >
                  Billable Days {sortKey === "billableDays" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("providerMinutes")}
                >
                  Provider Time {sortKey === "providerMinutes" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Treatment Plan
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("daysAgo")}
                >
                  Days Since Last Login {sortKey === "daysAgo" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === "organization" ? 7 : 6} className="px-5 py-8 text-center text-sm text-gray-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                paginated.map((patient) => (
                  <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/practice/patients/${patient.id}/overview`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {patient.name}
                      </Link>
                    </td>
                    {viewMode === "organization" && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {patient.assignedProvider}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getBillableDaysColor(patient.billableDays))}>
                        {patient.billableDays} / 30
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getProviderTimeColor(patient.providerMinutes))}>
                        {patient.providerMinutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {patient.treatmentPlan ? (
                        <span className="text-xs">{patient.treatmentPlan}</span>
                      ) : (
                        <span className="text-xs italic text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {patient.daysAgo === 0 ? "Today" : patient.daysAgo === 1 ? "1 day" : `${patient.daysAgo} days`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                          title="Call patient"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Message patient"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/dashboard/practice/patients/${patient.id}/overview`}
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          title="View patient"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing {sorted.length > 0 ? safePage * pageSize + 1 : 0}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-gray-600">
              {safePage + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
