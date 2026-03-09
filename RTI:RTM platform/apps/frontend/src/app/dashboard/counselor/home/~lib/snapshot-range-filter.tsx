"use client";

import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useQueryStates } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { searchParamsParsers } from "./parsers";

const SNAPSHOT_RANGE_OPTIONS = [
  { value: "latest", label: "Latest per student" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
];

export function SnapshotRangeFilter() {
  const [filters, setFilters] = useQueryStates(searchParamsParsers);
  const [isPending, startTransition] = useTransition();
  const value = filters.snapshotRange ?? "latest";

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      )}
      <Select
        value={value}
        onValueChange={(v) =>
          startTransition(() => {
            setFilters(
              { snapshotRange: searchParamsParsers.snapshotRange.parse(v) },
              { shallow: false },
            );
          })
        }
      >
        <SelectTrigger className="w-[190px] border-gray-200 bg-white font-medium text-gray-700 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {SNAPSHOT_RANGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
