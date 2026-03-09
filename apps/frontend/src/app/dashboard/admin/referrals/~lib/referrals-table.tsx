"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import {
  type AdminReferral,
  formatDate,
  STATUS_DOT_CONFIG,
  URGENCY_BADGE_CONFIG,
} from "./referrals-data";

type Props = {
  rows: AdminReferral[];
};

export function ReferralsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white font-dm text-gray-500 shadow-sm">
        No referrals found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Student
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Organization
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Urgency
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Submitted
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((referral) => {
            const urgencyConfig = URGENCY_BADGE_CONFIG[referral.urgency];
            const statusConfig = STATUS_DOT_CONFIG[referral.status];
            const dateInfo = formatDate(referral.submittedAt);
            return (
              <TableRow
                key={referral.id}
                className="border-gray-100 border-b transition-colors hover:bg-gray-50"
              >
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.studentName}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Age {referral.studentAge}, Grade {referral.studentGrade}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-gray-600 text-sm">
                  {referral.organization}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-full px-3 py-1 font-medium text-xs",
                      urgencyConfig.bg,
                      urgencyConfig.text,
                    )}
                  >
                    {referral.urgency}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs",
                      statusConfig.bg,
                      statusConfig.text,
                    )}
                  >
                    <span
                      className={cn("size-2 rounded-full", statusConfig.dot)}
                    />
                    {referral.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="text-gray-900 text-sm">{dateInfo.date}</p>
                    <p className="text-gray-500 text-sm">{dateInfo.time}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Link
                    href={`/dashboard/admin/referrals/${referral.id}`}
                    className="font-medium text-blue-600 text-sm hover:text-blue-800"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
