"use client";

import {
  CheckCircle2Icon,
  CircleHelpIcon,
  Loader2,
  SendIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Label } from "@/lib/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Textarea } from "@/lib/core-ui/textarea";
import { cn } from "@/lib/tailwind-utils";
import { submitTherapistReferral } from "./refer-therapist-actions";
import { ReferralSuccess } from "./refer-therapist-success";

export type StudentInfo = {
  studentId: string;
  name: string;
  dob: string | null;
  age: number | null;
  grade: number | null;
  schoolName: string | null;
  schoolId: string;
};

const REASONS = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "trauma", label: "Trauma" },
  { value: "behavioral", label: "Behavioral" },
  { value: "family_issues", label: "Family Issues" },
  { value: "grief_loss", label: "Grief/Loss" },
  { value: "self_harm", label: "Self-Harm" },
  { value: "substance_use", label: "Substance Use" },
  { value: "other", label: "Other" },
];

const SERVICES = [
  { value: "individual_therapy", label: "Individual Therapy" },
  { value: "family_therapy", label: "Family Therapy" },
  { value: "psychiatric_services", label: "Psychiatric Services" },
];

const INSURANCE = [
  {
    value: "has_insurance",
    label: "Has Insurance",
    icon: CheckCircle2Icon,
    color: "text-blue-500",
  },
  {
    value: "uninsured",
    label: "Uninsured",
    icon: XCircleIcon,
    color: "text-gray-600",
  },
  {
    value: "unknown",
    label: "Unknown",
    icon: CircleHelpIcon,
    color: "text-gray-400",
  },
];

const NEXT_STEPS = [
  "PsyFlo care coordination team receives your referral immediately",
  "Family is contacted within the specified urgency timeline",
  "You\u2019ll receive email updates on referral status and provider matching",
  "Track progress in the Referrals section of your dashboard",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentInfo;
};

export function ReferTherapistModal({ open, onOpenChange, student }: Props) {
  const [reason, setReason] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [context, setContext] = useState("");
  const [urgency, setUrgency] = useState("");
  const [insurance, setInsurance] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const canSubmit =
    reason && serviceType && urgency && confirmed && !submitting;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setReason("");
      setServiceType("");
      setContext("");
      setUrgency("");
      setInsurance("");
      setConfirmed(false);
      setSubmitted(false);
      setSubmittedAt(null);
      setError(null);
    }, 300);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await submitTherapistReferral({
      studentId: student.studentId,
      schoolId: student.schoolId,
      reason,
      serviceTypes: serviceType ? [serviceType] : [],
      additionalContext: context.trim() || undefined,
      urgency,
      insuranceStatus: insurance || undefined,
      parentNotificationConfirmed: confirmed,
    });
    setSubmitting(false);
    if (result.ok) {
      setSubmittedAt(new Date());
      setSubmitted(true);
    } else setError(result.error ?? "Failed to submit referral");
  };

  if (submitted && submittedAt) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md gap-0 bg-white p-0"
        >
          <ReferralSuccess submittedAt={submittedAt} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  const dobFmt = student.dob
    ? new Date(student.dob).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto bg-white p-0 font-dm"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-bold font-dm text-xl">
            Refer to Therapist
          </DialogTitle>
          <DialogDescription className="font-dm text-gray-500 text-sm">
            This sends a referral request to the PsyFlo care coordination team.
            We&apos;ll reach out to the family to connect them with an
            appropriate provider.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 pt-4 pb-6">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Student Information */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Student Information
              </span>
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 font-medium text-gray-600 text-xs">
                Read-only
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoField label="Name" value={student.name} />
              <InfoField
                label="DOB"
                value={
                  dobFmt
                    ? `${dobFmt}${student.age != null ? ` (Age ${student.age})` : ""}`
                    : "-"
                }
              />
              <InfoField
                label="Grade"
                value={student.grade ? ordinal(student.grade) : "-"}
              />
              <InfoField label="Clinic" value={student.schoolName ?? "-"} />
            </div>
          </div>

          <div className="border-gray-100 border-t" />

          {/* Referral Details */}
          <SectionHeader
            icon={
              <Image
                src="/referral-details-icon.svg"
                alt=""
                width={11}
                height={14}
                className="size-[11px]"
              />
            }
            title="Referral Details"
            haloClassName="rounded-md bg-purple-100 p-1.5"
          />

          <div>
            <FieldLabel required>Reason for Referral</FieldLabel>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full border-gray-200 bg-white font-dm">
                <SelectValue placeholder="Select primary reason" />
              </SelectTrigger>
              <SelectContent className="bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary">
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel required>Service Type</FieldLabel>
            <div className="flex flex-col gap-2">
              {SERVICES.map((s) => (
                <ServiceTypeCard
                  key={s.value}
                  value={s.value}
                  selected={serviceType}
                  onSelect={setServiceType}
                  label={s.label}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Additional Context{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 500))}
              placeholder="Briefly describe concerns or relevant history that would help the care team understand the situation..."
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="mt-1 flex justify-between text-gray-400 text-xs">
              <span>Be specific but concise</span>
              <span>{context.length} / 500</span>
            </div>
          </div>

          <div>
            <FieldLabel required>Urgency Level</FieldLabel>
            <div className="flex flex-col gap-2">
              <UrgencyCard
                value="routine"
                selected={urgency}
                onSelect={setUrgency}
                label="Routine"
                badge="Within 2 weeks"
                badgeClass="bg-green-50 text-green-700"
                desc="Standard referral timeline for non-urgent concerns"
              />
              <UrgencyCard
                value="urgent"
                selected={urgency}
                onSelect={setUrgency}
                label="Urgent"
                badge="48-72 hours"
                badgeClass="bg-amber-50 text-amber-700"
                desc="Needs prompt attention and expedited coordination"
              />
            </div>
          </div>

          <div className="border-gray-100 border-t" />

          {/* Insurance */}
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={
                <Image
                  src="/insurance-info-icon.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5"
                />
              }
              title="Insurance Information"
              haloClassName="rounded-full bg-blue-100 p-1.5"
            />
            <span className="text-gray-400 text-xs">Optional</span>
          </div>
          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Insurance Status
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {INSURANCE.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setInsurance((p) => (p === opt.value ? "" : opt.value))
                  }
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 transition-colors",
                    insurance === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <opt.icon className={cn("h-5 w-5", opt.color)} />
                  <span className="font-medium text-gray-700 text-xs">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-gray-100 border-t" />

          {/* Confirmation */}
          <SectionHeader
            icon={
              <Image
                src="/conf-required-icon.svg"
                alt=""
                width={11}
                height={14}
                className="size-[11px]"
              />
            }
            title="Confirmation Required"
            haloClassName="rounded-full bg-green-100 p-1.5"
          />
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(!!c)}
                className="mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-900 text-sm">
                  I confirm that I have notified the parent/guardian that
                  Feelwell will be reaching out to help coordinate mental health
                  care for their child. <span className="text-red-500">*</span>
                </span>
                <p className="mt-1 text-green-700 text-xs">
                  This confirmation ensures families are prepared for our
                  outreach and helps maintain trust in the referral process.
                </p>
              </div>
            </label>
          </div>

          {/* What happens next */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <InfoIcon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  What happens next?
                </p>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {NEXT_STEPS.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-gray-600 text-xs"
                    >
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-gray-200 border-t bg-white px-6 py-4">
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
            className="flex items-center gap-2 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            Submit Referral
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  haloClassName,
}: {
  icon: React.ReactNode;
  title: string;
  haloClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          haloClassName,
        )}
      >
        {icon}
      </span>
      <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}

