import {
  alerts,
  chatSessions,
  profiles,
  userSchools,
} from "@feelwell/database";
import {
  and,
  count,
  countDistinct,
  eq,
  inArray,
  isNotNull,
  or,
} from "drizzle-orm";
import { MessageSquare } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  SUMMARY_CARDS_GRID_CLASS,
  SummaryCard,
} from "@/lib/core-ui/summary-card";
import { serverDrizzle } from "@/lib/database/drizzle";
import * as Icons from "./icons";

function StatCardSkeleton() {
  return <Skeleton className="h-28 flex-1 rounded-xl bg-white/50" />;
}

async function UnresolvedAlertsCard({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();
  // Join alerts with userSchools via studentId to filter by school
  const result = await db.admin
    .select({ count: countDistinct(alerts.id) })
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        // Only count safety alerts: coach escalations + PHQ Q9 endorsements
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
        // Only count unresolved alerts (new or in review)
        inArray(alerts.status, ["new", "in_progress"]),
      ),
    )
    .then((res) => res[0]);

  return (
    <SummaryCard
      label="Safety Alerts"
      value={result?.count ?? 0}
      sublabel="Unresolved alerts"
      iconBgColor="bg-red-50"
      valueColor="text-red-500"
      icon={<Icons.AlertIcon />}
    />
  );
}

async function TotalActiveStudentsCard({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();
  const result = await db.admin
    .select({ count: count() })
    .from(profiles)
    .innerJoin(userSchools, eq(profiles.id, userSchools.userId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(profiles.onboardingCompletedAt),
      ),
    )
    .then((res) => res[0]);

  return (
    <SummaryCard
      label="Total Active Patients"
      value={result?.count ?? 0}
      sublabel="Registered and active"
      iconBgColor="bg-green-50"
      valueColor="text-green-500"
      icon={<Icons.ActiveStudentsIcon />}
    />
  );
}

async function SupportConversationsCard({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const result = await db.admin
    .select({ count: count() })
    .from(chatSessions)
    .innerJoin(userSchools, eq(chatSessions.userId, userSchools.userId))
    .where(eq(userSchools.schoolId, schoolId))
    .then((res) => res[0]);

  return (
    <SummaryCard
      label="Patient Sessions"
      value={result?.count ?? 0}
      sublabel="Total sessions"
      iconBgColor="bg-blue-50"
      valueColor="text-blue-500"
      icon={<MessageSquare className="size-5 text-blue-600" />}
    />
  );
}

async function HoursOfSupportCard() {
  // For now, show 0 as we don't have support hours tracking yet
  // This can be connected to actual data once available
  return (
    <SummaryCard
      label="Clinical Hours"
      value={0}
      sublabel="Total clinical time"
      iconBgColor="bg-purple-50"
      valueColor="text-purple-500"
      icon={<Icons.SupportIcon />}
    />
  );
}

export async function StatsOverview({ schoolId }: { schoolId: string }) {
  return (
    <div className={SUMMARY_CARDS_GRID_CLASS}>
      <Suspense fallback={<StatCardSkeleton />}>
        <UnresolvedAlertsCard schoolId={schoolId} />
      </Suspense>
      <Suspense fallback={<StatCardSkeleton />}>
        <TotalActiveStudentsCard schoolId={schoolId} />
      </Suspense>
      <Suspense fallback={<StatCardSkeleton />}>
        <SupportConversationsCard schoolId={schoolId} />
      </Suspense>
      <Suspense fallback={<StatCardSkeleton />}>
        <HoursOfSupportCard />
      </Suspense>
    </div>
  );
}
