"use client";

import {
  ClipboardList,
  Mail,
  Pencil,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { EditInsuranceModal } from "./edit-insurance-modal";
import { EditReferralModal } from "./edit-referral-modal";
import type { ReferralDetail } from "./referral-detail-data";

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: "bg-orange-100", text: "text-orange-700" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700" },
  Connected: { bg: "bg-green-100", text: "text-green-700" },
  Closed: { bg: "bg-gray-100", text: "text-gray-600" },
};

const URGENCY_BADGE: Record<string, { bg: string; text: string }> = {
  Routine: { bg: "bg-blue-100", text: "text-blue-700" },
  Urgent: { bg: "bg-orange-100", text: "text-orange-700" },
};

const INSURANCE_BADGE: Record<string, { bg: string; text: string }> = {
  "Has Insurance": { bg: "bg-green-100", text: "text-green-700" },
  Uninsured: { bg: "bg-red-100", text: "text-red-700" },
  Unknown: { bg: "bg-gray-100", text: "text-gray-600" },
};

function Badge({
  label,
  config,
}: {
  label: string;
  config: { bg: string; text: string };
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 font-semibold text-xs",
        config.bg,
        config.text,
      )}
    >
      {label}
    </span>
  );
}

export function ParentInfoSection({
  parent,
}: {
  parent: ReferralDetail["parent"];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-purple-600" />
        <h2 className="font-semibold text-gray-900 text-lg">
          Parent/Guardian Information
        </h2>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Guardian Name
          </p>
          <p className="mt-1 font-medium text-gray-900 text-sm">
            {parent.guardianName}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Relationship
          </p>
          <p className="mt-1 font-medium text-gray-900 text-sm">
            {parent.relationship}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Phone
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-gray-900 text-sm">
            <Phone className="size-3.5 text-gray-400" />
            {parent.phone}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Email
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-gray-900 text-sm">
            <Mail className="size-3.5 text-gray-400" />
            {parent.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ReferralDetailsSection({
  referral,
  referralId,
}: {
  referral: ReferralDetail["referral"];
  referralId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const statusConfig = STATUS_BADGE[referral.status] ?? {
    bg: "bg-orange-100",
    text: "text-orange-700",
  };
  const urgencyConfig = URGENCY_BADGE[referral.urgency] ?? {
    bg: "bg-blue-100",
    text: "text-blue-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Referral Details
          </h2>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </button>
      </div>
      <EditReferralModal
        open={editOpen}
        onOpenChange={setEditOpen}
        referralId={referralId}
        initialData={referral}
      />
      <div className="mt-5 space-y-4">
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Current Status
          </p>
          <div className="mt-1.5">
            <Badge label={referral.status} config={statusConfig} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Reason for Referral
          </p>
          <div className="mt-1.5">
            <Badge
              label={referral.reason}
              config={{ bg: "bg-blue-100", text: "text-blue-700" }}
            />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Urgency Level
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge label={referral.urgency} config={urgencyConfig} />
            <span className="text-gray-500 text-sm">
              {referral.urgencyDescription}
            </span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Additional Context
          </p>
          <div className="mt-1.5 rounded-lg bg-gray-50 p-4 text-gray-700 text-sm leading-relaxed">
            {referral.additionalContext}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsuranceSection({
  insurance,
  referralId,
}: {
  insurance: ReferralDetail["insurance"];
  referralId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const statusConfig = INSURANCE_BADGE[insurance.status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Insurance Information
          </h2>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </button>
      </div>
      <EditInsuranceModal
        open={editOpen}
        onOpenChange={setEditOpen}
        referralId={referralId}
        initialData={insurance}
      />
      <div className="mt-5 grid grid-cols-3 gap-x-8">
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Insurance Status
          </p>
          <div className="mt-1.5">
            <Badge label={insurance.status} config={statusConfig} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Insurance Provider
          </p>
          <p className="mt-1 font-medium text-gray-900 text-sm">
            {insurance.provider}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Member ID
          </p>
          <p className="mt-1 text-gray-900 text-sm">{insurance.memberId}</p>
        </div>
      </div>
    </div>
  );
}
