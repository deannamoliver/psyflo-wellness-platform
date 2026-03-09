"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgAlertRow } from "../page";

type SortKey = "patientName" | "assignedProvider" | "alertType" | "severity" | "createdAt" | "status";
type SortDir = "asc" | "desc";

const SEVERITY_CONFIG = {
  emergency: { label: "Emergency", bg: "bg-red-500", text: "text-white", border: "border-red-500" },
  high: { label: "High", bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  moderate: { label: "Moderate", bg: "bg-yellow-400", text: "text-yellow-900", border: "border-yellow-400" },
  low: { label: "Low", bg: "bg-blue-500", text: "text-white", border: "border-blue-500" },
};

const ALERT_TYPE_CONFIG = {
  safety: { label: "Safety", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
  engagement: { label: "Engagement", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  clinical: { label: "Clinical", icon: AlertTriangle, color: "text-violet-600", bg: "bg-violet-50" },
  billing: { label: "Billing", icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50" },
};

const STATUS_CONFIG = {
  new: { label: "New", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  resolved: { label: "Resolved", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export function OrgAlertsTable({ alerts }: { alerts: OrgAlertRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "emergency" | "high" | "moderate" | "low">("all");
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 10;

  // Filter
  let filtered = alerts;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.assignedProvider.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q),
    );
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter((a) => a.status === statusFilter);
  }
  if (severityFilter !== "all") {
    filtered = filtered.filter((a) => a.severity === severityFilter);
  }

  // Sort
  const severityOrder = { emergency: 4, high: 3, moderate: 2, low: 1 };
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "patientName") cmp = a.patientName.localeCompare(b.patientName);
    else if (sortKey === "assignedProvider") cmp = a.assignedProvider.localeCompare(b.assignedProvider);
    else if (sortKey === "alertType") cmp = a.alertType.localeCompare(b.alertType);
    else if (sortKey === "severity") cmp = severityOrder[a.severity] - severityOrder[b.severity];
    else if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
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
      setSortDir("desc");
    }
  };

  const newCount = alerts.filter((a) => a.status === "new").length;
  const emergencyCount = alerts.filter((a) => a.severity === "emergency" || a.severity === "high").length;

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
        <div>
          <p className="text-xs text-gray-500">Total Alerts</p>
          <p className="text-xl font-bold text-gray-900">{alerts.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">New</p>
          <p className="text-xl font-bold text-red-600">{newCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">High Priority</p>
          <p className="text-xl font-bold text-orange-600">{emergencyCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-xl font-bold text-amber-600">{alerts.filter((a) => a.status === "in_progress").length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            All Alerts <span className="ml-1 text-gray-500">({filtered.length})</span>
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
              placeholder="Search alerts..."
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
              {(["all", "new", "in_progress", "resolved"] as const).map((s) => (
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
                  {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Severity:</span>
            <div className="flex items-center gap-1">
              {(["all", "emergency", "high", "moderate", "low"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSeverityFilter(s);
                    setPage(0);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    severityFilter === s
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
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
                onClick={() => toggleSort("patientName")}
              >
                Patient {sortKey === "patientName" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("assignedProvider")}
              >
                Provider {sortKey === "assignedProvider" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("alertType")}
              >
                Type {sortKey === "alertType" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("severity")}
              >
                Severity {sortKey === "severity" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Message
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("createdAt")}
              >
                Time {sortKey === "createdAt" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("status")}
              >
                Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  No alerts found.
                </td>
              </tr>
            ) : (
              paginated.map((alert) => {
                const typeConfig = ALERT_TYPE_CONFIG[alert.alertType];
                const TypeIcon = typeConfig.icon;
                const severityConfig = SEVERITY_CONFIG[alert.severity];
                const statusConfig = STATUS_CONFIG[alert.status];

                return (
                  <tr key={alert.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{alert.patientName}</p>
                        <p className="text-gray-500 text-xs">{alert.patientEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {alert.assignedProvider}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", typeConfig.bg, typeConfig.color)}>
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", severityConfig.bg, severityConfig.text)}>
                        {severityConfig.label}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-sm text-gray-700" title={alert.message}>
                        {alert.message}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", statusConfig.bg, statusConfig.text)}>
                        <span className={cn("size-1.5 rounded-full", statusConfig.dot)} />
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })
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
