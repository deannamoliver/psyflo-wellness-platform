import { userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { serverDrizzle } from "@/lib/database/drizzle";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import EmptyLoadingSkeleton from "@/lib/loading/empty-skeleton";
import { fmtUserName } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { InsightsDashboard } from "./~lib/insights-dashboard";
import { WelcomeHeader } from "./~lib/welcome-header";

const searchParamsCache = createSearchParamsCache({
  schoolId: parseAsString.withDefault(""),
});

async function DashboardWelcomeHeaderWrapper({
  schoolId,
}: {
  schoolId: string;
}) {
  const data = await getCurrentUserInfo();
  return <WelcomeHeader name={fmtUserName(data)} currentSchoolId={schoolId} />;
}

export default async function DashboardPage({
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
            <DashboardWelcomeHeaderWrapper schoolId={schoolId} />
          </Suspense>
        </div>

        <InsightsDashboard />
      </PageContent>
    </PageContainer>
  );
}
