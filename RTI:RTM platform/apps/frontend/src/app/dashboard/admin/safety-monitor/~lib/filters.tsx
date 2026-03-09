"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { ALERT_TYPE_LABELS } from "./types";

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          {selectedLabel}
          <ChevronDownIcon className="size-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:[--item-text:rgb(17,24,39)] [&_[data-slot=dropdown-menu-radio-item]]:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary [&_[data-slot=dropdown-menu-radio-item]]:hover:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:focus:[color:var(--item-text)]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type FiltersProps = {
  search: string;
  onSearchChange: (v: string) => void;
  riskFilter: string;
  onRiskChange: (v: string) => void;
  locationFilter: string;
  onLocationChange: (v: string) => void;
  locations: string[];
  typeFilter: string;
  onTypeChange: (v: string) => void;
  timeFilter: string;
  onTimeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  hasFilters: boolean;
  onClear: () => void;
  filteredCount: number;
  totalCount: number;
};

const ALERT_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  ...Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const TIME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Review" },
  { value: "resolved", label: "Resolved" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All Risk Levels" },
  { value: "emergency", label: "Emergency" },
  { value: "high", label: "High Risk" },
  { value: "moderate", label: "Moderate" },
  { value: "low", label: "Low Risk" },
];

export function AdminSafetyFilters(props: FiltersProps) {
  const locationOptions = [
    { value: "all", label: "All Locations" },
    ...props.locations.map((l) => ({ value: l, label: l })),
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {props.filteredCount}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {props.totalCount}
            </span>{" "}
            alerts
          </p>
        </div>
        <div className="relative">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
          <Input
            placeholder="Search by student name or alert type..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            className="h-10 border-gray-200 bg-white pl-10 font-dm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Risk Level"
            value={props.riskFilter}
            options={RISK_OPTIONS}
            onChange={props.onRiskChange}
          />
          <FilterDropdown
            label="Location"
            value={props.locationFilter}
            options={locationOptions}
            onChange={props.onLocationChange}
          />
          <FilterDropdown
            label="Alert Type"
            value={props.typeFilter}
            options={ALERT_TYPE_OPTIONS}
            onChange={props.onTypeChange}
          />
          <FilterDropdown
            label="Time Range"
            value={props.timeFilter}
            options={TIME_OPTIONS}
            onChange={props.onTimeChange}
          />
          <FilterDropdown
            label="Status"
            value={props.statusFilter}
            options={STATUS_OPTIONS}
            onChange={props.onStatusChange}
          />
          <button
            type="button"
            onClick={props.onClear}
            disabled={!props.hasFilters}
            className={cn(
              "font-medium text-sm",
              props.hasFilters
                ? "text-blue-600 hover:text-blue-800"
                : "cursor-not-allowed text-gray-400",
            )}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
