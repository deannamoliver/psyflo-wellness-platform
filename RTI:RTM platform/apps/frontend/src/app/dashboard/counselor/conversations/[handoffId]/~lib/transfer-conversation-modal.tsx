"use client";

import {
  AlertTriangle,
  ArrowRightLeft,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Dialog, DialogContent } from "@/lib/core-ui/dialog";
import { Textarea } from "@/lib/core-ui/textarea";
import { transferConversation } from "./actions";
import {
  CoachList,
  InfoBox,
  ReasonCheckbox,
  StudentCardActive,
} from "./modal-shared";
import type { ConversationDetail, TransferCoach } from "./types";

const TRANSFER_REASONS = [
  {
    value: "better_specialization",
    label: "Better specialization match",
    desc: "Clinician has expertise student needs",
  },
  {
    value: "clinical_care_required",
    label: "Clinical care required",
    desc: "Beyond wellness coaching scope",
  },
  {
    value: "managing_workload",
    label: "Managing workload/caseload",
    desc: "Rebalancing student assignments",
  },
  {
    value: "availability_conflict",
    label: "Availability/scheduling conflict",
    desc: "Patient needs different hours/days",
  },
  {
    value: "student_requested",
    label: "Patient requested different provider",
    desc: "Patient asked for someone else",
  },
  {
    value: "language_preference",
    label: "Language preference",
    desc: "Patient needs support in different language",
  },
  {
    value: "cultural_identity_match",
    label: "Cultural/identity match",
    desc: "Patient would benefit from shared identity",
  },
  {
    value: "other",
    label: "Other",
    desc: "Other reason not listed here; explain below",
  },
] as const;

const INFO_POINTS = [
  'The conversation will be marked as "Transferred"',
  "The selected coach will be notified immediately",
  "All conversation history and context will be available to them",
  "You will no longer have access to respond or re-open to this conversation",
];

const WARNING_ITEMS = [
  "Ensure all critical information is documented in the transfer notes",
  "If this is a crisis situation, consider whether transfer is appropriate",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationDetail;
  coaches: TransferCoach[];
};

export function TransferConversationModal({
  open,
  onOpenChange,
  conversation,
  coaches,
}: Props) {
  const [selectedCoach, setSelectedCoach] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    selectedCoach && reasons.length > 0 && notes.trim() && !submitting;
  const filtered = coaches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedCoach("");
      setReasons([]);
      setNotes("");
      setSearch("");
    }, 300);
  }

  function toggleReason(value: string) {
    setReasons((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    await transferConversation({
      handoffId: conversation.handoffId,
      transferToCoachId: selectedCoach,
      transferReason: reasons.join(", "),
      transferNotes: notes.trim(),
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
        <div className="flex items-start justify-between rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <ArrowRightLeft className="size-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Transfer Conversation
              </h2>
              <p className="text-blue-100 text-sm">
                Assign this conversation to another coach
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
            title="What happens when you transfer?"
            items={INFO_POINTS}
          />
          <StudentCardActive conversation={conversation} />

          {/* Coach selection */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 text-sm">
              Select Coach/Clinician to Transfer To{" "}
              <span className="text-red-500">*</span>
            </h3>
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <Search className="size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coaches by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <CoachList
              coaches={filtered}
              selected={selectedCoach}
              onSelect={setSelectedCoach}
            />
          </div>

          {/* Transfer Reason */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">
              Reasons for Transfer <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {TRANSFER_REASONS.map((r) => (
                <ReasonCheckbox
                  key={r.value}
                  label={r.label}
                  desc={r.desc}
                  checked={reasons.includes(r.value)}
                  onChange={() => toggleReason(r.value)}
                />
              ))}
            </div>
          </div>

          {/* Transfer Notes */}
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
              Transfer Notes <span className="text-red-500">*</span>
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context for the receiving coach. Include any important details about the student's situation, progress made, concerns, or specific things to be aware of..."
              className="min-h-[100px] resize-none border-gray-200 text-sm"
            />
            <p className="mt-1 text-gray-500 text-xs">
              These notes will help the new coach provide continuity of care.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-[14px] text-amber-800">
              <AlertTriangle className="size-4" /> Important Reminders:
            </div>
            <ul className="space-y-0 text-[12px] text-amber-700">
              {WARNING_ITEMS.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-gray-200 border-t bg-white px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-4" />
            )}
            Transfer Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
