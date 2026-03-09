"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import type { DateRange, StatusFilter } from "./types";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all_time", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
];

function StatusRadio({
  value,
  label,
  count,
  isSelected,
  onSelect,
}: {
  value: StatusFilter;
  label: string;
  count: number;
  isSelected: boolean;
  onSelect: (value: StatusFilter) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-dm text-gray-700 text-sm">
      <input
        type="radio"
        name="status"
        value={value}
        checked={isSelected}
        onChange={() => onSelect(value)}
        className="h-4 w-4 border-gray-300 text-primary accent-primary"
      />
      {label} ({count})
    </label>
  );
}

export function ConversationsFilters({
  statusFilter,
  dateRange,
  totalCount,
  activeCount,
  closedCount,
  filteredCount,
  onStatusChange,
  onDateRangeChange,
}: {
  statusFilter: StatusFilter;
  dateRange: DateRange;
  totalCount: number;
  activeCount: number;
  closedCount: number;
  filteredCount: number;
  onStatusChange: (value: StatusFilter) => void;
  onDateRangeChange: (value: DateRange) => void;
}) {
  const selectedDateLabel =
    DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "All Time";

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-primary px-3 py-1 font-dm font-medium text-white text-xs">
          {filteredCount} conversation{filteredCount !== 1 ? "s" : ""}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4">
            <StatusRadio
              value="all"
              label="All"
              count={totalCount}
              isSelected={statusFilter === "all"}
              onSelect={onStatusChange}
            />
            <StatusRadio
              value="active"
              label="Active"
              count={activeCount}
              isSelected={statusFilter === "active"}
              onSelect={onStatusChange}
            />
            <StatusRadio
              value="closed"
              label="Closed"
              count={closedCount}
              isSelected={statusFilter === "closed"}
              onSelect={onStatusChange}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              >
                {selectedDateLabel}
                <ChevronDownIcon className="size-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:[--item-text:rgb(17,24,39)] [&_[data-slot=dropdown-menu-radio-item]]:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary [&_[data-slot=dropdown-menu-radio-item]]:hover:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:focus:[color:var(--item-text)]"
            >
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={(v) => onDateRangeChange(v as DateRange)}
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
