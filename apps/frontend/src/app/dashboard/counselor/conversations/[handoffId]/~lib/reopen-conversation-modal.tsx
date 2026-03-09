"use client";

import { AlertTriangle, FolderOpen, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Dialog, DialogContent } from "@/lib/core-ui/dialog";
import { Textarea } from "@/lib/core-ui/textarea";
import { reopenConversation } from "./actions";
import { getStudentSubtext, InfoBox, ReasonRadio } from "./modal-shared";
import type { ConversationDetail } from "./types";

const REOPEN_REASONS = [
  {
    value: "forgot_to_share_info",
    label: "Forgot to share important information",
    desc: "Resources, next steps, clarification",
  },
  {
    value: "new_information",
    label: "New information received",
    desc: "Provider callback, parent update, etc.",
  },
  {
    value: "student_sent_followup",
    label: "Patient sent follow-up message",
    desc: "Patient messaged after closure",
  },
  {
    value: "accidentally_closed",
    label: "Accidentally closed conversation",
    desc: "Premature or incorrect closure",
  },
  {
    value: "followup_question",
    label: "Follow-up question needed",
    desc: "Realized need clarification on something",
  },
  {
    value: "other",
    label: "Other",
    desc: "Other reason not listed here; explain below",
  },
] as const;

const INFO_POINTS = [
  'Conversation moves from "Closed" to your active queue',
  "All previous documentation remains accessible",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationDetail;
};

export function ReopenConversationModal({
  open,
  onOpenChange,
  conversation,
}: Props) {
  const [reason, setReason] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason && context.trim() && !submitting;

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setReason("");
      setContext("");
    }, 300);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    await reopenConversation({
      handoffId: conversation.handoffId,
      reopenReason: reason,
      reopenContext: context.trim(),
    });
    setSubmitting(false);
    handleClose();
  }

  const studentSubtext = getStudentSubtext(conversation);

  const closedDate = conversation.closedAt
    ? new Date(conversation.closedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const startedDate = new Date(conversation.startedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto border-0 bg-white p-0 font-dm outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between rounded-t-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <FolderOpen className="size-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Reopen Conversation
              </h2>
              <p className="text-green-100 text-sm">
                Resume monitoring or intervention for a closed conversation
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
            title="What happens when you reopen?"
            items={INFO_POINTS}
            variant="blue"
            checkmarks
          />

          {/* Student card with dates */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                  {conversation.studentInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {conversation.studentName}
                    </span>
                    {conversation.hasAlert && (
                      <AlertTriangle className="size-4 text-red-500" />
                    )}
                  </div>
                  {studentSubtext && (
                    <p className="text-[11px] text-gray-500">
                      {studentSubtext}
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 font-medium text-gray-600 text-xs">
                Closed
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-gray-500">Conversation Started</div>
                <div className="font-medium text-gray-900">{startedDate}</div>
              </div>
              {closedDate && (
                <div>
                  <div className="text-gray-500">Closed On</div>
                  <div className="font-medium text-gray-900">{closedDate}</div>
                </div>
              )}
              {conversation.closedByName && (
                <div>
                  <div className="text-gray-500">Closed By</div>
                  <div className="font-medium text-gray-900">
                    {conversation.closedByName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">
              Reason for Reopening <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {REOPEN_REASONS.map((r) => (
                <ReasonRadio
                  key={r.value}
                  label={r.label}
                  desc={r.desc}
                  selected={reason === r.value}
                  onSelect={() => setReason(r.value)}
                  color="green"
                />
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
              Additional Context <span className="text-red-500">*</span>
            </h3>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={`Explain why this conversation needs to be reopened...\n\nInclude:\n- What has changed since closure\n- New information or concerns\n- Specific actions needed\n- Expected timeline for resolution`}
              className="min-h-[120px] resize-none border-gray-200 text-sm"
            />
            <p className="mt-1 text-gray-500 text-xs">
              Provide clear justification for reopening
            </p>
          </div>
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
            className="gap-2 bg-green-600 text-white hover:bg-green-700"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FolderOpen className="size-4" />
            )}
            Reopen Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
