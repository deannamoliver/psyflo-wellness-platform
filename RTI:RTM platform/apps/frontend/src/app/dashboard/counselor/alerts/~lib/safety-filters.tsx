"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { searchParamsParsers } from "./parsers";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Review" },
  { value: "resolved", label: "Resolved" },
] as const;

function StatusMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedLabels = STATUS_OPTIONS.filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(", ");
  const displayLabel = selectedLabels || "All Statuses";

  function toggleStatus(statusValue: string) {
    if (value.includes(statusValue)) {
      onChange(value.filter((s) => s !== statusValue));
    } else {
      onChange([...value, statusValue]);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[140px] bg-white font-dm [&_[data-slot=dropdown-menu-checkbox-item]]:py-3 [&_[data-slot=dropdown-menu-checkbox-item]]:pr-4 [&_[data-slot=dropdown-menu-checkbox-item]]:pl-9 [&_[data-slot=dropdown-menu-checkbox-item]]:text-gray-900 [&_[data-slot=dropdown-menu-checkbox-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-checkbox-item]]:focus:bg-secondary"
      >
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={() => toggleStatus(option.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

export function SafetyFilters({ className }: { className?: string }) {
  const [query, setQuery] = useQueryStates(searchParamsParsers, {
    shallow: true,
  });

  const hasActiveFilters =
    query.gradeLevel !== "all" ||
    query.riskLevel !== "all" ||
    query.status.length > 0 ||
    query.sort !== "most_recent" ||
    query.search !== "";

  function handleClearAll() {
    setQuery({
      gradeLevel: "all",
      riskLevel: "all",
      status: [],
      sort: "most_recent",
      search: "",
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
          <Input
            placeholder="Search by patient name or alert type..."
            value={query.search}
            onChange={(e) => setQuery({ search: e.target.value })}
            className="h-10 border-gray-200 bg-white pl-10 font-dm"
          />
        </div>
        <FilterDropdown
          label="Risk Level"
          value={query.riskLevel}
          options={[
            { value: "all", label: "All Risk Levels" },
            { value: "emergency", label: "Emergency" },
            { value: "high", label: "High" },
            { value: "moderate", label: "Moderate" },
            { value: "low", label: "Low" },
          ]}
          onChange={(value) =>
            setQuery({
              riskLevel: searchParamsParsers.riskLevel.parse(value),
            })
          }
        />
        <StatusMultiSelect
          value={query.status}
          onChange={(value) =>
            setQuery({
              status: value as ("new" | "in_progress" | "resolved")[],
            })
          }
        />
        <FilterDropdown
          label="Sort"
          value={query.sort}
          options={[
            { value: "most_recent", label: "Sort by: Most Recent" },
            { value: "risk_level", label: "Sort by: Risk Level" },
            { value: "name_asc", label: "Sort by: Name (A-Z)" },
            { value: "status", label: "Sort by: Status" },
          ]}
          onChange={(value) =>
            setQuery({
              sort: searchParamsParsers.sort.parse(value),
            })
          }
        />
        <button
          type="button"
          onClick={handleClearAll}
          disabled={!hasActiveFilters}
          className={cn(
            "font-medium text-sm",
            hasActiveFilters
              ? "text-blue-600 hover:text-blue-800"
              : "cursor-not-allowed text-gray-400",
          )}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
