"use client";

import { ArrowLeft, Loader2, SendIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
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
import {
  type StudentSearchResult,
  submitAdminReferral,
} from "./admin-referral-actions";
import {
  FieldLabel,
  REASONS,
  SERVICES,
  SectionHeader,
  ServiceTypeCard,
  UrgencyCard,
} from "./admin-referral-form-fields";
import {
  ConfirmationBox,
  InsuranceSelector,
  NextStepsBox,
  StudentInfoCard,
} from "./admin-referral-form-sections";
import { AdminReferralSuccess } from "./admin-referral-success";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSearchResult;
  onBack: () => void;
};

export function AdminReferralForm({
  open,
  onOpenChange,
  student,
  onBack,
}: Props) {
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

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await submitAdminReferral({
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
          <AdminReferralSuccess
            submittedAt={submittedAt}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto bg-white p-0 font-dm"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeft className="size-4" />
            </button>
            <DialogTitle className="font-bold font-dm text-xl">
              Refer to Therapist
            </DialogTitle>
          </div>
          <DialogDescription className="font-dm text-gray-500 text-sm">
            This sends a referral request to the PsyFlo care coordination team.
            We&apos;ll reach out to the family to connect them with an
            appropriate provider.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 pt-4 pb-6">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <StudentInfoCard student={student} />
          <div className="border-gray-100 border-t" />

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
              placeholder="Briefly describe concerns or relevant history..."
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
          <InsuranceSelector value={insurance} onChange={setInsurance} />

          <div className="border-gray-100 border-t" />

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
          <ConfirmationBox
            confirmed={confirmed}
            onCheckedChange={setConfirmed}
          />
          <NextStepsBox />
        </div>

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
