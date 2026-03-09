"use client";

import { ChevronDownIcon, RefreshCw, SearchIcon } from "lucide-react";
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

type FiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  orgFilter: string;
  onOrgFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  coachFilter: string;
  onCoachFilterChange: (value: string) => void;
  onReset: () => void;
  organizations: string[];
  locations: string[];
  coaches: string[];
};

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
        className={cn(
          "bg-white font-dm",
          "[&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9",
          "[&_[data-slot=dropdown-menu-radio-item]]:text-gray-900 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary",
        )}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ConversationsFilters({
  search,
  onSearchChange,
  orgFilter,
  onOrgFilterChange,
  locationFilter,
  onLocationFilterChange,
  coachFilter,
  onCoachFilterChange,
  onReset,
  organizations,
  locations,
  coaches,
}: FiltersProps) {
  const hasActiveFilters =
    search !== "" ||
    orgFilter !== "all" ||
    locationFilter !== "all" ||
    coachFilter !== "all";

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
          Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className={cn(
            "flex items-center gap-1.5 font-medium text-sm",
            hasActiveFilters
              ? "text-blue-600 hover:text-blue-800"
              : "cursor-not-allowed text-gray-400",
          )}
        >
          <RefreshCw className="size-3.5" />
          Reset All
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="relative min-w-[280px] flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 border-gray-200 bg-white pl-10 font-dm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-500 text-xs">
            Organization
          </span>
          <FilterDropdown
            label="All Organizations"
            value={orgFilter}
            options={[
              { value: "all", label: "All Organizations" },
              ...organizations.map((o) => ({ value: o, label: o })),
            ]}
            onChange={onOrgFilterChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-500 text-xs">Location</span>
          <FilterDropdown
            label="All Locations"
            value={locationFilter}
            options={[
              { value: "all", label: "All Locations" },
              ...locations.map((l) => ({ value: l, label: l })),
            ]}
            onChange={onLocationFilterChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-500 text-xs">Therapist</span>
          <FilterDropdown
            label="All Therapists"
            value={coachFilter}
            options={[
              { value: "all", label: "All Therapists" },
              ...coaches.map((c) => ({ value: c, label: c })),
            ]}
            onChange={onCoachFilterChange}
          />
        </div>
      </div>
    </div>
  );
}
