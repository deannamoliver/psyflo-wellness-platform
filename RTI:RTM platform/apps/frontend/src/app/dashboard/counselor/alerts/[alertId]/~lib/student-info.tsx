import { alerts, profiles, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { H3, Muted, P } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { cn } from "@/lib/tailwind-utils";
import { getUserFullName } from "@/lib/user/utils";

function LabeledValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Muted>{label}</Muted>
      <P>{children}</P>
    </div>
  );
}

function fmtAge(dateOfBirth: string | null | undefined) {
  if (dateOfBirth == null) {
    return "N/A";
  }
  return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
}

export default async function StudentInfo({
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
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id))
    .limit(1)
    .then(([data]) => data);

  if (!data) {
    notFound();
  }

  return (
    <Card className={cn("flex flex-col gap-4 bg-white", className)}>
      <CardHeader>
        <H3 className="font-normal">{getUserFullName(data.users)}</H3>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <LabeledValue label="Patient ID">N/A</LabeledValue>
        <LabeledValue label="Age">
          {fmtAge(data.profiles.dateOfBirth)} years old
        </LabeledValue>
        <LabeledValue label="Emergency Contact">N/A</LabeledValue>
      </CardContent>
    </Card>
  );
}
