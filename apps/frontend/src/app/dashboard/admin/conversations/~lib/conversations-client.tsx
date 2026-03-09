"use client";

import { useMemo, useState } from "react";
import { ConversationsFilters } from "./conversations-filters";
import { ConversationsPagination } from "./conversations-pagination";
import type { HistorySessionRow, LiveSessionRow } from "./data";
import { HistoryTable } from "./history-table";
import { LiveSessionsTable } from "./live-sessions-table";

type Tab = "live" | "history";

type Props = {
  liveSessions: LiveSessionRow[];
  historySessions: HistorySessionRow[];
  organizations: string[];
  locations: string[];
  coaches: string[];
};

function applyFilters<T extends LiveSessionRow | HistorySessionRow>(
  rows: T[],
  search: string,
  orgFilter: string,
  locationFilter: string,
  coachFilter: string,
): T[] {
  let result = rows;

  const q = search.toLowerCase().trim();
  if (q) {
    result = result.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.coachName.toLowerCase().includes(q),
    );
  }
  if (orgFilter !== "all") {
    result = result.filter((r) => r.organization === orgFilter);
  }
  if (locationFilter !== "all") {
    result = result.filter((r) => r.location === locationFilter);
  }
  if (coachFilter !== "all") {
    result = result.filter((r) => r.coachName === coachFilter);
  }

  return result;
}

export function ConversationsClient({
  liveSessions,
  historySessions,
  organizations,
  locations,
  coaches,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [coachFilter, setCoachFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const filteredLive = useMemo(
    () =>
      applyFilters(
        liveSessions,
        search,
        orgFilter,
        locationFilter,
        coachFilter,
      ),
    [liveSessions, search, orgFilter, locationFilter, coachFilter],
  );

  const filteredHistory = useMemo(
    () =>
      applyFilters(
        historySessions,
        search,
        orgFilter,
        locationFilter,
        coachFilter,
      ),
    [historySessions, search, orgFilter, locationFilter, coachFilter],
  );

  const activeRows = activeTab === "live" ? filteredLive : filteredHistory;
  const paginatedRows = activeRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  function handleReset() {
    setSearch("");
    setOrgFilter("all");
    setLocationFilter("all");
    setCoachFilter("all");
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-gray-900">Conversations</h1>
        <p className="mt-1 text-gray-500">
          Monitor and oversee all live therapy sessions and conversation
          history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-gray-200 border-b">
        <button
          type="button"
          onClick={() => {
            setActiveTab("live");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 font-medium text-sm transition-colors ${
            activeTab === "live"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="size-2 rounded-full bg-blue-500" />
          Live Sessions
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700 text-xs">
            {liveSessions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("history");
            setCurrentPage(1);
          }}
          className={`border-b-2 px-1 pb-3 font-medium text-sm transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          History
        </button>
      </div>

      {/* Filters */}
      <ConversationsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        orgFilter={orgFilter}
        onOrgFilterChange={(v) => {
          setOrgFilter(v);
          setCurrentPage(1);
        }}
        locationFilter={locationFilter}
        onLocationFilterChange={(v) => {
          setLocationFilter(v);
          setCurrentPage(1);
        }}
        coachFilter={coachFilter}
        onCoachFilterChange={(v) => {
          setCoachFilter(v);
          setCurrentPage(1);
        }}
        onReset={handleReset}
        organizations={organizations}
        locations={locations}
        coaches={coaches}
      />

      {/* Table */}
      {activeTab === "live" ? (
        <LiveSessionsTable
          rows={paginatedRows as LiveSessionRow[]}
          totalActive={filteredLive.length}
        />
      ) : (
        <HistoryTable
          rows={paginatedRows as HistorySessionRow[]}
          totalHistory={filteredHistory.length}
        />
      )}

      {/* Pagination */}
      <ConversationsPagination
        currentPage={currentPage}
        totalItems={activeRows.length}
        perPage={perPage}
        onPageChange={setCurrentPage}
        label={activeTab === "live" ? "active sessions" : "past sessions"}
      />
    </div>
  );
}
