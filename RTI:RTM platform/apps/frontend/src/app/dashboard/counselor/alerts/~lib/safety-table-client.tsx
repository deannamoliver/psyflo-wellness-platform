"use client";

import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import type { SafetyStudentRow } from "@/lib/student-alerts/safety-types";
import { searchParamsParsers } from "./parsers";
import { SafetyTable } from "./safety-table";

const RISK_ORDER = { emergency: 0, high: 1, moderate: 2, low: 3 };
const STATUS_ORDER = { new: 0, in_progress: 1, resolved: 2 };

export function SafetyTableClient({ rows }: { rows: SafetyStudentRow[] }) {
  const [query] = useQueryStates(searchParamsParsers, { shallow: true });

  const filteredRows = useMemo(() => {
    let result = rows;

    // Filter by search (student name)
    const search = query.search.toLowerCase().trim();
    if (search) {
      result = result.filter((row) =>
        row.studentName.toLowerCase().includes(search),
      );
    }

    // Filter by grade level
    if (query.gradeLevel !== "all") {
      const grade = parseInt(query.gradeLevel, 10);
      result = result.filter((row) => row.grade === grade);
    }

    // Filter by risk level
    if (query.riskLevel !== "all") {
      result = result.filter((row) => row.highestRiskLevel === query.riskLevel);
    }

    // Filter by status (multi-select)
    if (query.status.length > 0) {
      result = result.filter((row) => query.status.includes(row.status));
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (query.sort) {
        case "risk_level":
          return (
            (RISK_ORDER[a.highestRiskLevel] ?? 99) -
            (RISK_ORDER[b.highestRiskLevel] ?? 99)
          );
        case "name_asc":
          return a.studentName.localeCompare(b.studentName);
        case "status":
          return (
            (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
          );
        case "most_recent":
        default:
          return (
            new Date(b.latestAlertAt).getTime() -
            new Date(a.latestAlertAt).getTime()
          );
      }
    });

    return result;
  }, [
    rows,
    query.search,
    query.gradeLevel,
    query.riskLevel,
    query.status,
    query.sort,
  ]);

  return <SafetyTable rows={filteredRows} />;
}
