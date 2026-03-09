import { alertNotes, alertTimelineEntries, users } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { Suspense } from "react";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/lib/core-ui/timeline";
import { H4, Muted, Small } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import { getUserFullName } from "@/lib/user/utils";

async function Note({
  itemId,
  className,
}: {
  itemId: string;
  className?: string;
}) {
  const db = await serverDrizzle();

  const data = await db.admin
    .select()
    .from(alertNotes)
    .where(eq(alertNotes.timelineEntryId, itemId))
    .innerJoin(users, eq(alertNotes.counselorId, users.id))
    .then((res) => res[0]);

  if (!data) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-md border bg-white p-4",
        className,
      )}
    >
      <Small className="font-normal">{data.alert_notes.content}</Small>
      <Muted className="ml-auto text-muted-foreground">
        {getUserFullName(data.users)}
      </Muted>
    </div>
  );
}

export default async function AlertTimeline({
  alertId,
  className,
}: {
  alertId: string;
  className?: string;
}) {
  const db = await serverDrizzle();

  const data = await db.admin.query.alertTimelineEntries.findMany({
    where: eq(alertTimelineEntries.alertId, alertId),
    orderBy: desc(alertTimelineEntries.createdAt),
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <H4 className="font-normal">Alert Timeline</H4>

      <Timeline>
        {data.map((item, index) => (
          <TimelineItem key={item.id}>
            <TimelineSeparator>
              <TimelineDot />
              {index !== data.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <TimelineTitle className="flex items-center gap-2">
                <span>{titleCase(item.type, { delimiter: "_" })}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-xs">
                  <Timestamp
                    value={item.createdAt}
                    format="MMM d, yyyy, h:mm a"
                  />
                </span>
              </TimelineTitle>
              <TimelineDescription>{item.description}</TimelineDescription>
              {item.type === "note_added" && (
                <Suspense>
                  <Note itemId={item.id} className="mt-4" />
                </Suspense>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
