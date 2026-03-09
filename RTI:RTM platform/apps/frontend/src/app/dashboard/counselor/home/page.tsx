import {
  alerts,
  chatSessions,
  profiles,
  userSchools,
  users,
} from "@feelwell/database";
import { and, count, countDistinct, desc, eq, inArray, isNotNull, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { serverDrizzle } from "@/lib/database/drizzle";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import EmptyLoadingSkeleton from "@/lib/loading/empty-skeleton";
import { fmtUserName } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import { getUserFullName } from "@/lib/user/utils";
import { searchParamsCache } from "./~lib/cache";
import { PlatformSnapshot } from "./~lib/platform-snapshot";
import { AllPatientsTable } from "./~lib/all-patients-table";
import { WelcomeHeader } from "./~lib/welcome-header";

async function PlatformSnapshotWrapper({ schoolId }: { schoolId: string }) {
  const db = await serverDrizzle();

  const [patientCount, sessionCount, alertCount, supportHours] = await Promise.all([
    db.admin
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
      .then((res) => res[0]?.count ?? 0),
    db.admin
      .select({ count: count() })
      .from(chatSessions)
      .innerJoin(userSchools, eq(chatSessions.userId, userSchools.userId))
      .where(eq(userSchools.schoolId, schoolId))
      .then((res) => res[0]?.count ?? 0),
    db.admin
      .select({ count: countDistinct(alerts.id) })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(
        and(
          eq(userSchools.schoolId, schoolId),
          or(
            eq(alerts.source, "coach"),
            and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
          ),
          inArray(alerts.status, ["new", "in_progress"]),
        ),
      )
      .then((res) => res[0]?.count ?? 0),
    // Support hours: count chat sessions as proxy (each session ~15 min avg)
    db.admin
      .select({ count: count() })
      .from(chatSessions)
      .innerJoin(userSchools, eq(chatSessions.userId, userSchools.userId))
      .where(eq(userSchools.schoolId, schoolId))
      .then((res) => Math.round(((res[0]?.count ?? 0) * 15) / 60)),
  ]);

  return (
    <PlatformSnapshot
      totalPatients={patientCount}
      sessionCount={sessionCount}
      alertCount={alertCount}
      supportHours={supportHours}
    />
  );
}

async function CounselorWelcomeHeaderWrapper({
  schoolId,
}: {
  schoolId: string;
}) {
  const data = await getCurrentUserInfo();
  return <WelcomeHeader name={fmtUserName(data)} currentSchoolId={schoolId} />;
}

export type PatientRow = {
  id: string;
  name: string;
  sessions: number;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  recentMood: string;
  treatmentPlan: string | null;
  planAdherence: number;
  dateJoined: string;
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
  const sentiments: PatientRow["sentiment"][] = ["positive", "neutral", "negative", "unknown"];
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
    return {
      id: row.user.id,
      name: getUserFullName(row.user),
      sessions: sessionMap.get(row.user.id) ?? 0,
      sentiment: sentiments[h % sentiments.length]!,
      recentMood: moods[h % moods.length]!,
      treatmentPlan: plans[h % plans.length] ?? null,
      planAdherence: 40 + (h % 55),
      dateJoined: row.profile.onboardingCompletedAt
        ? row.profile.onboardingCompletedAt.toISOString().split("T")[0]!
        : "N/A",
    };
  });

  return <AllPatientsTable patients={patients} />;
}

export default async function HomePage({
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
          <Suspense fallback={<EmptyLoadingSkeleton />}>
            <CounselorWelcomeHeaderWrapper schoolId={schoolId} />
          </Suspense>
        </div>

        <Suspense fallback={<EmptyLoadingSkeleton />}>
          <PlatformSnapshotWrapper schoolId={schoolId} />
        </Suspense>

        <Suspense fallback={<EmptyLoadingSkeleton />}>
          <AllPatientsTableWrapper schoolId={schoolId} />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
