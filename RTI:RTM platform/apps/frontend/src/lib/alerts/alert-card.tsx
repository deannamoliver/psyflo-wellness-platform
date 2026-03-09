import type {
  alertResolvedByEnum,
  alertSourceEnum,
  alertStatusEnum,
  alertTypeEnum,
} from "@feelwell/database";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { Large, Muted, P, Small } from "@/lib/core-ui/typography";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { getInitials, titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import { AlertCardActions } from "./alert-card-actions";

export type AlertWithStudent = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: (typeof alertStatusEnum.enumValues)[number];
  type: (typeof alertTypeEnum.enumValues)[number];
  source: (typeof alertSourceEnum.enumValues)[number];
  resolvedBy: (typeof alertResolvedByEnum.enumValues)[number] | null;
  summary: string | null;
  student: {
    id: string;
    code: string | null;
    name: string;
    gradeLevel: number | null;
    room: string | null;
    avatar: string | null;
    dateOfBirth: string | null;
  };
};

function Badge({ data }: { data: AlertWithStudent }) {
  return (
    <div
      className={cn(
        "rounded-full px-2 py-1 text-xs",
        data.status === "new" && "bg-destructive/15 text-destructive",
        data.status === "in_progress" && "bg-warning/15 text-warning",
        data.status === "resolved" && "bg-success/15 text-success",
      )}
    >
      {titleCase(data.status, { delimiter: "_" })}
    </div>
  );
}

function Summary({ data }: { data: AlertWithStudent }) {
  if (data.status === "resolved") {
    return null;
  }

  if (!data.summary) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md p-4",
        data.status === "new" && "bg-destructive/15 text-destructive",
        data.status === "in_progress" && "bg-warning/15 text-warning",
      )}
    >
      <P className="text-sm">Alert Details:</P>
      <P className="mt-2 text-sm">{data.summary}</P>
    </div>
  );
}

export function AlertCard({
  data,
  className,
}: {
  data: AlertWithStudent;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "h-fit border-l-4 bg-white",
        data.status === "new" && "border-l-destructive",
        data.status === "in_progress" && "border-l-warning",
        data.status === "resolved" && "border-l-success",
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
            <Timestamp value={data.createdAt} format="MMM d, yyyy, h:mm a" />
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Muted>Source</Muted>
            <Small className="font-normal">
              {titleCase(data.source, { delimiter: "_" })}
            </Small>
          </div>
          <div className="flex flex-col gap-1">
            <Muted>Alert Type</Muted>
            <Small className="font-normal">
              {titleCase(data.type, { delimiter: "_" })}
            </Small>
          </div>
        </div>
        <Summary data={data} />
        <AlertCardActions
          data={{
            id: data.id,
            status: data.status,
            student: {
              name: data.student.name,
              grade: data.student.gradeLevel,
            },
          }}
          className="ml-auto"
        />
      </CardContent>
    </Card>
  );
}
