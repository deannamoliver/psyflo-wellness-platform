"use client";

import { CheckIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ResolveAlertModal } from "@/lib/alerts/resolve-alert-modal";
import { Button } from "@/lib/core-ui/button";
import { changeStudentAlertsStatusAction } from "@/lib/student-alerts/actions";
import type { StudentAlertsGrouped } from "@/lib/student-alerts/types";
import { cn } from "@/lib/tailwind-utils";

export function StudentAlertActions({
  studentData,
}: {
  studentData: StudentAlertsGrouped;
}) {
  const [resolveOpen, setResolveOpen] = useState(false);

  const activeAlertIds = studentData.alerts
    .filter((a) => a.status === "new" || a.status === "in_progress")
    .map((a) => a.id);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {
          changeStudentAlertsStatusAction({
            studentId: studentData.student.id,
            status: "in_progress",
          });
        }}
        className={cn(
          "bg-warning",
          studentData.studentStatus !== "new" && "hidden",
        )}
      >
        <PlayIcon className="size-4" />
        Mark In Progress
      </Button>

      <Button
        onClick={() => setResolveOpen(true)}
        className={cn(
          "bg-success",
          studentData.studentStatus === "resolved" && "hidden",
        )}
      >
        <CheckIcon className="size-4" />
        Mark Resolved
      </Button>

      <Button asChild>
        <Link href={`/dashboard/counselor/students/${studentData.student.id}`}>
          View Patient Profile
        </Link>
      </Button>

      <ResolveAlertModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        alertIds={activeAlertIds}
        student={{
          name: studentData.student.name,
          grade: studentData.student.gradeLevel,
        }}
      />
    </div>
  );
}
