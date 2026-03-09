"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, MessageSquare, Phone, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { PatientRow } from "../page";

type SortKey = "name" | "billableDays" | "providerMinutes" | "daysAgo";
type SortDir = "asc" | "desc";

type PageSize = 10 | 25 | 50;

function getBillableDaysColor(days: number): string {
  if (days < 2) return "bg-red-100 text-red-700";
  if (days <= 15) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function getProviderTimeColor(minutes: number): string {
  if (minutes < 10) return "bg-red-100 text-red-700";
  if (minutes < 20) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export function AllPatientsTable({ patients }: { patients: PatientRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [planFilter, setPlanFilter] = useState<"all" | "has_plan" | "no_plan">("all");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = patients
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (planFilter === "has_plan") return p.treatmentPlan !== null;
      if (planFilter === "no_plan") return p.treatmentPlan === null;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "billableDays") return (a.billableDays - b.billableDays) * dir;
      if (sortKey === "providerMinutes") return (a.providerMinutes - b.providerMinutes) * dir;
      if (sortKey === "daysAgo") return (a.daysAgo - b.daysAgo) * dir;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const activeFilterCount = planFilter !== "all" ? 1 : 0;

  const resetFilters = () => {
    setPlanFilter("all");
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
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">All Patients <span className="ml-1 text-gray-500">({patients.length})</span></h3>
          <button
            type="button"
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Patient
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="rounded-lg border bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              showFilters || activeFilterCount > 0
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/50 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value as typeof planFilter); setPage(0); }}
              className="rounded-md border bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="has_plan">Has Plan</option>
              <option value="no_plan">No Plan</option>
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
                <SortHeader label="Data Days" sortKeyName="billableDays" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <SortHeader label="Provider Time" sortKeyName="providerMinutes" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Treatment Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <SortHeader label="Last Engagement" sortKeyName="daysAgo" />
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
              paginated.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/counselor/students/${p.id}/overview`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getBillableDaysColor(p.billableDays))}>
                      {p.billableDays} / 30
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getProviderTimeColor(p.providerMinutes))}>
                      {p.providerMinutes} min
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.treatmentPlan ? (
                      <span className="text-xs">{p.treatmentPlan}</span>
                    ) : (
                      <span className="text-xs italic text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.daysAgo === 0 ? "Today" : p.daysAgo === 1 ? "1 day" : `${p.daysAgo} days`}
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
                        href={`/dashboard/counselor/students/${p.id}/overview`}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        title="View patient"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
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

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Patient to Roster</h2>
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement add patient logic
                setShowAddPatientModal(false);
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
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
