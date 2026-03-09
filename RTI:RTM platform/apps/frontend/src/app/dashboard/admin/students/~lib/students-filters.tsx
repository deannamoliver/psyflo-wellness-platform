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
import { SORT_OPTIONS, STATUS_OPTIONS } from "./students-data";

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
          className="h-10 min-w-[120px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          {selectedLabel}
          <ChevronDownIcon className="size-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "bg-white font-dm",
          "[&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9",
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

export type StudentsFiltersState = {
  search: string;
  school: string;
  district: string;
  grade: string;
  status: string;
  sortBy: string;
};

type Props = {
  filters: StudentsFiltersState;
  onFilterChange: (key: keyof StudentsFiltersState, value: string) => void;
  onReset: () => void;
  schools: string[];
  districts: string[];
};

export function StudentsFilters({
  filters,
  onFilterChange,
  onReset,
  schools,
  districts,
}: Props) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.school !== "all" ||
    filters.district !== "all" ||
    filters.grade !== "all" ||
    filters.status !== "all" ||
    filters.sortBy !== "recently-added";

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">
          Search & Filter Clients
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
          Reset Filters
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-500 text-xs">
            Search Client
          </span>
          <div className="relative">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
            <Input
              placeholder="Search by all"
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="h-10 w-[180px] border-gray-200 bg-white pl-10 font-dm"
            />
          </div>
        </div>
        <FilterColumn
          label="Clinic"
          value={filters.school}
          allLabel="All Clinics"
          options={schools}
          onChange={(v) => onFilterChange("school", v)}
        />
        <FilterColumn
          label="Region"
          value={filters.district}
          allLabel="All Regions"
          options={districts}
          onChange={(v) => onFilterChange("district", v)}
        />
        <FilterColumn
          label="Status"
          value={filters.status}
          allLabel="All Status"
          options={STATUS_OPTIONS}
          onChange={(v) => onFilterChange("status", v)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-500 text-xs">Sort By</span>
          <FilterDropdown
            label="Recently Added"
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(v) => onFilterChange("sortBy", v)}
          />
        </div>
      </div>
    </div>
  );
}

function FilterColumn({
  label,
  value,
  allLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  allLabel: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium text-gray-500 text-xs">{label}</span>
      <FilterDropdown
        label={allLabel}
        value={value}
        options={[
          { value: "all", label: allLabel },
          ...options.map((o) => ({ value: o, label: o })),
        ]}
        onChange={onChange}
      />
    </div>
  );
}
