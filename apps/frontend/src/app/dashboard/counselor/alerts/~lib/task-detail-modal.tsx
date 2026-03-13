"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { PRIORITY_CONFIG, STATUS_CONFIG, type Task, type TaskStatus } from "./task-types";

type AssessmentData = {
  type: "PHQ-9" | "GAD-7" | "PHQ-A";
  totalScore: number;
  maxScore: number;
  completionRate: number;
  completedAt: Date;
  riskLevel: "emergency" | "high" | "moderate" | "low";
  questions: Array<{
    number: number;
    text: string;
    response: string;
    score: number;
    flagged?: boolean;
  }>;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  assessmentData?: AssessmentData;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
};

const RISK_COLORS = {
  emergency: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  high: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  moderate: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
};

export function TaskDetailModal({ isOpen, onClose, task, assessmentData, onStatusChange }: Props) {
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  if (!isOpen || !task) return null;

  const isSafetyAlert = task.source === "safety_alert" || (task.createdBy === "system" && task.sourceAlertId);
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    if (!onStatusChange) return;
    setUpdating(true);
    setSelectedStatus(newStatus);
    try {
      await onStatusChange(task.id, newStatus);
      onClose();
    } finally {
      setUpdating(false);
      setSelectedStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 text-white",
          isSafetyAlert 
            ? "bg-gradient-to-r from-red-600 to-orange-600" 
            : "bg-gradient-to-r from-blue-600 to-indigo-600"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
              {isSafetyAlert ? <ShieldAlert className="size-5" /> : <FileText className="size-5" />}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{task.title}</h2>
              <p className="text-white/80 text-sm">
                {task.patientName} {task.patientCode ? `• ${task.patientCode}` : ""}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="hover:text-white/80">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-gray-500 text-xs mb-1">Priority</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
                priorityConfig.bg, priorityConfig.text
              )}>
                <span className={cn("size-1.5 rounded-full", priorityConfig.dot)} />
                {priorityConfig.label}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-gray-500 text-xs mb-1">Status</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
                statusConfig.bg, statusConfig.text
              )}>
                <span className={cn("size-1.5 rounded-full", statusConfig.dot)} />
                {statusConfig.label}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-gray-500 text-xs mb-1">Created</p>
              <p className="text-gray-900 text-sm font-medium">
                {formatDistanceToNow(task.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>

          {task.description && (
            <div>
              <p className="text-gray-500 text-xs mb-1">Description</p>
              <p className="text-gray-700 text-sm">{task.description}</p>
            </div>
          )}

          {/* Safety Alert Assessment Details */}
          {isSafetyAlert && assessmentData && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className={cn(
                "flex items-center justify-between px-4 py-3",
                RISK_COLORS[assessmentData.riskLevel].bg
              )}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("size-5", RISK_COLORS[assessmentData.riskLevel].text)} />
                  <span className={cn("font-semibold", RISK_COLORS[assessmentData.riskLevel].text)}>
                    {assessmentData.type} Assessment
                  </span>
                </div>
                <span className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold uppercase",
                  RISK_COLORS[assessmentData.riskLevel].bg,
                  RISK_COLORS[assessmentData.riskLevel].text,
                  RISK_COLORS[assessmentData.riskLevel].border,
                  "border"
                )}>
                  {assessmentData.riskLevel} Risk
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Assessment Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-2xl font-bold text-gray-900">
                      {assessmentData.totalScore}/{assessmentData.maxScore}
                    </p>
                    <p className="text-gray-500 text-xs">Total Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-2xl font-bold text-gray-900">
                      {assessmentData.completionRate}%
                    </p>
                    <p className="text-gray-500 text-xs">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      {format(assessmentData.completedAt, "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(assessmentData.completedAt, "h:mm a")}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">Completed</p>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <p className="font-medium text-gray-700 text-sm mb-3">Assessment Responses</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {assessmentData.questions.map((q) => (
                      <div
                        key={q.number}
                        className={cn(
                          "rounded-lg border p-3",
                          q.flagged 
                            ? "border-red-200 bg-red-50" 
                            : "border-gray-100 bg-gray-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-gray-600 text-xs mb-1">Q{q.number}</p>
                            <p className="text-gray-900 text-sm">{q.text}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                              q.flagged 
                                ? "bg-red-100 text-red-700" 
                                : "bg-gray-200 text-gray-700"
                            )}>
                              {q.score}
                            </span>
                          </div>
                        </div>
                        <p className={cn(
                          "mt-2 text-sm font-medium",
                          q.flagged ? "text-red-700" : "text-gray-700"
                        )}>
                          {q.response}
                          {q.flagged && (
                            <span className="ml-2 text-red-600 text-xs">⚠ Flagged Response</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="size-4" />
              <span className="text-sm">
                Due: {format(task.dueDate, "MMMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <p className="text-gray-500 text-xs mb-1">Notes</p>
              <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{task.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            <X className="size-4" /> Close
          </button>
          
          <div className="flex items-center gap-2">
            {task.status !== "done" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusUpdate("done")}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-sm text-white hover:bg-green-700 disabled:opacity-60"
              >
                {updating && selectedStatus === "done" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Mark Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
