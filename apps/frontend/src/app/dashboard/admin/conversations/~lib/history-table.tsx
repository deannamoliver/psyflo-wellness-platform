"use client";

import { Clock } from "lucide-react";
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
import type { HistorySessionRow } from "./data";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_COLORS = {
  completed: { bg: "bg-green-100", text: "text-green-700" },
  transferred: { bg: "bg-amber-100", text: "text-amber-700" },
} as const;

const DEFAULT_COLORS = STATUS_COLORS.completed;

type Props = {
  rows: HistorySessionRow[];
  totalHistory: number;
};

export function HistoryTable({ rows, totalHistory }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white font-dm text-gray-500 shadow-sm">
        No conversation history found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <div className="flex items-center gap-3 border-gray-200 border-b px-6 py-4">
        <Clock className="size-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-lg">
          Conversation History
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 text-xs">
          {totalHistory} Total
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
              Therapist
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Duration
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((session) => {
            const colors =
              STATUS_COLORS[session.status as keyof typeof STATUS_COLORS] ??
              DEFAULT_COLORS;
            return (
              <TableRow
                key={session.id}
                className={cn(
                  "border-b transition-colors",
                  session.hasActiveSafetyReview
                    ? "border-red-200 bg-red-50 hover:bg-red-100"
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
                  {session.coachName}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(session.startedAt)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatTime(session.startedAt)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-gray-600">
                  {session.duration}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-full px-3 py-1 font-semibold text-xs capitalize",
                      colors.bg,
                      colors.text,
                    )}
                  >
                    {session.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Link
                    href={`/dashboard/admin/conversations/${session.id}`}
                    className="font-medium text-blue-600 text-sm hover:text-blue-800"
                  >
                    View Details
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
