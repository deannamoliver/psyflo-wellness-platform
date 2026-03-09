import { userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { SafetyAlertsContent } from "./~lib/safety-alerts-content";
import { SafetyFilters } from "./~lib/safety-filters";
import { SafetySummaryCards } from "./~lib/safety-summary-cards";
import { SafetyTableSkeleton } from "./~lib/safety-table";

const EMPTY_SUMMARY = {
  emergency: 0,
  high: 0,
  moderate: 0,
  low: 0,
};

export default async function AlertsPage() {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const schoolId = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, counselorId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!schoolId) {
    notFound();
  }

  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Patient Alerts</PageTitle>
          <PageSubtitle>Review and resolve patient safety and clinical alerts</PageSubtitle>
        </div>

        <Suspense
          fallback={
            <>
              <SafetySummaryCards summary={EMPTY_SUMMARY} />
              <SafetyFilters />
              <SafetyTableSkeleton />
            </>
          }
        >
          <SafetyAlertsContent schoolId={schoolId} />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
