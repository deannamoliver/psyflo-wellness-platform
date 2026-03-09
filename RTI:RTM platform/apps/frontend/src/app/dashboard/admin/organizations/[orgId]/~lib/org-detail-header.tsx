"use client";

import { Building2, Calendar, Edit, Hash } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/tailwind-utils";
import {
  type OrgStatus,
  STATUS_BADGE_COLORS,
} from "../../~lib/organizations-types";
import type { OrgDetail } from "./org-detail-data";

const STATUS_DOT_COLORS: Record<OrgStatus, string> = {
  Active: "bg-green-500",
  Suspended: "bg-red-500",
  Onboarding: "bg-yellow-500",
  Archived: "bg-gray-400",
};

export function OrgDetailHeader({ org }: { org: OrgDetail }) {
  const status = org.status as OrgStatus;
  const colors = STATUS_BADGE_COLORS[status] ?? {
    bg: "bg-gray-200",
    text: "text-gray-800",
  };
  const dotColor = STATUS_DOT_COLORS[status] ?? "bg-gray-500";

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/admin/organizations"
          className="text-gray-500 transition-colors hover:text-blue-600"
        >
          Organizations
        </Link>
        <span className="text-gray-400">&gt;</span>
        <span className="font-medium text-gray-900">{org.name}</span>
      </nav>

      {/* Blue Banner */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
        <div className="flex items-center gap-5">
          {/* Org Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-white">{org.name}</h1>
            <div className="mt-1.5 flex items-center gap-4 text-blue-100">
              <span className="flex items-center gap-1.5 text-sm">
                <Hash className="h-3.5 w-3.5" />
                {org.code}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Created: {org.createdAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 font-medium text-sm",
              colors.bg,
              colors.text,
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full border-2 border-white/80",
                dotColor,
              )}
            />
            {org.status}
          </span>

          {/* Edit Button */}
          <Link
            href={`/dashboard/admin/organizations/add?orgId=${org.id}`}
            className="flex items-center gap-2 rounded-lg border-2 border-white bg-white px-5 py-2 font-semibold text-blue-600 text-sm transition-colors hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
            Edit Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
