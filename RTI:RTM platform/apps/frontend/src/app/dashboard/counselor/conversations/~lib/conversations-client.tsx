"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { ConversationsTable } from "./conversations-table";
import type { ConversationRow, ConversationStatus } from "./data";

const STATUS_OPTIONS: { value: ConversationStatus; label: string }[] = [
  { value: "needs_coach_reply", label: "Needs Reply" },
  { value: "waiting_on_student", label: "Waiting on Patient" },
  { value: "closed", label: "Closed" },
  { value: "transferred", label: "Transferred" },
];

const PAGE_SIZE = 10;

function StatusFilterDropdown({
  selectedStatuses,
  onChange,
}: {
  selectedStatuses: ConversationStatus[];
  onChange: (statuses: ConversationStatus[]) => void;
}) {
  const selectedLabels = STATUS_OPTIONS.filter((o) =>
    selectedStatuses.includes(o.value),
  )
    .map((o) => o.label)
    .join(", ");
  const displayLabel = selectedLabels || "All Statuses";

  function toggleStatus(statusValue: ConversationStatus) {
    if (selectedStatuses.includes(statusValue)) {
      onChange(selectedStatuses.filter((s) => s !== statusValue));
    } else {
      onChange([...selectedStatuses, statusValue]);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hover:!bg-gray-50 hover:!text-gray-700 h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700"
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
            checked={selectedStatuses.includes(option.value)}
            onCheckedChange={() => toggleStatus(option.value)}
            onSelect={(e) => e.preventDefault()}
            className="focus:!bg-secondary/80 focus:!text-gray-900"
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type ConversationsClientProps = {
  conversations: ConversationRow[];
  schools: string[];
};

export function ConversationsClient({
  conversations,
}: ConversationsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    ConversationStatus[]
  >([]);
  const [page, setPage] = useState(0);

  const hasFilters =
    search !== "" ||
    selectedStatuses.length > 0;

  const filtered = useMemo(() => {
    let result = conversations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.studentName.toLowerCase().includes(q) ||
          c.studentCode.toLowerCase().includes(q),
      );
    }
    if (selectedStatuses.length > 0) {
      result = result.filter((c) => selectedStatuses.includes(c.status));
    }
    return result;
  }, [conversations, search, selectedStatuses]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearAll = () => {
    setSearch("");
    setSelectedStatuses([]);
    setPage(0);
  };

  return (
    <div style={{ fontFamily: "var(--font-dm-sans)" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">
          Patient Messages
        </h3>
        <span className="text-gray-500 text-sm">
          Showing {filtered.length} conversations
        </span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
            <Input
              placeholder="Patient name..."
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-10 border-gray-200 bg-white pl-10 font-dm"
            />
          </div>
          <StatusFilterDropdown
            selectedStatuses={selectedStatuses}
            onChange={(statuses) => {
              setSelectedStatuses(statuses);
              setPage(0);
            }}
          />
          <button
            type="button"
            onClick={clearAll}
            disabled={!hasFilters}
            className={cn(
              "font-medium text-sm",
              hasFilters
                ? "text-blue-600 hover:text-blue-800"
                : "cursor-not-allowed text-gray-400",
            )}
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="mt-4">
        <ConversationsTable rows={pageData} />
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <span className="text-gray-500 text-sm">
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              &lt;
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
