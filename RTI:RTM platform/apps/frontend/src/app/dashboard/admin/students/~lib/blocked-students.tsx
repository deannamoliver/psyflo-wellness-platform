"use client";

import { AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import type { BlockedStudent } from "./students-data";

function BlockedStudentCard({
  student,
  onUnblock,
}: {
  student: BlockedStudent;
  onUnblock: (studentId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <User className="size-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
          <p className="text-gray-500 text-xs">
            {student.school} &bull; {student.grade}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-gray-500 text-xs">{student.blockedAgo}</p>
          <p className="font-medium text-red-600 text-xs">
            Reason: {student.reason}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUnblock(student.id)}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700"
        >
          Unblock
        </button>
        <Link
          href={`/dashboard/admin/students/${student.id}`}
          className="rounded-md border border-gray-200 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

type Props = {
  blockedStudents: BlockedStudent[];
  blockedCount: number;
  onUnblock: (studentId: string) => void;
};

export function BlockedStudentsSection({
  blockedStudents,
  blockedCount,
  onUnblock,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Blocked Clients
            </h3>
            <p className="text-gray-500 text-sm">
              {blockedCount} clients currently blocked from platform access
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {blockedStudents.map((student) => (
          <BlockedStudentCard
            key={student.id}
            student={student}
            onUnblock={onUnblock}
          />
        ))}
      </div>
    </div>
  );
}
