import {
  chatSessions,
  profiles,
  userSchools,
  users,
} from "@feelwell/database";
import { and, count, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import EmptyLoadingSkeleton from "@/lib/loading/empty-skeleton";
import { getUserFullName } from "@/lib/user/utils";
import { searchParamsCache } from "./~lib/cache";
import { AllPatientsTable } from "./~lib/all-patients-table";

export type PatientRow = {
  id: string;
  name: string;
  billableDays: number;
  providerMinutes: number;
  recentMood: string;
  treatmentPlan: string | null;
  daysAgo: number;
};

async function AllPatientsTableWrapper({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const studentRows = await db.admin
    .select({
      user: users,
      profile: profiles,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        isNotNull(profiles.onboardingCompletedAt),
      ),
    )
    .orderBy(desc(profiles.onboardingCompletedAt));

  // Get session counts per student
  const sessionCounts = await Promise.all(
    studentRows.map(async (row) => {
      const result = await db.admin
        .select({ count: count() })
        .from(chatSessions)
        .where(eq(chatSessions.userId, row.user.id))
        .then((res) => res[0]?.count ?? 0);
      return { userId: row.user.id, count: result };
    }),
  );

  const sessionMap = new Map(sessionCounts.map((s) => [s.userId, s.count]));

  const moods = ["Happy", "Calm", "Anxious", "Sad", "Stressed", "Neutral", "Hopeful", "Tired"];
  const plans = [
    "Anxiety Management Plan",
    "Depression Recovery Plan",
    "PTSD Treatment Plan",
    "Social Skills Development",
    "Mood Stabilization Plan",
    null,
  ];

  // Simple deterministic hash for consistent mock data
  function hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const patients: PatientRow[] = studentRows.map((row) => {
    const h = hash(row.user.id);
    // Mock billable days (days with sessions in the 30-day billing period)
    const billableDays = Math.min(30, (sessionMap.get(row.user.id) ?? 0) + (h % 15));
    // Mock provider minutes (total time spent on this patient)
    const providerMinutes = 10 + (h % 90);
    // Mock days since last login (0-30 days ago)
    const daysAgo = h % 30;
    
    return {
      id: row.user.id,
      name: getUserFullName(row.user),
      billableDays,
      providerMinutes,
      recentMood: moods[h % moods.length]!,
      treatmentPlan: plans[h % plans.length] ?? null,
      daysAgo,
    };
  });

  return <AllPatientsTable patients={patients} />;
}

export default async function CaseloadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sParams = await searchParamsCache.parse(searchParams);

  const db = await serverDrizzle();
  const userId = db.userId();

  const userSchoolsList = await db.admin
    .select({
      schoolId: userSchools.schoolId,
      role: userSchools.role,
    })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, userId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    );

  const firstRow = userSchoolsList[0];
  if (firstRow == null) {
    return notFound();
  }

  const requestedSchoolId = sParams.schoolId || "";
  const validSchoolIds = userSchoolsList.map((r) => r.schoolId);
  const schoolId =
    requestedSchoolId && validSchoolIds.includes(requestedSchoolId)
      ? requestedSchoolId
      : firstRow.schoolId;
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Caseloads</PageTitle>
          <PageSubtitle>
            View patient caseloads. Toggle between your own caseload and organization-wide view.
          </PageSubtitle>
        </div>
        <Suspense fallback={<EmptyLoadingSkeleton />}>
          <AllPatientsTableWrapper schoolId={schoolId} />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
