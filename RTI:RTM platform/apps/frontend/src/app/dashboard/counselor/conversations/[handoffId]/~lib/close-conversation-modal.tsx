"use client";

import { CheckCircle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Dialog, DialogContent } from "@/lib/core-ui/dialog";
import { Textarea } from "@/lib/core-ui/textarea";
import { closeConversation } from "./actions";
import { InfoBox, ReasonRadio, StudentCardActive } from "./modal-shared";
import type { ConversationDetail } from "./types";

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
  conversation: ConversationDetail;
};

export function CloseConversationModal({
  open,
  onOpenChange,
  conversation,
}: Props) {
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
    await closeConversation({
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
          <InfoBox
            title="What happens when you close?"
            items={INFO_POINTS}
            checkmarks
          />
          <StudentCardActive conversation={conversation} />

          {/* Closure Reason */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">
              Closure Reason <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CLOSURE_REASONS.map((r) => (
                <ReasonRadio
                  key={r.value}
                  label={r.label}
                  desc={r.desc}
                  selected={reason === r.value}
                  onSelect={() => setReason(r.value)}
                />
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
