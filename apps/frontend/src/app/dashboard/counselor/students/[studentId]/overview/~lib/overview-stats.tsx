import {
  alerts,
  chatSessions,
  moodCheckIns,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, count, eq, or } from "drizzle-orm";
import { Suspense } from "react";
import { Card } from "@/lib/core-ui/card";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import { cn } from "@/lib/tailwind-utils";
import * as Icons from "../../../../home/~lib/icons";

type StatCardProps = {
  icon: React.ReactNode;
  iconBgColor: string;
  value: number;
  valueColor: string;
  label: string;
  sublabel?: string;
};

function StatCardUI({
  icon,
  iconBgColor,
  value,
  valueColor,
  label,
  sublabel = "",
}: StatCardProps) {
  return (
    <Card className="flex flex-1 flex-col gap-3 rounded-xl border bg-white p-5 font-dm shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconBgColor,
          )}
        >
          {icon}
        </div>
        <span className={cn("font-semibold text-3xl", valueColor)}>
          {value}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-gray-900 text-sm">{label}</span>
        {sublabel ? (
          <span className="text-gray-500 text-xs">{sublabel}</span>
        ) : null}
      </div>
    </Card>
  );
}

async function UnresolvedAlerts({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: count() })
    .from(alerts)
    .where(
      and(
        eq(alerts.studentId, studentId),
        // Only count safety alerts: coach escalations + PHQ Q9 endorsements
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    )
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCardUI
      icon={<Icons.AlertIcon />}
      iconBgColor="bg-red-50"
      value={result}
      valueColor="text-red-500"
      label="Safety Alerts"
    />
  );
}

async function CheckInsCount({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: count() })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCardUI
      icon={<Icons.ActiveStudentsIcon />}
      iconBgColor="bg-green-50"
      value={result}
      valueColor="text-green-500"
      label="Check-ins"
    />
  );
}

async function ConversationsCount({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: count() })
    .from(chatSessions)
    .where(eq(chatSessions.userId, studentId))
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCardUI
      icon={<Icons.ChatIcon />}
      iconBgColor="bg-blue-50"
      value={result}
      valueColor="text-blue-500"
      label="Support Conversations"
    />
  );
}

async function SupportHours({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: count() })
    .from(wellnessCoachHandoffs)
    .where(eq(wellnessCoachHandoffs.studentId, studentId))
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCardUI
      icon={<Icons.SupportIcon />}
      iconBgColor="bg-purple-50"
      value={result}
      valueColor="text-purple-500"
      label="Hours of Support"
    />
  );
}

function Fallback() {
  return <Skeleton className="h-28 flex-1 rounded-xl bg-white/50" />;
}

export function OverviewStats({ studentId }: { studentId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Suspense fallback={<Fallback />}>
        <UnresolvedAlerts studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <CheckInsCount studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <ConversationsCount studentId={studentId} />
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <SupportHours studentId={studentId} />
      </Suspense>
    </div>
  );
}
