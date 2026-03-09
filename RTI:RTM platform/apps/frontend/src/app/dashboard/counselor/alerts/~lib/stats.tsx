import { alerts, userSchools } from "@feelwell/database";
import { startOfDay } from "date-fns";
import { and, count, eq, gt, ne } from "drizzle-orm";
import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
} from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  SUMMARY_CARDS_GRID_CLASS,
  SummaryCard,
} from "@/lib/core-ui/summary-card";
import { serverDrizzle } from "@/lib/database/drizzle";

function sublabelWithChange(change: number, fallback: string) {
  if (change === 0) return fallback;
  const sign = change >= 0 ? "+" : "-";
  return `${sign}${Math.abs(change)} since yesterday`;
}

async function NewAlerts({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const [current, change] = await Promise.all([
    db.admin
      .select({ count: count() })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(and(eq(alerts.status, "new"), eq(userSchools.schoolId, schoolId)))
      .then((res) => res[0]?.count ?? 0),
    db.admin
      .select({ count: count() })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(
        and(
          eq(userSchools.schoolId, schoolId),
          gt(alerts.createdAt, startOfDay(new Date())),
        ),
      )
      .then((res) => res[0]?.count ?? 0),
  ]);

  return (
    <SummaryCard
      label="New Alerts"
      value={current}
      sublabel={sublabelWithChange(change, "New today")}
      iconBgColor="bg-primary/10"
      valueColor="text-primary"
      icon={<AlertTriangleIcon className="size-5 text-primary" />}
    />
  );
}

async function UnresolvedAlerts({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const [current, change] = await Promise.all([
    db.admin
      .select({ count: count() })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(
        and(eq(userSchools.schoolId, schoolId), ne(alerts.status, "resolved")),
      )
      .then((res) => res[0]?.count ?? 0),
    db.admin
      .select({ count: count() })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(
        and(
          eq(userSchools.schoolId, schoolId),
          ne(alerts.status, "resolved"),
          gt(alerts.updatedAt, startOfDay(new Date())),
        ),
      )
      .then((res) => res[0]?.count ?? 0),
  ]);

  return (
    <SummaryCard
      label="Unresolved Alerts"
      value={current}
      sublabel={sublabelWithChange(change, "Requires attention")}
      iconBgColor="bg-destructive/10"
      valueColor="text-destructive"
      icon={<FlameIcon className="size-5 text-destructive" />}
    />
  );
}

async function AlertsInProgress({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const value = await db.admin
    .select({ count: count() })
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .where(
      and(eq(userSchools.schoolId, schoolId), eq(alerts.status, "in_progress")),
    )
    .then((res) => res[0]?.count ?? 0);

  return (
    <SummaryCard
      label="Alerts In Progress"
      value={value}
      sublabel="Being addressed"
      iconBgColor="bg-yellow-500/10"
      valueColor="text-yellow-600"
      icon={<ClockIcon className="size-5 text-yellow-600" />}
    />
  );
}

async function ResolvedToday({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();
  const value = await db.admin
    .select({ count: count() })
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(alerts.status, "resolved"),
        gt(alerts.updatedAt, startOfDay(new Date())),
      ),
    )
    .then((res) => res[0]?.count ?? 0);

  return (
    <SummaryCard
      label="Resolved Today"
      value={value}
      sublabel="Successfully handled"
      iconBgColor="bg-success/10"
      valueColor="text-green-600"
      icon={<CheckIcon className="size-5 text-green-600" />}
    />
  );
}

function Fallback() {
  return <Skeleton className="h-36 w-full border bg-white/50 shadow-sm" />;
}

export async function Stats({ schoolId }: { schoolId: string }) {
  return (
    <div className={SUMMARY_CARDS_GRID_CLASS}>
      <Suspense fallback={<Fallback />}>
        <NewAlerts schoolId={schoolId} />
      </Suspense>

      <Suspense fallback={<Fallback />}>
        <UnresolvedAlerts schoolId={schoolId} />
      </Suspense>

      <Suspense fallback={<Fallback />}>
        <AlertsInProgress schoolId={schoolId} />
      </Suspense>

      <Suspense fallback={<Fallback />}>
        <ResolvedToday schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
