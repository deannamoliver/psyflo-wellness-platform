"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import type { StaffMember } from "./location-detail-data";

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "text-blue-600 bg-blue-100",
  Provider: "text-green-600 bg-green-100",
  "Clinical Supervisor": "text-purple-600 bg-purple-100",
  Therapist: "text-amber-600 bg-amber-100",
};

export function StaffTable({
  rows,
  onView,
}: {
  rows: StaffMember[];
  onView: (member: StaffMember) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
        No staff members found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              User
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Role
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Location(s)
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Email
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
          {rows.map((member, i) => (
            <TableRow
              key={`${member.id}-${i}`}
              className="border-gray-100 border-b transition-colors hover:bg-gray-50"
            >
              <TableCell className="px-6 py-4">
                <div className="font-medium text-gray-900">{member.name}</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 font-semibold text-xs",
                    ROLE_COLORS[member.role] ?? "bg-blue-100 text-blue-700",
                  )}
                >
                  {member.role}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {member.locations.join(", ")}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {member.email}
              </TableCell>
              <TableCell className="px-4 py-4">
                <span className="flex items-center gap-1.5 text-sm">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      member.status === "Active"
                        ? "bg-green-500"
                        : "bg-gray-400",
                    )}
                  />
                  {member.status}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onView(member)}
                  className="font-medium text-blue-600 text-sm hover:text-blue-800"
                >
                  View
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
