"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "done", label: "Done" },
];

const CREATED_BY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "system", label: "System" },
  { value: "you", label: "You" },
];

type Props = {
  onAddTask?: () => void;
};

export function TasksFilters({ onAddTask }: Props) {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [priority, setPriority] = useQueryState("priority", { defaultValue: "all" });
  const [status, setStatus] = useQueryState("status", { defaultValue: "all" });
  const [createdBy, setCreatedBy] = useQueryState("createdBy", { defaultValue: "all" });

  const selectTriggerClass =
    "h-9 w-[160px] border-gray-200 bg-white font-dm text-sm";
  const selectContentClass =
    "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value || null)}
            placeholder="Search tasks or patients..."
            className="h-9 w-64 pl-9 border-gray-200 font-dm text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 text-gray-500">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? null : v)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setStatus(v === "all" ? null : v)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={createdBy} onValueChange={(v) => setCreatedBy(v === "all" ? null : v)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Created By" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {CREATED_BY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onAddTask && (
        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      )}
    </div>
  );
}
