"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "@/lib/core-ui/button";

type Props = {
  submittedAt: Date;
  onClose: () => void;
};

export function AdminReferralSuccess({ submittedAt, onClose }: Props) {
  const formatted =
    submittedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    submittedAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="flex flex-col items-center px-8 py-10 font-dm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckIcon className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="mb-2 font-bold text-gray-900 text-xl">
        Referral Submitted
      </h2>
      <p className="mb-6 text-center text-gray-500 text-sm">
        The Feelwell care team has been notified and will reach out to the
        family within 24-48 hours.
      </p>

      <div className="mb-6 w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Submitted:</span>
          <span className="font-semibold text-gray-900">{formatted}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Submitted
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={onClose}
        className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        Close
      </Button>
    </div>
  );
}
