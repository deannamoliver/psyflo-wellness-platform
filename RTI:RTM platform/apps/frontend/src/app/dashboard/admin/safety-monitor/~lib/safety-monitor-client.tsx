"use client";

import { useMemo, useState } from "react";
import { AlertsTable } from "./alert-section";
import { AdminSafetyFilters } from "./filters";
import { AdminSummaryCards } from "./summary-cards";
import type { AdminSafetyAlert, AdminSafetySummary } from "./types";
import { ALERT_TYPE_LABELS } from "./types";

type Props = {
  alerts: AdminSafetyAlert[];
  summary: AdminSafetySummary;
};

function isWithinTimeRange(date: Date, range: string): boolean {
  if (range === "all") return true;
  const now = Date.now();
  const ms = date.getTime();
  const hours = (now - ms) / (1000 * 60 * 60);
  switch (range) {
    case "24h":
      return hours < 24;
    case "7d":
      return hours < 24 * 7;
    case "30d":
      return hours < 24 * 30;
    default:
      return true;
  }
}

export function SafetyMonitorClient({ alerts, summary }: Props) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const locations = useMemo(() => {
    const unique = [...new Set(alerts.map((a) => a.schoolName))];
    return unique.sort();
  }, [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = alert.studentName.toLowerCase().includes(q);
        const typeLabel =
          ALERT_TYPE_LABELS[alert.alertType]?.toLowerCase() ?? "";
        const typeMatch = typeLabel.includes(q);
        if (!nameMatch && !typeMatch) return false;
      }
      if (riskFilter !== "all" && alert.riskLevel !== riskFilter) return false;
      if (locationFilter !== "all" && alert.schoolName !== locationFilter)
        return false;
      if (typeFilter !== "all" && alert.alertType !== typeFilter) return false;
      if (!isWithinTimeRange(alert.createdAt, timeFilter)) return false;
      if (statusFilter !== "all" && alert.status !== statusFilter) return false;
      return true;
    });
  }, [
    alerts,
    search,
    riskFilter,
    locationFilter,
    typeFilter,
    timeFilter,
    statusFilter,
  ]);

  const hasFilters =
    search.trim() !== "" ||
    riskFilter !== "all" ||
    locationFilter !== "all" ||
    typeFilter !== "all" ||
    timeFilter !== "all" ||
    statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setRiskFilter("all");
    setLocationFilter("all");
    setTypeFilter("all");
    setTimeFilter("all");
    setStatusFilter("all");
  }

  return (
    <>
      <AdminSummaryCards summary={summary} />
      <AdminSafetyFilters
        search={search}
        onSearchChange={setSearch}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        locations={locations}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        timeFilter={timeFilter}
        onTimeChange={setTimeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        hasFilters={hasFilters}
        onClear={clearFilters}
        filteredCount={filtered.length}
        totalCount={alerts.length}
      />
      <AlertsTable alerts={filtered} />
    </>
  );
}
