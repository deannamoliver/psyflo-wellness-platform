"use client";

import { AlertTriangle, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Textarea } from "@/lib/core-ui/textarea";
import { blockStudent } from "../[studentId]/~lib/block-student-actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentIds: string[];
  onComplete: () => void;
};

const BLOCK_REASONS = [
  { value: "policy_violation", label: "Policy Violation/Misuses" },
  { value: "inappropriate_language", label: "Inappropriate Language" },
  { value: "harassment", label: "Harassment or Bullying" },
  { value: "school_parent_request", label: "Clinic/Parent Request" },
  { value: "under_investigation", label: "Under Investigation" },
  { value: "other", label: "Other (specify below)" },
];

const BLOCK_DURATIONS = [
  { value: "indefinite", label: "Indefinite (until manually unblocked)" },
  { value: "1_week", label: "1 Week" },
  { value: "2_weeks", label: "2 Weeks" },
  { value: "1_month", label: "1 Month" },
];

export function BulkBlockModal({
  open,
  onOpenChange,
  studentIds,
  onComplete,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [duration, setDuration] = useState("indefinite");
  const [notes, setNotes] = useState("");
  const [confirmNecessary, setConfirmNecessary] = useState(false);
  const [confirmDocumented, setConfirmDocumented] = useState(false);
  const [confirmAccess, setConfirmAccess] = useState(false);

  const allConfirmed = confirmNecessary && confirmDocumented && confirmAccess;
  const isValid = reason !== "" && explanation.trim() !== "" && allConfirmed;

  function handleBlock() {
    if (!isValid) return;
    const reasonLabel =
      BLOCK_REASONS.find((r) => r.value === reason)?.label ?? reason;
    startTransition(async () => {
      await Promise.all(
        studentIds.map((studentId) =>
          blockStudent({
            studentId,
            reason: reasonLabel,
            explanation,
            duration,
            notes,
          }),
        ),
      );
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  function handleReset() {
    setReason("");
    setExplanation("");
    setDuration("indefinite");
    setNotes("");
    setConfirmNecessary(false);
    setConfirmDocumented(false);
    setConfirmAccess(false);
  }

  const count = studentIds.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) handleReset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white font-dm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <DialogTitle className="font-semibold text-gray-900 text-lg">
              Block {count} Student{count !== 1 && "s"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-800 text-sm">
            Blocking{" "}
            <strong>
              {count} student{count !== 1 && "s"}
            </strong>{" "}
            will immediately prevent them from accessing the platform, including
            chat, check-ins, and assessments. This action can be reversed.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Block Reason <span className="text-red-500">*</span>
            </label>
            <SelectDropdown
              value={reason}
              onChange={setReason}
              placeholder="Select a reason"
              options={BLOCK_REASONS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Detailed Explanation <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide a detailed explanation for blocking these students..."
              className="min-h-[80px] resize-none border-gray-200 bg-white font-dm"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Block Duration
            </label>
            <SelectDropdown
              value={duration}
              onChange={setDuration}
              placeholder="Select duration"
              options={BLOCK_DURATIONS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Internal Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal notes (not visible to students)..."
              className="min-h-[80px] resize-none border-gray-200 bg-white font-dm"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium text-gray-700 text-sm">
              Please confirm the following:
            </p>
            <ConfirmCheckbox
              checked={confirmNecessary}
              onChange={setConfirmNecessary}
              label="I confirm that blocking these students is necessary"
            />
            <ConfirmCheckbox
              checked={confirmDocumented}
              onChange={setConfirmDocumented}
              label="I have documented the reason for this action"
            />
            <ConfirmCheckbox
              checked={confirmAccess}
              onChange={setConfirmAccess}
              label="I understand the students will lose access"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-gray-200 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlock}
            disabled={!isValid || isPending}
            className="gap-2 bg-red-600 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending
              ? `Blocking ${count} Student${count !== 1 ? "s" : ""}...`
              : `Block ${count} Student${count !== 1 ? "s" : ""} Now`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SelectDropdown({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {selectedLabel}
          </span>
          <ChevronDownIcon className="size-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-gray-900 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ConfirmCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
      />
      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}
