"use client";

import { MessageSquare } from "lucide-react";
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
import type { LiveSessionRow } from "./data";

function formatTimeAgo(isoDate: string): { relative: string; time: string } {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const totalMin = Math.floor(diffMs / 60000);

  let relative: string;
  if (totalMin < 1) {
    relative = "Just now";
  } else {
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const minutes = totalMin % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    relative = `${parts.join(" ")} ago`;
  }

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { relative, time };
}

type Props = {
  rows: LiveSessionRow[];
  totalActive: number;
};

export function LiveSessionsTable({ rows, totalActive }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white font-dm text-gray-500 shadow-sm">
        No active sessions found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <div className="flex items-center gap-3 border-gray-200 border-b px-6 py-4">
        <MessageSquare className="size-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 text-lg">
          Live Sessions
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs">
          <span className="size-2 rounded-full bg-green-500" />
          {totalActive} Active
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Patient
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Organization
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Location
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Therapist
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Started
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((session) => {
            const { relative, time } = formatTimeAgo(session.startedAt);
            return (
              <TableRow
                key={session.id}
                className={cn(
                  "border-b transition-colors",
                  session.hasActiveSafetyReview
                    ? "border-red-200 bg-red-50 hover:bg-red-100"
                    : session.coachIsAdmin
                      ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      : "border-gray-100 hover:bg-gray-50",
                )}
              >
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.studentName}
                    </p>
                    {session.studentGrade != null && (
                      <p className="text-gray-500 text-sm">
                        Grade {session.studentGrade}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-gray-600">
                  {session.organization}
                </TableCell>
                <TableCell className="px-4 py-4 text-gray-600">
                  {session.location}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    {session.coachIsAdmin && (
                      <span className="size-2.5 shrink-0 rounded-full bg-blue-600" />
                    )}
                    <span
                      className={
                        session.coachIsAdmin
                          ? "font-semibold text-gray-900"
                          : ""
                      }
                    >
                      {session.coachName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{relative}</p>
                    <p className="text-gray-500 text-sm">{time}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Link
                    href={`/dashboard/admin/conversations/${session.id}`}
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
