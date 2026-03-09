"use client";

import { AlertTriangle, Info, Loader2, UserPlus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import { Dialog, DialogContent, DialogDescription } from "@/lib/core-ui/dialog";
import { takeOverConversation } from "./actions";
import { TAKEOVER_REASONS, TakeoverReasonSelector } from "./takeover-reasons";

type TakeoverModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handoffId: string;
  coachName: string;
  studentName: string;
};

export function TakeoverModal({
  open,
  onOpenChange,
  handoffId,
  coachName,
  studentName,
}: TakeoverModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const reasonLabel =
    TAKEOVER_REASONS.find((r) => r.id === selectedReason)?.label ?? "";
  const canSubmit = selectedReason !== "";

  function handleTakeover() {
    if (!canSubmit) return;
    const combined = notes.trim()
      ? `${reasonLabel} — ${notes.trim()}`
      : reasonLabel;
    startTransition(async () => {
      await takeOverConversation(handoffId, combined);
      onOpenChange(false);
      setSelectedReason("");
      setNotes("");
    });
  }

  function handleClose() {
    onOpenChange(false);
    setSelectedReason("");
    setNotes("");
  }

  const steps = [
    {
      key: "transfer",
      content: (
        <span>
          The conversation will be transferred from{" "}
          <span className="font-semibold">{coachName}</span>, who will no longer
          have access to the chat conversation (no longer able to send
          messages).
        </span>
      ),
    },
    {
      key: "direct-chat",
      content: (
        <span>
          You will chat directly with{" "}
          <span className="font-semibold">{studentName}</span>.
        </span>
      ),
    },
    {
      key: "no-transition",
      content:
        "Patient will NOT see a transition message explaining the change in support person.",
    },
    {
      key: "closing",
      content:
        "You will be responsible for formally closing the conversation. Note: Notify the student when you plan to close the conversation.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-0 bg-white p-0 font-dm sm:max-w-xl [&>button]:hidden"
        style={{
          fontFamily: "var(--font-dm-sans)",
          scrollbarWidth: "none",
        }}
      >
        <DialogDescription className="sr-only">
          Confirm takeover of conversation from coach
        </DialogDescription>

        {/* Red header */}
        <div className="flex items-center justify-between rounded-t-lg bg-red-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Take Over Conversation</h2>
              <p className="text-red-200 text-sm">
                Clinical Supervisor Intervention
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Warning banner */}
          <div className="rounded-lg border-red-200 border-l-4 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800 text-sm">
                  You are about to take over this conversation
                </p>
                <p className="mt-1 text-red-700 text-sm">
                  This action will immediately transfer control from {coachName}{" "}
                  (Coach) to you. Please review the implications below before
                  proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* What happens section */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
              <Info className="size-4 text-blue-600" />
              What Happens When You Take Over
            </h3>
            <div className="mt-3 space-y-3">
              {steps.map((step, i) => (
                <div
                  key={step.key}
                  className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-xs">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reason for Takeover */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
              Reason for Takeover <span className="text-red-500">*</span>
            </h3>
            <p className="mt-1 text-gray-500 text-sm">
              Select the primary reason for this clinical intervention. This
              information will be included in the session log.
            </p>
            <div className="mt-3">
              <TakeoverReasonSelector
                selectedId={selectedReason}
                onSelect={setSelectedReason}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
              Additional Notes{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context or notes about this takeover decision. This will be included in the session log for documentation purposes."
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-gray-200 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="min-w-[120px] border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTakeover}
            disabled={!canSubmit || isPending}
            className="min-w-[180px] gap-1.5 bg-red-600 text-white hover:bg-red-700"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            <UserPlus className="size-4" />
            Take Over Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
