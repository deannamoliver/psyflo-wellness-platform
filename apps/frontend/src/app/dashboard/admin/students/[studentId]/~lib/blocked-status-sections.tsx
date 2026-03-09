"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { UnblockModal } from "../../~lib/unblock-modal";

type Props = {
  studentId: string;
  studentName: string;
  blockedReason: string | null;
  blockedExplanation: string | null;
  blockedAt: Date | null;
  blockedDuration: string | null;
};

const REASON_LABELS: Record<string, string> = {
  policy_violation: "Policy Violation/Misuses",
  inappropriate_language: "Inappropriate Language",
  harassment: "Harassment or Bullying",
  school_parent_request: "Clinic/Parent Request",
  under_investigation: "Under Investigation",
  admin_bulk_action: "Admin Bulk Action",
  other: "Other",
};

const DURATION_LABELS: Record<string, string> = {
  indefinite: "Indefinite",
  "1_week": "1 Week",
  "2_weeks": "2 Weeks",
  "1_month": "1 Month",
};

export function BlockedStatusSections({
  studentId,
  studentName,
  blockedReason,
  blockedExplanation,
  blockedAt,
  blockedDuration,
}: Props) {
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Blocked Status Card */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="size-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-red-800">
              Student Currently Blocked
            </h3>
            <p className="mt-1 text-red-700 text-sm">
              {studentName} has been blocked from accessing the platform.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <span className="font-medium text-red-600 text-xs uppercase tracking-wider">
                  Reason
                </span>
                <p className="mt-0.5 font-medium text-red-800 text-sm">
                  {REASON_LABELS[blockedReason ?? ""] ??
                    blockedReason ??
                    "Not specified"}
                </p>
              </div>
              <div>
                <span className="font-medium text-red-600 text-xs uppercase tracking-wider">
                  Blocked Since
                </span>
                <p className="mt-0.5 font-medium text-red-800 text-sm">
                  {blockedAt
                    ? blockedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
              <div>
                <span className="font-medium text-red-600 text-xs uppercase tracking-wider">
                  Duration
                </span>
                <p className="mt-0.5 font-medium text-red-800 text-sm">
                  {DURATION_LABELS[blockedDuration ?? ""] ??
                    blockedDuration ??
                    "Permanent"}
                </p>
              </div>
            </div>
            {blockedExplanation && (
              <div className="mt-3">
                <span className="font-medium text-red-600 text-xs uppercase tracking-wider">
                  Explanation
                </span>
                <p className="mt-0.5 text-red-700 text-sm">
                  {blockedExplanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unblock Card */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-green-800">
                Ready to Unblock Student?
              </h3>
              <p className="mt-1 text-green-700 text-sm">
                Restoring access will allow the student to use the platform
                again.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setUnblockModalOpen(true)}
            className="gap-2 bg-green-600 font-medium text-white hover:bg-green-700"
          >
            <AlertTriangle className="size-4" />
            Unblock Student
          </Button>
        </div>
      </div>

      <UnblockModal
        open={unblockModalOpen}
        onOpenChange={setUnblockModalOpen}
        studentId={studentId}
      />
    </div>
  );
}
