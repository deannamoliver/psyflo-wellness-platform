import {
  chatSessions,
  profiles,
  userSchools,
  users,
} from "@feelwell/database";
import { and, count, desc, eq, isNotNull } from "drizzle-orm";
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
import { CaseloadsClient } from "./~lib/caseloads-client";

export type OrgPatientRow = {
  id: string;
  name: string;
  email: string;
  assignedProvider: string;
  status: "active" | "inactive";
  lastActivity: string;
  billableDays: number;
  providerMinutes: number;
  treatmentPlan: string | null;
  daysAgo: number;
  riskLevel: "low" | "moderate" | "high" | "emergency" | null;
};

const MOCK_PROVIDERS = ["Dr. Sarah Johnson", "Dr. Michael Chen", "Lisa Martinez, LCSW", "Dr. Emily Williams"];
const CURRENT_USER_PROVIDER = "Lisa Martinez, LCSW";

async function CaseloadsWrapper({ schoolId }: { schoolId: string }) {
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

  const treatmentPlans = [
    "CBT for Anxiety",
    "DBT Skills",
    "Exposure Therapy",
    "Mindfulness-Based",
    "Family Therapy",
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

  const patients: OrgPatientRow[] = studentRows.map((row, index) => {
    const h = hash(row.user.id);
    const billableDays = Math.min(30, (sessionMap.get(row.user.id) ?? 0) + (h % 15));
    const providerMinutes = 10 + (h % 90);
    const daysAgo = h % 30;
    const isActive = h % 10 > 1; // ~80% active
    const riskLevels: (OrgPatientRow["riskLevel"])[] = [null, null, null, null, null, "low", "moderate", "high"];
    
    return {
      id: row.user.id,
      name: getUserFullName(row.user),
      email: row.user.email ?? "",
      assignedProvider: MOCK_PROVIDERS[index % MOCK_PROVIDERS.length] ?? "Unknown Provider",
      status: isActive ? "active" : "inactive",
      lastActivity: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      billableDays,
      providerMinutes,
      treatmentPlan: treatmentPlans[h % treatmentPlans.length] ?? null,
      daysAgo,
      riskLevel: riskLevels[h % riskLevels.length] ?? null,
    };
  });

  return (
    <CaseloadsClient 
      patients={patients} 
      providers={MOCK_PROVIDERS}
      currentUserProvider={CURRENT_USER_PROVIDER}
    />
  );
}

export default async function OrgCaseloadsPage() {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Get any school the user belongs to (no role restriction for practice managers)
  const userSchoolsList = await db.admin
    .select({
      schoolId: userSchools.schoolId,
    })
    .from(userSchools)
    .where(eq(userSchools.userId, userId));

  const firstRow = userSchoolsList[0];
  // If user has no school, use a default demo school ID
  const schoolId = firstRow?.schoolId ?? "demo-school";

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
          <CaseloadsWrapper schoolId={schoolId} />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
