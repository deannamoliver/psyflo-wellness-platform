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
import type { StudentRecord } from "./location-detail-data";

export function StudentsTable({ rows }: { rows: StudentRecord[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
        No students found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Student
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Student ID
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Grade
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Alert Status
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((student) => (
            <TableRow
              key={student.id}
              className={cn(
                "border-gray-100 border-b transition-colors hover:bg-gray-50",
                student.alertStatus && "bg-red-50/50",
              )}
            >
              <TableCell className="px-6 py-4">
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-gray-500 text-xs">{student.email}</div>
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {student.studentId}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600">
                {student.grade}
              </TableCell>
              <TableCell className="px-4 py-4">
                {student.alertStatus && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {student.alertStatus}
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-4">
                <button
                  type="button"
                  className="font-medium text-blue-600 text-sm hover:text-blue-800"
                >
                  View Profile
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
