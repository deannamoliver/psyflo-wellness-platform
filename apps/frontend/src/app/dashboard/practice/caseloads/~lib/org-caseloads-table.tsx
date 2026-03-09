"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgPatientRow } from "../page";

type SortKey = "name" | "assignedProvider" | "status" | "lastActivity" | "billableDays" | "riskLevel";
type SortDir = "asc" | "desc";

const RISK_BADGE_CONFIG = {
  emergency: { label: "EMERGENCY", bg: "bg-red-500", text: "text-white" },
  high: { label: "HIGH", bg: "bg-orange-500", text: "text-white" },
  moderate: { label: "MODERATE", bg: "bg-yellow-400", text: "text-yellow-900" },
  low: { label: "LOW", bg: "bg-blue-500", text: "text-white" },
};

export function OrgCaseloadsTable({
  patients,
  providers,
}: {
  patients: OrgPatientRow[];
  providers: string[];
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 15;

  // Filter
  let filtered = patients;
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
  if (providerFilter !== "all") {
    filtered = filtered.filter((p) => p.assignedProvider === providerFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "assignedProvider") cmp = a.assignedProvider.localeCompare(b.assignedProvider);
    else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    else if (sortKey === "lastActivity") cmp = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
    else if (sortKey === "billableDays") cmp = a.billableDays - b.billableDays;
    else if (sortKey === "riskLevel") {
      const riskOrder = { emergency: 4, high: 3, moderate: 2, low: 1, null: 0 };
      cmp = (riskOrder[a.riskLevel ?? "null"] ?? 0) - (riskOrder[b.riskLevel ?? "null"] ?? 0);
    }
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

  const activeCount = patients.filter((p) => p.status === "active").length;
  const alertCount = patients.filter((p) => p.riskLevel && p.riskLevel !== "low").length;

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
        <div>
          <p className="text-xs text-gray-500">Caseload</p>
          <p className="text-xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Providers</p>
          <p className="text-xl font-bold text-blue-600">{providers.length}</p>
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
            All Caseloads <span className="ml-1 text-gray-500">({filtered.length})</span>
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
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("name")}
              >
                Patient {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("assignedProvider")}
              >
                Provider {sortKey === "assignedProvider" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("status")}
              >
                Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("lastActivity")}
              >
                Last Engagement {sortKey === "lastActivity" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("billableDays")}
              >
                Data Days {sortKey === "billableDays" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("riskLevel")}
              >
                Risk {sortKey === "riskLevel" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  No patients found.
                </td>
              </tr>
            ) : (
              paginated.map((patient) => (
                <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                      <p className="text-gray-500 text-xs">{patient.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {patient.assignedProvider}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        patient.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {patient.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(patient.lastActivity), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            patient.billableDays >= 16
                              ? "bg-emerald-500"
                              : patient.billableDays >= 2
                                ? "bg-amber-400"
                                : "bg-red-400",
                          )}
                          style={{ width: `${(patient.billableDays / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{patient.billableDays}/30</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {patient.riskLevel ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          RISK_BADGE_CONFIG[patient.riskLevel].bg,
                          RISK_BADGE_CONFIG[patient.riskLevel].text,
                        )}
                      >
                        {RISK_BADGE_CONFIG[patient.riskLevel].label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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
          Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
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
  );
}
