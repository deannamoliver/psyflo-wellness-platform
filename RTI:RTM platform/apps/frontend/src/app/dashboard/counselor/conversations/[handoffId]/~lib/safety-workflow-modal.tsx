"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Dialog, DialogOverlay, DialogPortal } from "@/lib/core-ui/dialog";
import { cn } from "@/lib/tailwind-utils";
import type { ConversationStatus } from "./types";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

type SafetyWorkflowModalProps = {
  open: boolean;
  onClose: () => void;
  onActivate: () => Promise<void>;
  studentName: string;
  studentGrade: string;
  schoolName: string;
  dateOfBirth?: string | null;
  status?: ConversationStatus;
};

export function SafetyWorkflowModal({
  open,
  onClose,
  onActivate,
  studentName,
  studentGrade,
  schoolName,
  dateOfBirth,
  status,
}: SafetyWorkflowModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);

  const age =
    dateOfBirth != null
      ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / MS_PER_YEAR)
      : null;
  const subtext = [
    age != null ? `Age ${age}` : null,
    studentGrade !== "N/A" ? studentGrade : null,
    schoolName,
  ]
    .filter(Boolean)
    .join(" · ");

  function handleActivate() {
    if (!acknowledged) return;
    startTransition(async () => {
      await onActivate();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl bg-white font-dm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                  <AlertTriangle className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">
                    Safety Workflow
                  </h2>
                  <p className="text-red-100 text-sm">
                    Starts the safety protocol and records this event in the
                    audit log
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* What happens section */}
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src="/emergency-icon.svg"
                    alt=""
                    className="size-4 shrink-0"
                  />
                  <span className="font-bold text-[14px] text-gray-900">
                    What happens when you activate this?
                  </span>
                </div>
                <ul className="space-y-1.5 pl-6 text-[12px]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-red-600" />
                    <span>
                      A <strong>Safety Toolkit</strong> will activate with
                      safety protocols and emergency contacts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-red-600" />
                    <span>
                      <strong>Stay with the student</strong> - Continue
                      providing support until protocol is complete
                    </span>
                  </li>
                </ul>
              </div>

              {/* When to use section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src="/emergency-icon.svg"
                    alt=""
                    className="size-4 shrink-0"
                  />
                  <p className="font-bold text-[14px] text-gray-900">
                    When to use:
                  </p>
                </div>
                <ul className="space-y-1.5 pl-6 text-[12px]">
                  {[
                    "Suicidal ideation or self-harm thoughts",
                    "Patient has plan or means to harm self",
                    "Immediate safety concerns or danger",
                    "Severe emotional distress or crisis state",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Student info — same styling as StudentCardActive in other modals */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                    {studentName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {studentName}
                    </span>
                    {subtext ? (
                      <p className="text-[11px] text-gray-500">{subtext}</p>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 text-xs">
                  {status === "waiting_on_student"
                    ? "Waiting on Patient"
                    : "Active"}
                </span>
              </div>

              {/* Acknowledgment */}
              <div className="rounded-lg border border-gray-200 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={acknowledged}
                    onCheckedChange={(c) => setAcknowledged(c === true)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-sm">
                      I understand the safety protocol{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      I will remain engaged with the patient, and use the Safety
                      Protocol Toolkit resources. I will not close this
                      conversation or leave the patient unsupported.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-gray-100 border-t px-6 py-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1 bg-red-600 text-white hover:bg-red-700",
                  !acknowledged && "cursor-not-allowed opacity-50",
                )}
                onClick={handleActivate}
                disabled={!acknowledged || isPending}
              >
                Activate Safety Workflow
              </Button>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
