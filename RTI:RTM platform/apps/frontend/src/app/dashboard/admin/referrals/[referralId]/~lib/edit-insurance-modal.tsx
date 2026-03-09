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
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { updateReferralInsurance } from "./referral-detail-actions";
import type { ReferralDetail } from "./referral-detail-data";

const INSURANCE_STATUSES = [
  { value: "has_insurance", label: "Has Insurance" },
  { value: "uninsured", label: "Uninsured" },
  { value: "unknown", label: "Unknown" },
];

function displayToDbInsurance(display: string): string {
  return (
    INSURANCE_STATUSES.find((s) => s.label === display)?.value ?? "unknown"
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
  initialData: ReferralDetail["insurance"];
};

export function EditInsuranceModal({
  open,
  onOpenChange,
  referralId,
  initialData,
}: Props) {
  const [insuranceStatus, setInsuranceStatus] = useState(
    displayToDbInsurance(initialData.status),
  );
  const [provider, setProvider] = useState(
    initialData.provider === "-" ? "" : initialData.provider,
  );
  const [memberId, setMemberId] = useState(
    initialData.memberId === "-" ? "" : initialData.memberId,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await updateReferralInsurance(referralId, {
      insuranceStatus,
      insuranceProvider: provider,
      insuranceMemberId: memberId,
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
            Edit Insurance Information
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Insurance Status
            </Label>
            <Select value={insuranceStatus} onValueChange={setInsuranceStatus}>
              <SelectTrigger className="w-full border-gray-200 bg-white font-dm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white font-dm">
                {INSURANCE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Provider
            </Label>
            <Input
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Insurance provider name"
              className="border-gray-200 bg-white font-dm"
            />
          </div>

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Member ID
            </Label>
            <Input
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Member ID"
              className="border-gray-200 bg-white font-dm"
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
