"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { updateReferralDetails } from "./referral-detail-actions";
import type { ReferralDetail } from "./referral-detail-data";

const STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "in_progress", label: "In Progress" },
  { value: "matched", label: "Connected" },
  { value: "completed", label: "Closed" },
];

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

const URGENCIES = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
];

function displayToDbStatus(display: string): string {
  return STATUSES.find((s) => s.label === display)?.value ?? "submitted";
}
function displayToDbReason(display: string): string {
  return REASONS.find((r) => r.label === display)?.value ?? "other";
}
function displayToDbUrgency(display: string): string {
  return URGENCIES.find((u) => u.label === display)?.value ?? "routine";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
  initialData: ReferralDetail["referral"];
};

export function EditReferralModal({
  open,
  onOpenChange,
  referralId,
  initialData,
}: Props) {
  const [status, setStatus] = useState(displayToDbStatus(initialData.status));
  const [reason, setReason] = useState(displayToDbReason(initialData.reason));
  const [urgency, setUrgency] = useState(
    displayToDbUrgency(initialData.urgency),
  );
  const [context, setContext] = useState(initialData.additionalContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await updateReferralDetails(referralId, {
      status,
      reason,
      urgency,
      additionalContext: context,
    });
    setSaving(false);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.error ?? "Failed to save.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white font-dm">
        <DialogHeader>
          <DialogTitle className="font-bold font-dm text-lg">
            Edit Referral Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full border-gray-200 bg-white font-dm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white font-dm">
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Reason
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full border-gray-200 bg-white font-dm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white font-dm">
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Urgency
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="w-full border-gray-200 bg-white font-dm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white font-dm">
                {URGENCIES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Additional Context
            </Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Additional context..."
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
