"use client";

import { CheckIcon, InfoIcon, Loader2, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Dialog, DialogContent } from "@/lib/core-ui/dialog";
import { Textarea } from "@/lib/core-ui/textarea";
import { cn } from "@/lib/tailwind-utils";
import { resolveAlertAction } from "./resolve-alert-action";

const ACTIONS_TAKEN = [
  { value: "contacted_student", label: "Contacted student directly" },
  {
    value: "safety_assessment",
    label: "Conducted safety/risk assessment with student",
  },
  { value: "created_safety_plan", label: "Created safety plan with student" },
  {
    value: "connected_counselor",
    label: "Connected student with school counselor/social worker",
  },
  { value: "contacted_parent", label: "Contacted parent/guardian" },
  { value: "updated_safety_plan", label: "Created/updated safety plan" },
  { value: "referred_external", label: "Referred to external provider" },
  { value: "contacted_911", label: "Contacted emergency services (911)" },
  { value: "notified_admin", label: "Notified school administrator" },
  {
    value: "filed_mandatory_report",
    label: "Filed mandatory report (CPS, etc.)",
  },
  { value: "other_action", label: "Other action" },
] as const;

const STUDENT_STATUSES = [
  { value: "crisis_resolved", label: "Crisis resolved - Student is stable" },
  {
    value: "ongoing_support",
    label: "Ongoing support needed - Counselor will continue monitoring",
  },
  { value: "transferred_external", label: "Transferred to external care" },
  { value: "hospitalized", label: "Hospitalized" },
  { value: "other", label: "Other" },
] as const;

const FOLLOW_UP_PLANS = [
  {
    value: "no_follow_up",
    label: "No follow-up needed - Case is fully resolved",
  },
  { value: "routine_check_ins", label: "Routine wellness check-ins" },
  { value: "scheduled_follow_up", label: "Scheduled follow-up" },
  { value: "other", label: "Other" },
] as const;

const VERIFICATIONS = [
  "All mandatory reporting requirements have been met",
  "Appropriate parties have been notified per protocol",
  "Case documentation is complete and accurate",
  "Student safety has been addressed to the best of my ability",
] as const;

export type ResolveAlertStudentInfo = {
  name: string;
  grade: number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertIds: string[];
  student: ResolveAlertStudentInfo;
  onResolveStart?: () => void;
  onResolveEnd?: () => void;
};

export function ResolveAlertModal({
  open,
  onOpenChange,
  alertIds,
  student,
  onResolveStart,
  onResolveEnd,
}: Props) {
  const router = useRouter();
  const [actions, setActions] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [verifications, setVerifications] = useState<boolean[]>(
    new Array(VERIFICATIONS.length).fill(false),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allVerified = verifications.every(Boolean);
  const canSubmit =
    actions.length > 0 &&
    summary.trim() &&
    studentStatus &&
    followUp &&
    allVerified &&
    !submitting;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setActions([]);
      setSummary("");
      setStudentStatus("");
      setFollowUp("");
      setVerifications(new Array(VERIFICATIONS.length).fill(false));
      setError(null);
    }, 300);
  };

  const toggleAction = (value: string) => {
    setActions((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  };

  const toggleVerification = (index: number) => {
    setVerifications((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    onResolveStart?.();
    try {
      const result = await resolveAlertAction({
        alertIds,
        actionsTaken: actions,
        resolutionSummary: summary.trim(),
        studentStatus,
        followUpPlan: followUp,
      });
      setSubmitting(false);
      if (result.ok) {
        router.refresh();
        // Wait for refresh to complete so resolution report shows before closing
        await new Promise((r) => setTimeout(r, 400));
        handleClose();
      } else {
        setError(result.error ?? "Failed to resolve alert");
        onResolveEnd?.();
      }
    } catch {
      setSubmitting(false);
      onResolveEnd?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto border-0 bg-white p-0 font-dm"
      >
        {/* Green header */}
        <div className="flex items-start justify-between rounded-t-lg bg-green-700 px-6 py-4">
          <div>
            <h2 className="font-bold text-lg text-white">
              Resolve Safety Alert
            </h2>
            <p className="text-green-100 text-sm">
              {student.name}
              {student.grade != null && ` \u2022 Grade ${student.grade}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-white/80 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 pt-5 pb-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Actions Taken */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Actions Taken</h3>
            <p className="mb-3 text-gray-500 text-xs">
              Select all actions you completed
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS_TAKEN.map((action) => (
                <ActionCheckbox
                  key={action.value}
                  label={action.label}
                  checked={actions.includes(action.value)}
                  onChange={() => toggleAction(action.value)}
                />
              ))}
            </div>
          </div>

          {/* Resolution Summary */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Resolution Summary
            </h3>
            <p className="mb-2 text-gray-500 text-xs">
              Document the outcome <span className="text-red-500">*</span>
            </p>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what happened, how it was resolved, and any important context..."
              className="min-h-[100px] resize-none border-gray-200 text-sm"
            />
          </div>

          {/* Student Status */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Student Status</h3>
            <p className="mb-3 text-gray-500 text-xs">
              Current student status after resolution
            </p>
            <div className="flex flex-col gap-2">
              {STUDENT_STATUSES.map((s) => (
                <RadioCard
                  key={s.value}
                  label={s.label}
                  selected={studentStatus === s.value}
                  onSelect={() => setStudentStatus(s.value)}
                />
              ))}
            </div>
          </div>

          {/* Follow-Up Plan */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Follow-Up Plan</h3>
            <p className="mb-3 text-gray-500 text-xs">
              What ongoing support or monitoring is needed?
            </p>
            <div className="flex flex-col gap-2">
              {FOLLOW_UP_PLANS.map((p) => (
                <RadioCard
                  key={p.value}
                  label={p.label}
                  selected={followUp === p.value}
                  onSelect={() => setFollowUp(p.value)}
                />
              ))}
            </div>
          </div>

          {/* Verification */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Verification</h3>
            <p className="mb-3 text-gray-500 text-xs">
              Before resolving this protocol, confirm:
            </p>
            <div className="flex flex-col gap-2">
              {VERIFICATIONS.map((label, i) => (
                <VerificationCheckbox
                  key={label}
                  label={label}
                  checked={verifications[i] ?? false}
                  onChange={() => toggleVerification(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-gray-200 border-t bg-white px-6 py-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <InfoIcon className="h-3.5 w-3.5" />
            <span>
              This resolution will be visible to the submitting coach.
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 bg-green-600 font-medium text-white hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              Resolve &amp; Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5",
        checked
          ? "border-green-300 bg-green-50"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0" />
      <span className="text-gray-700 text-xs leading-tight">{label}</span>
    </label>
  );
}

function RadioCard({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left",
        selected
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="font-medium text-gray-700 text-sm">{label}</span>
    </button>
  );
}

function VerificationCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3",
        checked
          ? "border-green-300 bg-green-50"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0" />
      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}
