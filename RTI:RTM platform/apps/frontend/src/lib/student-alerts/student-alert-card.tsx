"use client";

import { CheckIcon, EyeIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ResolveAlertModal } from "@/lib/alerts/resolve-alert-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { Large, Muted, P, Small } from "@/lib/core-ui/typography";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { getInitials, titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import { changeStudentAlertsStatusAction } from "./actions";
import type { StudentAlertsGrouped } from "./types";

function Badge({ data }: { data: StudentAlertsGrouped }) {
  return (
    <div
      className={cn(
        "rounded-full px-2 py-1 text-xs",
        data.studentStatus === "new" && "bg-destructive/15 text-destructive",
        data.studentStatus === "in_progress" && "bg-warning/15 text-warning",
        data.studentStatus === "resolved" && "bg-success/15 text-success",
      )}
    >
      {titleCase(data.studentStatus, { delimiter: "_" })}
    </div>
  );
}

function Summary({ data }: { data: StudentAlertsGrouped }) {
  if (data.studentStatus === "resolved") {
    return null;
  }

  // Show summary from the most recent filtered alert if it exists
  const latestFilteredAlert =
    data.filteredAlerts.length > 0
      ? data.filteredAlerts.reduce((latest, current) =>
          current.createdAt > latest.createdAt ? current : latest,
        )
      : null;

  if (!latestFilteredAlert?.summary) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md p-4",
        data.studentStatus === "new" && "bg-destructive/15 text-destructive",
        data.studentStatus === "in_progress" && "bg-warning/15 text-warning",
      )}
    >
      <P className="text-sm">Alert Details:</P>
      <P className="mt-2 text-sm">{latestFilteredAlert.summary}</P>
    </div>
  );
}

export function StudentAlertCard({
  data,
  className,
}: {
  data: StudentAlertsGrouped;
  className?: string;
}) {
  const [resolveOpen, setResolveOpen] = useState(false);

  const activeAlertIds = data.filteredAlerts
    .filter((a) => a.status === "new" || a.status === "in_progress")
    .map((a) => a.id);

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-l-4 bg-white",
        data.studentStatus === "new" && "border-l-destructive",
        data.studentStatus === "in_progress" && "border-l-warning",
        data.studentStatus === "resolved" && "border-l-success",
        className,
      )}
    >
      <CardHeader className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage src={data.student.avatar ?? undefined} />
          <AvatarFallback>{getInitials(data.student.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/counselor/students/${data.student.id}`}>
              <Large className="font-normal">{data.student.name}</Large>
            </Link>
            <Badge data={data} />
          </div>
          <div className="flex items-center gap-1">
            <Muted>Grade {data.student.gradeLevel}</Muted>

            {data.student.room && (
              <>
                <Muted>•</Muted>
                <Muted>Room {data.student.room}</Muted>
              </>
            )}

            {data.student.code && (
              <>
                <Muted>•</Muted>
                <Muted>ID: {data.student.code}</Muted>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <p className="font-normal text-muted-foreground text-xs">Created</p>
          <p className="font-normal text-muted-foreground text-xs">
            <Timestamp
              value={data.latestCreatedAt}
              format="MMM d, yyyy, h:mm a"
            />
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-grow flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Muted>Risk Alerts ({data.filteredAlertCount})</Muted>
        </div>

        {data.filteredSourcesAndTypes.map((sourceAndTypes) => (
          <div key={sourceAndTypes.source} className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Muted>Source</Muted>
              <Small className="font-normal">
                {titleCase(sourceAndTypes.source, { delimiter: "_" })}
              </Small>
            </div>
            <div className="flex flex-col gap-1">
              <Muted>Alert Types</Muted>
              <Small className="font-normal">
                {sourceAndTypes.alertTypes
                  .map((type) => titleCase(type, { delimiter: "_" }))
                  .join(", ")}
              </Small>
            </div>
          </div>
        ))}

        <Summary data={data} />

        {/* Student action buttons - same pattern as original AlertCardActions */}
        <div className="mt-auto ml-auto flex items-center gap-2">
          <Button
            onClick={() => {
              changeStudentAlertsStatusAction({
                studentId: data.student.id,
                status: "in_progress",
              });
            }}
            className={cn(
              "bg-warning",
              data.studentStatus !== "new" && "hidden",
            )}
          >
            <PlayIcon className="size-4" />
            Mark In Progress
          </Button>

          <Button
            onClick={() => setResolveOpen(true)}
            className={cn(
              "bg-success",
              data.studentStatus === "resolved" && "hidden",
            )}
          >
            <CheckIcon className="size-4" />
            Mark Resolved
          </Button>

          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/counselor/alerts/student/${data.student.id}`}
            >
              <EyeIcon className="size-4" />
              View Details
            </Link>
          </Button>

          <ResolveAlertModal
            open={resolveOpen}
            onOpenChange={setResolveOpen}
            alertIds={activeAlertIds}
            student={{
              name: data.student.name,
              grade: data.student.gradeLevel,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
