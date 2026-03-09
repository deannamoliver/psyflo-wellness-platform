import { alerts } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { H3, Muted, P } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";

function LabeledValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <Muted className="text-base">{label}:</Muted>
      <P>{children}</P>
    </div>
  );
}

export default async function AlertSummary({
  alertId,
  className,
}: {
  alertId: string;
  className?: string;
}) {
  const db = await serverDrizzle();

  const data = await db.admin
    .select()
    .from(alerts)
    .where(eq(alerts.id, alertId))
    .limit(1)
    .then(([data]) => data);

  if (!data) {
    notFound();
  }

  return (
    <Card className={cn("flex flex-col gap-4 bg-white", className)}>
      <CardHeader>
        <H3 className="font-normal text-lg">Alert Summary</H3>
      </CardHeader>

      <CardContent className="space-y-4">
        <LabeledValue label="Alert Type">
          {titleCase(data.type, { delimiter: "_" })}
        </LabeledValue>
        <LabeledValue label="Source">
          {titleCase(data.source, { delimiter: "_" })}
        </LabeledValue>
        <LabeledValue label="Created">
          <Timestamp value={data.createdAt} format="MMM d, yyyy, h:mm a" />
        </LabeledValue>
        <LabeledValue label="Status">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs",
              data.status === "new" && "bg-destructive/15 text-destructive",
              data.status === "in_progress" && "bg-warning/15 text-warning",
              data.status === "resolved" && "bg-success/15 text-success",
            )}
          >
            {titleCase(data.status, { delimiter: "_" })}
          </span>
        </LabeledValue>
      </CardContent>
    </Card>
  );
}
