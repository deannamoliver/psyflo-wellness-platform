"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { PatientCensusRow } from "../page";

type SortKey = "name" | "enrolledAt" | "assignedProvider" | "status" | "billingEligible" | "dataDays";
type SortDir = "asc" | "desc";

export function PatientCensusTable({
  patients,
  providers,
}: {
  patients: PatientCensusRow[];
  providers: string[];
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [billingFilter, setBillingFilter] = useState<"all" | "eligible" | "not_eligible">("all");

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
  if (billingFilter === "eligible") {
    filtered = filtered.filter((p) => p.billingEligible);
  } else if (billingFilter === "not_eligible") {
    filtered = filtered.filter((p) => !p.billingEligible);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "enrolledAt") cmp = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
    else if (sortKey === "assignedProvider") cmp = a.assignedProvider.localeCompare(b.assignedProvider);
    else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    else if (sortKey === "billingEligible") cmp = (a.billingEligible ? 1 : 0) - (b.billingEligible ? 1 : 0);
    else if (sortKey === "dataDays") cmp = a.dataDays - b.dataDays;
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
  const eligibleCount = patients.filter((p) => p.billingEligible).length;

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
        <div>
          <p className="text-xs text-gray-500">Total Patients</p>
          <p className="text-xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-xl font-bold text-gray-500">{patients.length - activeCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Billing Eligible</p>
          <p className="text-xl font-bold text-teal-600">{eligibleCount}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Patient Census <span className="ml-1 text-gray-500">({filtered.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Patient
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(0);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "eligible", "not_eligible"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setBillingFilter(s);
                  setPage(0);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  billingFilter === s
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {s === "all" ? "All Billing" : s === "eligible" ? "Eligible" : "Not Eligible"}
              </button>
            ))}
          </div>
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
                onClick={() => toggleSort("enrolledAt")}
              >
                Enrolled {sortKey === "enrolledAt" && (sortDir === "asc" ? "↑" : "↓")}
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
                onClick={() => toggleSort("dataDays")}
              >
                Data Days {sortKey === "dataDays" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort("billingEligible")}
              >
                Billing {sortKey === "billingEligible" && (sortDir === "asc" ? "↑" : "↓")}
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(patient.enrolledAt), "MMM d, yyyy")}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            patient.dataDays >= 16
                              ? "bg-emerald-500"
                              : patient.dataDays >= 2
                                ? "bg-amber-400"
                                : "bg-red-400",
                          )}
                          style={{ width: `${(patient.dataDays / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{patient.dataDays}/30</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {patient.billingEligible ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        <XCircle className="h-3 w-3" />
                        Not Eligible
                      </span>
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

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Patient</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement add patient logic
                setShowAddModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assigned Provider
                </label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400">
                  <option value="">Select a provider</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
