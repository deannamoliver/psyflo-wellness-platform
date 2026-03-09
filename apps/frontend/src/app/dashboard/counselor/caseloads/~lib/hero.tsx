import { profiles, userSchools } from "@feelwell/database";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { serverDrizzle } from "@/lib/database/drizzle";
import * as Icons from "./icons";
import { StatCard } from "./stat-card";

async function TotalActiveStudents({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const value = await db.admin
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
    .then((res) => res[0]?.count ?? 0);

  return (
    <StatCard
      heading="Active Patients"
      iconClassName={<Icons.BlackDanger />}
      stat={value}
      iconBgColor="bg-gray-100"
    />
  );
}

function Fallback() {
  return <Skeleton className="h-36 w-full border bg-white/50 shadow-sm" />;
}

export async function HeroSection({ schoolId }: { schoolId: string }) {
  return (
    <div className="mt-4 flex flex-col">
      <div className="mb-6 flex flex-row items-center gap-2 font-medium text-xl">
        <Icons.Highlights /> Highlights
      </div>
      <div className="flex w-full flex-row gap-6">
        <Suspense fallback={<Fallback />}>
          <TotalActiveStudents schoolId={schoolId} />
        </Suspense>
      </div>
    </div>
  );
}
