import { alerts, profiles, users } from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { AlertCard } from "@/lib/alerts/alert-card";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";

export async function AlertCards({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const data = await db.admin
    .select()
    .from(alerts)
    .where(and(eq(alerts.studentId, studentId)))
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id));

  return (
    <div className="flex flex-col gap-4">
      {data.map((alert) => (
        <AlertCard
          key={alert.alerts.id}
          data={{
            id: alert.alerts.id,
            createdAt: alert.alerts.createdAt,
            updatedAt: alert.alerts.updatedAt,
            status: alert.alerts.status,
            type: alert.alerts.type,
            source: alert.alerts.source,
            resolvedBy: alert.alerts.resolvedBy,
            summary: null,
            student: {
              id: alert.profiles.id,
              code: null,
              name: getUserFullName(alert.users),
              gradeLevel: alert.profiles.grade,
              room: null,
              avatar: null,
              dateOfBirth: alert.profiles.dateOfBirth,
            },
          }}
        />
      ))}
    </div>
  );
}