function FieldLabel({
  required,
  children,
}: {
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label className="mb-1.5 font-semibold text-gray-700 text-sm">
      {children} {required && <span className="text-red-500">*</span>}
    </Label>
  );
}

function ServiceTypeCard({
  value,
  selected,
  onSelect,
  label,
}: {
  value: string;
  selected: string;
  onSelect: (v: string) => void;
  label: string;
}) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left",
        active
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="font-medium text-gray-700 text-sm">{label}</span>
    </button>
  );
}

function UrgencyCard({
  value,
  selected,
  onSelect,
  label,
  badge,
  badgeClass,
  desc,
}: {
  value: string;
  selected: string;
  onSelect: (v: string) => void;
  label: string;
  badge: string;
  badgeClass: string;
  desc: string;
}) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-left",
        active
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">{label}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium text-xs",
              badgeClass,
            )}
          >
            {badge}
          </span>
        </div>
        <span className="text-gray-500 text-xs">{desc}</span>
      </div>
    </button>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.99982 1C8.44357 1 8.85295 1.23437 9.07795 1.61875L15.8279 13.1187C16.0561 13.5062 16.0561 13.9844 15.8342 14.3719C15.6123 14.7594 15.1967 15 14.7498 15H1.24982C0.802948 15 0.387323 14.7594 0.165448 14.3719C-0.0564269 13.9844 -0.0533019 13.5031 0.171698 13.1187L6.9217 1.61875C7.1467 1.23437 7.55607 1 7.99982 1ZM7.99982 5C7.5842 5 7.24982 5.33437 7.24982 5.75V9.25C7.24982 9.66562 7.5842 10 7.99982 10C8.41545 10 8.74982 9.66562 8.74982 9.25V5.75C8.74982 5.33437 8.41545 5 7.99982 5ZM8.99982 12C8.99982 11.4481 8.55174 11 7.99982 11C7.44791 11 6.99982 11.4481 6.99982 12C6.99982 12.5519 7.44791 13 7.99982 13C8.55174 13 8.99982 12.5519 8.99982 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
