"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ArrowRightLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import { getInitials } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import type { ConversationRow, ConversationStatus } from "./data";

const STATUS_CONFIG: Record<
  ConversationStatus,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    icon?: React.ReactNode;
  }
> = {
  needs_coach_reply: {
    label: "Needs Reply",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-600",
  },
  waiting_on_student: {
    label: "Waiting on Patient",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-600",
  },
  closed: {
    label: "Closed",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "",
    icon: <Lock className="size-3 shrink-0" />,
  },
  transferred: {
    label: "Transferred",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "",
    icon: <ArrowRightLeft className="size-3 shrink-0" />,
  },
};

function StatusBadge({ status }: { status: ConversationStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-xs",
        c.bg,
        c.text,
      )}
    >
      {c.icon ?? <span className={cn("size-2 shrink-0 rounded-full", c.dot)} />}
      {c.label}
    </span>
  );
}

type ConversationsTableProps = {
  rows: ConversationRow[];
};

export function ConversationsTable({ rows }: ConversationsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-gray-200 border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Patient
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Last Message
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="h-24 text-center text-gray-500">
                No conversations found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-gray-200 border-b bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Patient
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Last Message
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-gray-100 border-b transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-green-500 font-semibold text-white text-xs">
                      {getInitials(row.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-900">
                        {row.studentName}
                      </span>
                      {row.hasActiveAlert && (
                        <AlertTriangle className="size-3.5 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDistanceToNow(new Date(row.lastMessageAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/counselor/conversations/${row.id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
