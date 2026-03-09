"use client";

import type { alertStatusEnum } from "@feelwell/database";
import { CheckIcon, EyeIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import { changeAlertStatusAction } from "./actions";
import AddNoteButton from "./add-note-button";
import {
  ResolveAlertModal,
  type ResolveAlertStudentInfo,
} from "./resolve-alert-modal";

export function AlertCardActions({
  data,
  className,
}: {
  data: {
    id: string;
    status: (typeof alertStatusEnum.enumValues)[number];
    student: ResolveAlertStudentInfo;
  };
  className?: string;
}) {
  const [resolveOpen, setResolveOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        onClick={() => {
          changeAlertStatusAction({
            alertId: data.id,
            status: "in_progress",
          });
        }}
        className={cn("bg-warning", data.status !== "new" && "hidden")}
      >
        <PlayIcon className="size-4" />
        Mark In Progress
      </Button>

      <Button
        onClick={() => setResolveOpen(true)}
        className={cn("bg-success", data.status === "resolved" && "hidden")}
      >
        <CheckIcon className="size-4" />
        Mark Resolved
      </Button>

      <AddNoteButton
        alertId={data.id}
        className={cn(data.status !== "in_progress" && "hidden")}
      />

      <Button variant="outline" asChild>
        <Link href={`/dashboard/counselor/alerts/${data.id}`}>
          <EyeIcon className="size-4" />
          View Details
        </Link>
      </Button>

      <ResolveAlertModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        alertIds={[data.id]}
        student={data.student}
      />
    </div>
  );
}
