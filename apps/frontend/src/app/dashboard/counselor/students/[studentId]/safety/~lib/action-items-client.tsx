"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type ActionItem = {
  id: string;
  title: string;
  description: string;
  type: "follow_up" | "documentation" | "outreach" | "review";
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  dueDate: Date | null;
  createdAt: Date;
  completedAt: Date | null;
};

type ActionItemsClientProps = {
  patientId: string;
};

// Mock data for action items
const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: "a1",
    title: "Follow up on medication adherence",
    description: "Patient mentioned difficulty remembering to take medication. Discuss reminder strategies.",
    type: "follow_up",
    priority: "high",
    status: "pending",
    dueDate: new Date(2026, 2, 12),
    createdAt: new Date(2026, 2, 7),
    completedAt: null,
  },
  {
    id: "a2",
    title: "Complete treatment plan update",
    description: "Update treatment goals based on recent progress. Include new coping strategies discussed.",
    type: "documentation",
    priority: "medium",
    status: "pending",
    dueDate: new Date(2026, 2, 15),
    createdAt: new Date(2026, 2, 5),
    completedAt: null,
  },
  {
    id: "a3",
    title: "Contact parent/guardian",
    description: "Schedule call to discuss patient's progress and home support strategies.",
    type: "outreach",
    priority: "medium",
    status: "pending",
    dueDate: new Date(2026, 2, 14),
    createdAt: new Date(2026, 2, 6),
    completedAt: null,
  },
  {
    id: "a4",
    title: "Review PHQ-9 results",
    description: "Analyze latest screening results and adjust treatment approach if needed.",
    type: "review",
    priority: "low",
    status: "completed",
    dueDate: new Date(2026, 2, 8),
    createdAt: new Date(2026, 2, 1),
    completedAt: new Date(2026, 2, 8),
  },
];

const TYPE_CONFIG = {
  follow_up: { icon: Phone, label: "Follow Up", bg: "bg-blue-50", text: "text-blue-700" },
  documentation: { icon: FileText, label: "Documentation", bg: "bg-violet-50", text: "text-violet-700" },
  outreach: { icon: MessageSquare, label: "Outreach", bg: "bg-emerald-50", text: "text-emerald-700" },
  review: { icon: Clock, label: "Review", bg: "bg-amber-50", text: "text-amber-700" },
};

const PRIORITY_CONFIG = {
  high: { label: "High", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  low: { label: "Low", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
};

const STATUS_CONFIG = {
  pending: { icon: Circle, label: "Pending", bg: "bg-gray-100", text: "text-gray-600" },
  completed: { icon: CheckCircle2, label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export function ActionItemsClient({ patientId }: ActionItemsClientProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    type: "follow_up" as ActionItem["type"],
    priority: "medium" as ActionItem["priority"],
    dueDate: "",
  });

  const filteredItems = MOCK_ACTION_ITEMS.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const pendingCount = MOCK_ACTION_ITEMS.filter((i) => i.status === "pending").length;
  const completedCount = MOCK_ACTION_ITEMS.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
          <p className="text-sm text-gray-500">Tasks and follow-ups for this patient</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {([
          { key: "all" as const, label: "All", count: undefined },
          { key: "pending" as const, label: "Pending", count: pendingCount },
          { key: "completed" as const, label: "Completed", count: completedCount },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                filter === key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="rounded-xl border bg-white">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No action items found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredItems.map((item) => {
              const typeConfig = TYPE_CONFIG[item.type];
              const priorityConfig = PRIORITY_CONFIG[item.priority];
              const statusConfig = STATUS_CONFIG[item.status];
              const TypeIcon = typeConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <div key={item.id} className="px-4 py-4 hover:bg-gray-50/50">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", typeConfig.bg)}>
                      <TypeIcon className={cn("h-4 w-4", typeConfig.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", typeConfig.bg, typeConfig.text)}>
                          {typeConfig.label}
                        </span>
                        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", priorityConfig.bg, priorityConfig.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", priorityConfig.dot)} />
                          {priorityConfig.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", statusConfig.bg, statusConfig.text)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {format(item.dueDate, "MMM d, yyyy")}
                          </span>
                        )}
                        <span>Created: {format(item.createdAt, "MMM d, yyyy")}</span>
                        {item.completedAt && (
                          <span className="text-emerald-600">Completed: {format(item.completedAt, "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                    {item.status !== "completed" && (
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Action Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Action Item</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddModal(false);
                setNewItem({ title: "", description: "", type: "follow_up", priority: "medium", dueDate: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Action item title..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Details about this action item..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ActionItem["type"] })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="follow_up">Follow Up</option>
                    <option value="documentation">Documentation</option>
                    <option value="outreach">Outreach</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as ActionItem["priority"] })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
