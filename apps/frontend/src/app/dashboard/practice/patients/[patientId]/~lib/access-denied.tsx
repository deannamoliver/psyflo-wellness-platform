"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AccessDenied({ assignedProvider }: { assignedProvider?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-3 font-semibold text-2xl text-gray-900">
          Clinical Access Restricted
        </h1>
        <p className="mb-6 text-gray-600">
          You don't have clinical access to this patient. To view clinical details, ask the assigned provider to add you to this case.
        </p>
        {assignedProvider && (
          <p className="mb-6 rounded-lg bg-gray-50 px-4 py-3 text-gray-700 text-sm">
            <span className="font-medium">Assigned Provider:</span> {assignedProvider}
          </p>
        )}
        <Link
          href="/dashboard/practice/caseloads"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Caseloads
        </Link>
      </div>
    </div>
  );
}
