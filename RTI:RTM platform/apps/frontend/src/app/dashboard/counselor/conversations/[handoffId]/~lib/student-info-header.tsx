"use client";

import { differenceInYears, format } from "date-fns";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import type { ConversationDetail } from "./types";

type StudentInfoHeaderProps = {
  conversation: ConversationDetail;
};

export function StudentInfoHeader({ conversation }: StudentInfoHeaderProps) {
  const age = conversation.dateOfBirth
    ? differenceInYears(new Date(), new Date(conversation.dateOfBirth))
    : null;

  const dobDisplay = conversation.dateOfBirth
    ? `${format(new Date(conversation.dateOfBirth), "MMMM d, yyyy")}${age != null ? ` (${age} years old)` : ""}`
    : "N/A";

  return (
    <div className="border-gray-200 border-b bg-white px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-gray-900 text-xl">
              {conversation.studentName}
            </h1>
            <span className="rounded-md bg-gray-200 px-3 py-1 font-medium text-gray-900 text-xs">
              {conversation.gradeLabel}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-12 gap-y-1 text-sm lg:grid-cols-4">
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                DOB/Age
              </span>
              <p className="text-gray-900">{dobDisplay}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Email
              </span>
              <p className="text-gray-900">{conversation.email ?? "N/A"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Grade
              </span>
              <p className="text-gray-900">{conversation.gradeLabel}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Home Address
              </span>
              <p className="text-gray-900">
                {conversation.homeAddress?.trim() || "-"}
              </p>
            </div>
          </div>
        </div>

        <Link href={`/dashboard/counselor/students/${conversation.studentId}`}>
          <Button
            variant="outline"
            className="gap-2 border-blue-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
          >
            <User className="size-4" />
            View Patient Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
