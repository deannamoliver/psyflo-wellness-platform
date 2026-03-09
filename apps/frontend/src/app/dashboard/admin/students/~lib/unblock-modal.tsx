"use client";

import { CheckCircle2, ChevronDownIcon } from "lucide-react";
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
import { unblockStudent } from "../[studentId]/~lib/block-student-actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
};

const UNBLOCK_REASONS = [
  { value: "resolved", label: "Issue Resolved" },
  { value: "appeal_approved", label: "Appeal Approved" },
  { value: "duration_expired", label: "Block Duration Expired" },
  {
    value: "counselor_recommendation",
    label: "Provider Recommendation",
  },
  { value: "parent_request", label: "Parent/Guardian Request" },
  { value: "other", label: "Other (specify below)" },
];

export function UnblockModal({ open, onOpenChange, studentId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const isValid = reason !== "";

  function handleUnblock() {
    if (!isValid) return;
    startTransition(async () => {
      await unblockStudent({ studentId, reason, notes });
      onOpenChange(false);
      router.refresh();
    });
  }

  function handleReset() {
    setReason("");
    setNotes("");
  }

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-5 text-green-600" />
            </div>
            <DialogTitle className="font-semibold text-gray-900 text-lg">
              Unblock Student
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-800 text-sm">
            Restoring access will allow the student to use the platform again,
            including chat, check-ins, and assessments.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Unblock Reason <span className="text-red-500">*</span>
            </label>
            <SelectDropdown
              value={reason}
              onChange={setReason}
              placeholder="Select a reason"
              options={UNBLOCK_REASONS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-gray-700 text-sm">
              Internal Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal notes about this unblock action..."
              className="min-h-[80px] resize-none border-gray-200 bg-white font-dm"
              rows={3}
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
            onClick={handleUnblock}
            disabled={!isValid || isPending}
            className="gap-2 bg-green-600 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? "Unblocking..." : "Confirm Unblock"}
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
