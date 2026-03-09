"use client";

import { Calendar, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import type { Task, TaskPriority } from "./task-types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void | Promise<void>;
  patients: Array<{ id: string; name: string; code?: string }>;
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-700 border-blue-200" },
];

export function AddTaskModal({ isOpen, onClose, onSave, patients }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [patientId, setPatientId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleSave = async () => {
    if (!title.trim() || !patientId) return;
    
    setSaving(true);
    try {
      await onSave({
        patientId,
        patientName: selectedPatient?.name ?? "",
        patientCode: selectedPatient?.code,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: "todo",
        createdBy: "you",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPatientId("");
    setPriority("medium");
    setDueDate("");
    setNotes("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Add New Task</h2>
              <p className="text-blue-100 text-sm">Create a task for patient follow-up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="hover:text-white/80"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6">
          {/* Task Title */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 border-gray-200"
              placeholder="e.g., Follow up on missed appointment"
            />
          </div>

          {/* Patient Selection */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add details about this task..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    priority === opt.value
                      ? opt.color
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Due Date <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Internal Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add any internal notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
            >
              <X className="size-4" /> Cancel
            </button>
            <button
              type="button"
              disabled={saving || !title.trim() || !patientId}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
