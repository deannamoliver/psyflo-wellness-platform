"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { PatientRow } from "../page";

const sentimentConfig = {
  positive: { label: "Positive", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  neutral: { label: "Neutral", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" },
  negative: { label: "Negative", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  unknown: { label: "Unknown", dot: "bg-gray-300", text: "text-gray-400", bg: "bg-gray-50" },
} as const;

const moodColors: Record<string, string> = {
  Happy: "bg-emerald-50 text-emerald-700",
  Calm: "bg-blue-50 text-blue-700",
  Anxious: "bg-amber-50 text-amber-700",
  Sad: "bg-indigo-50 text-indigo-700",
  Stressed: "bg-red-50 text-red-700",
  Neutral: "bg-gray-50 text-gray-600",
  Hopeful: "bg-teal-50 text-teal-700",
  Tired: "bg-purple-50 text-purple-700",
};

type SortKey = "name" | "sessions" | "planAdherence" | "dateJoined";
type SortDir = "asc" | "desc";

type PageSize = 10 | 25 | 50;

export function AllPatientsTable({ patients }: { patients: PatientRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<PatientRow["sentiment"] | "all">("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<"all" | "has_plan" | "no_plan">("all");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allMoods = [...new Set(patients.map((p) => p.recentMood))].sort();

  const filtered = patients
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => sentimentFilter === "all" || p.sentiment === sentimentFilter)
    .filter((p) => moodFilter === "all" || p.recentMood === moodFilter)
    .filter((p) => {
      if (planFilter === "has_plan") return p.treatmentPlan !== null;
      if (planFilter === "no_plan") return p.treatmentPlan === null;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "sessions") return (a.sessions - b.sessions) * dir;
      if (sortKey === "planAdherence") return (a.planAdherence - b.planAdherence) * dir;
      if (sortKey === "dateJoined") return a.dateJoined.localeCompare(b.dateJoined) * dir;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const activeFilterCount = (sentimentFilter !== "all" ? 1 : 0) + (moodFilter !== "all" ? 1 : 0) + (planFilter !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSentimentFilter("all");
    setMoodFilter("all");
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
        <h3 className="text-sm font-semibold text-gray-900">All Patients</h3>
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
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Sentiment</label>
            <select
              value={sentimentFilter}
              onChange={(e) => { setSentimentFilter(e.target.value as typeof sentimentFilter); setPage(0); }}
              className="rounded-md border bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Mood</label>
            <select
              value={moodFilter}
              onChange={(e) => { setMoodFilter(e.target.value); setPage(0); }}
              className="rounded-md border bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All</option>
              {allMoods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
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
                <SortHeader label="# Sessions" sortKeyName="sessions" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Sentiment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Recent Mood
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Treatment Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <SortHeader label="Plan Adherence" sortKeyName="planAdherence" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <SortHeader label="Date Joined" sortKeyName="dateJoined" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                  No patients found.
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const sent = sentimentConfig[p.sentiment];
                return (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/counselor/students/${p.id}/overview`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.sessions}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", sent.bg, sent.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sent.dot)} />
                        {sent.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", moodColors[p.recentMood] ?? "bg-gray-50 text-gray-600")}>
                        {p.recentMood}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {p.treatmentPlan ? (
                        <span className="text-xs">{p.treatmentPlan}</span>
                      ) : (
                        <span className="text-xs italic text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              p.planAdherence >= 75
                                ? "bg-emerald-500"
                                : p.planAdherence >= 50
                                  ? "bg-amber-400"
                                  : "bg-red-400",
                            )}
                            style={{ width: `${Math.min(p.planAdherence, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{p.planAdherence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.dateJoined}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/counselor/students/${p.id}/overview`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        View
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
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
  );
}
