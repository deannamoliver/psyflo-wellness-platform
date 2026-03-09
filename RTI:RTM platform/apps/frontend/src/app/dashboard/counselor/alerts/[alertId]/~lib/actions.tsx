"use client";

import type { alertStatusEnum } from "@feelwell/database";
import { CheckIcon, PlayIcon } from "lucide-react";
import { changeAlertStatusAction } from "@/lib/alerts/actions";
import AddNoteButton from "@/lib/alerts/add-note-button";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";

export default function Actions({
  data,
  className,
}: {
  data: {
    id: string;
    status: (typeof alertStatusEnum.enumValues)[number];
  };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        className={cn("bg-warning", data.status !== "new" && "hidden")}
        onClick={() => {
          changeAlertStatusAction({
            alertId: data.id,
            status: "in_progress",
          });
        }}
      >
        <PlayIcon className="size-4" />
        Mark In Progress
      </Button>

      <Button
        className={cn("bg-success", data.status === "resolved" && "hidden")}
        onClick={() => {
          changeAlertStatusAction({
            alertId: data.id,
            status: "resolved",
          });
        }}
      >
        <CheckIcon className="size-4" />
        Mark Resolved
      </Button>

      <AddNoteButton
        alertId={data.id}
        className={cn(data.status !== "in_progress" && "hidden")}
      />
    </div>
  );
}
