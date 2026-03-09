"use client";

import { CheckCircle, Info, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Dialog, DialogContent } from "@/lib/core-ui/dialog";
import { Textarea } from "@/lib/core-ui/textarea";
import { cn } from "@/lib/tailwind-utils";
import { adminCloseConversation } from "./actions";
import type { AdminConversationDetail } from "./types";

const CLOSURE_REASONS = [
  {
    value: "issue_resolved",
    label: "Issue Resolved - Patient OK",
    desc: "Patient concerns addressed successfully",
  },
  {
    value: "student_stopped_responding",
    label: "Patient Stopped Responding",
    desc: "Patient unresponsive",
  },
  {
    value: "student_had_to_leave",
    label: "Patient Had to Leave",
    desc: "Not outcome-related, just timing",
  },
  {
    value: "other",
    label: "Other",
    desc: "Other reason not listed here; explain below",
  },
] as const;

const INFO_POINTS = [
  'Conversation status changes to "Closed"',
  "Closure entry added to conversation timeline",
  "All documentation is preserved and archived",
  'Conversation moves to "Closed" queue for reference',
  "Can be reopened later if new concerns arise",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: AdminConversationDetail;
};

export function AdminCloseModal({ open, onOpenChange, conversation }: Props) {
  const [reason, setReason] = useState("");
  const [summary, setSummary] = useState("");
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason && summary.trim() && notified && !submitting;

  useEffect(() => {
    if (!open) {
      setReason("");
      setSummary("");
      setNotified(false);
    }
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    await adminCloseConversation({
      handoffId: conversation.handoffId,
      closureReason: reason,
      closingSummary: summary.trim(),
      studentNotified: notified,
    });
    setSubmitting(false);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto border-0 bg-white p-0 font-dm outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="size-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Close Conversation
              </h2>
              <p className="text-blue-100 text-sm">
                Complete this conversation and document final status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-white/80 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 pt-5 pb-4">
          {/* Info box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-[14px] text-blue-800">
              <Info className="size-4" /> What happens when you close?
            </div>
            <ul className="space-y-0 text-[12px] text-blue-700">
              {INFO_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 size-3 shrink-0"
                    viewBox="0 0 11 8"
                    fill="none"
                  >
                    <path
                      d="M10.2814 0.219727C10.5744 0.512695 10.5744 0.988477 10.2814 1.28145L4.28145 7.28145C3.98848 7.57441 3.5127 7.57441 3.21973 7.28145L0.219727 4.28145C-0.0732422 3.98848 -0.0732422 3.5127 0.219727 3.21973C0.512695 2.92676 0.988477 2.92676 1.28145 3.21973L3.75176 5.6877L9.22207 0.219727C9.51504 -0.0732422 9.99082 -0.0732422 10.2838 0.219727H10.2814"
                      fill="#2563EB"
                    />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Student card */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                {conversation.studentInitials}
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-sm">
                  {conversation.studentName}
                </span>
                <p className="text-[11px] text-gray-500">
                  {conversation.gradeLabel} · {conversation.school}
                </p>
              </div>
            </div>
          </div>

          {/* Closure Reason */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">
              Closure Reason <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CLOSURE_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left",
                    reason === r.value
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                      reason === r.value
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300",
                    )}
                  >
                    {reason === r.value && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-xs">
                      {r.label}
                    </div>
                    <div className="text-gray-500 text-xs">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Closing Summary */}
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
              Closing Summary <span className="text-red-500">*</span>
            </h3>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={`Provide a comprehensive summary of this episode...\n\nInclude:\n- Current status of student safety\n- Actions taken during this episode\n- Safety measures or plans in place\n- Follow-up recommendations\n- Any outstanding concerns or next steps`}
              className="min-h-[120px] resize-none border-gray-200 text-sm"
            />
            <p className="mt-1 text-gray-500 text-xs">
              Provide detailed closure notes for audit trail
            </p>
          </div>

          {/* Confirmation */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <Checkbox
              checked={notified}
              onCheckedChange={() => setNotified(!notified)}
            />
            <span className="font-medium text-gray-800 text-sm">
              I confirm that I have notified the student that I am closing the
              conversation.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-gray-200 border-t bg-white px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            Close Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
