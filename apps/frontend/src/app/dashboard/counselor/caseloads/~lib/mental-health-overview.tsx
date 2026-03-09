import {
  profiles,
  screeners,
  type screenerTypeEnum,
  userSchools,
  users,
} from "@feelwell/database";
import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { Info } from "lucide-react";
import type { inferParserType } from "nuqs/server";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/core-ui/tabs";
import { serverDrizzle } from "@/lib/database/drizzle";
import EmptyLoadingSkeleton from "@/lib/loading/empty-skeleton";
import { riskLevels } from "@/lib/screener/type";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";
import { cn } from "@/lib/tailwind-utils";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import type { ScoreCount } from "./mental-health-overview-chart";
import MentalHealthTabContentWrapper from "./mental-health-tab-content-wrapper";
import type { SnapshotRange, searchParamsParsers } from "./parsers";
import { SnapshotRangeFilter } from "./snapshot-range-filter";
import type { Student } from "./type";

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

function getCutoffDate(range: SnapshotRange): Date | null {
  if (range === "latest") return null;
  const now = new Date();
  const ms = 24 * 60 * 60 * 1000;
  switch (range) {
    case "30d":
      return new Date(now.getTime() - 30 * ms);
    case "90d":
      return new Date(now.getTime() - 90 * ms);
    case "6m":
      return new Date(now.getTime() - 180 * ms);
    case "1y":
      return new Date(now.getTime() - 365 * ms);
  }
}

const assessmentTabs = [
  { value: "phq_9" as const, label: "Depression (PHQ-9)" },
  { value: "phq_a" as const, label: "Depression (PHQ-A)" },
  { value: "gad_7" as const, label: "Anxiety (GAD-7)" },
  { value: "gad_child" as const, label: "Anxiety (GAD-7, Child)" },
];

async function getScreenerScoreCounts(
  schoolId: string,
  type: ScreenerType,
  sParams: inferParserType<typeof searchParamsParsers>,
): Promise<ScoreCount[]> {
  const db = await serverDrizzle();
  const cutoff = getCutoffDate(sParams.snapshotRange);

  const results = await db.admin
    .select()
    .from(screeners)
    .innerJoin(
      userSchools,
      and(
        eq(screeners.userId, userSchools.userId),
        eq(userSchools.schoolId, schoolId),
      ),
    )
    .innerJoin(profiles, eq(screeners.userId, profiles.id))
    .where(
      and(
        eq(screeners.type, type),
        isNotNull(screeners.completedAt),
        sParams.gradeLevel !== null
          ? eq(profiles.grade, sParams.gradeLevel)
          : undefined,
        cutoff ? gte(screeners.completedAt, cutoff) : undefined,
      ),
    );

  // "Latest per student": deduplicate to most recent per student
  // Time ranges: count all assessments in the period
  let assessmentsToCount: typeof results;
  if (sParams.snapshotRange === "latest") {
    const latestMap = new Map<string, (typeof results)[number]>();
    for (const row of results) {
      const userId = row.screeners.userId;
      const existing = latestMap.get(userId);
      if (!existing || row.screeners.completedAt! > existing.screeners.completedAt!) {
        latestMap.set(userId, row);
      }
    }
    assessmentsToCount = Array.from(latestMap.values());
  } else {
    assessmentsToCount = results;
  }

  const items: ScoreCount[] = [];

  for (const level of riskLevels) {
    const title = getRiskLevelTitle({ type, riskLevel: level });
    if (title == null) continue;
    items.push({
      level,
      count: assessmentsToCount.filter((r) => getRiskLevel(r.screeners) === level).length,
      title,
    });
  }

  return items;
}

function orderBy(sParams: inferParserType<typeof searchParamsParsers>) {
  switch (sParams.sortBy) {
    case "newest-first":
      return desc(screeners.createdAt);
    case "oldest-first":
      return asc(screeners.createdAt);
    case "student-name-a-z":
      return asc(sql`(users.raw_user_meta_data->>'first_name')`);
    case "grade-low-high":
      return asc(profiles.grade);
    default:
      return desc(screeners.createdAt);
  }
}

async function getScreenerStudents(
  schoolId: string,
  type: ScreenerType,
  sParams: inferParserType<typeof searchParamsParsers>,
): Promise<Student[]> {
  const db = await serverDrizzle();
  const cutoff = getCutoffDate(sParams.snapshotRange);
  const isLatest = sParams.snapshotRange === "latest";

  const fields = {
    id: profiles.id,
    rawUserMetaData: users.rawUserMetaData,
    grade: profiles.grade,
    completedAt: screeners.completedAt,
    score: screeners.score,
  };

  const gradeFilter =
    sParams.gradeLevel !== null
      ? eq(profiles.grade, sParams.gradeLevel)
      : undefined;

  const schoolJoin = and(
    eq(userSchools.userId, users.id),
    eq(userSchools.schoolId, schoolId),
    eq(userSchools.role, "student"),
  );

  const screenerJoin = and(
    eq(screeners.userId, users.id),
    eq(screeners.type, type),
    isNotNull(screeners.completedAt),
    cutoff ? gte(screeners.completedAt, cutoff) : undefined,
  );

  // "Latest per student": one row per student (most recent assessment)
  // Time ranges: all assessments in the period
  const results = isLatest
    ? await db.admin
        .selectDistinctOn([profiles.id], fields)
        .from(profiles)
        .where(and(gradeFilter))
        .innerJoin(users, eq(users.id, profiles.id))
        .innerJoin(userSchools, schoolJoin)
        .innerJoin(screeners, screenerJoin)
        .orderBy(profiles.id, orderBy(sParams))
    : await db.admin
        .select(fields)
        .from(profiles)
        .where(and(gradeFilter))
        .innerJoin(users, eq(users.id, profiles.id))
        .innerJoin(userSchools, schoolJoin)
        .innerJoin(screeners, screenerJoin)
        .orderBy(orderBy(sParams));

  return results.map((row) => {
    const level = getRiskLevel({
      type,
      score: Number(row.score),
    });
    const severityLabel =
      getRiskLevelTitle({ type, riskLevel: level }) ?? "Unknown";
    return {
      id: row.id,
      name: getUserFullNameFromMetaData(row.rawUserMetaData),
      grade: row.grade ?? null,
      avatar: null,
      actionAt: row.completedAt ?? new Date(),
      severityLabel,
    };
  });
}

export type MentalHealthData = {
  scoreCounts: ScoreCount[];
  students: Student[];
  screenerType: ScreenerType;
};

async function MentalHealthTabContent({
  schoolId,
  screenerType,
  sParams,
}: {
  schoolId: string;
  screenerType: ScreenerType;
  sParams: inferParserType<typeof searchParamsParsers>;
}) {
  const [scoreCounts, students] = await Promise.all([
    getScreenerScoreCounts(schoolId, screenerType, sParams),
    getScreenerStudents(schoolId, screenerType, sParams),
  ]);

  const totalCount = scoreCounts.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    const label = assessmentTabs.find((t) => t.value === screenerType)?.label;
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 py-8 text-center">
        <p className="max-w-md text-muted-foreground">
          Mental health data will appear here once patients have completed the{" "}
          {label ?? screenerType} assessment.
        </p>
      </div>
    );
  }

  return (
    <MentalHealthTabContentWrapper
      data={{
        scoreCounts,
        students,
        screenerType,
      }}
    />
  );
}

async function getTabDataCounts(
  schoolId: string,
  sParams: inferParserType<typeof searchParamsParsers>,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const allTypes = assessmentTabs.map((t) => t.value);

  await Promise.all(
    allTypes.map(async (type) => {
      const scoreCounts = await getScreenerScoreCounts(schoolId, type, sParams);
      counts[type] = scoreCounts.reduce((sum, item) => sum + item.count, 0);
    }),
  );

  return counts;
}

export async function MentalHealthOverviewSection({
  schoolId,
  sParams,
  className,
}: {
  schoolId: string;
  sParams: inferParserType<typeof searchParamsParsers>;
  className?: string;
}) {
  const tabCounts = await getTabDataCounts(schoolId, sParams);

  // Find first tab with data, or default to phq_9
  const defaultTab =
    assessmentTabs.find((t) => (tabCounts[t.value] ?? 0) > 0)?.value ?? "phq_9";

  return (
    <Card
      className={cn(
        "gap-0 overflow-clip border-0 bg-white p-0 shadow-none",
        className,
      )}
    >
      <CardHeader className="mb-4 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Mental Health Assessment Snapshot
          </CardTitle>
          <SnapshotRangeFilter />
        </div>
        <p
          className="mt-1.5 flex items-center gap-1.5 text-gray-500 text-sm"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          Based on patient self-reported assessments
        </p>
      </CardHeader>

      <CardContent className="overflow-hidden bg-white p-6 pt-0">
        <Tabs
          defaultValue={defaultTab}
          className="flex h-full flex-col space-y-0"
        >
          <TabsList className="h-auto w-full shrink-0 justify-start gap-0 bg-transparent p-0 shadow-none">
            {assessmentTabs.map((tab) => {
              const hasData = (tabCounts[tab.value] ?? 0) > 0;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={!hasData}
                  className={cn(
                    "rounded-none border-0 border-transparent border-b-2 bg-transparent px-4 py-2",
                    "text-gray-400",
                    hasData && "hover:text-gray-600",
                    !hasData && "cursor-not-allowed opacity-50",
                    "data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none",
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {assessmentTabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="min-h-0 flex-1 space-y-0 bg-white"
            >
              <Suspense fallback={<EmptyLoadingSkeleton />}>
                <MentalHealthTabContent
                  schoolId={schoolId}
                  screenerType={tab.value}
                  sParams={sParams}
                />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
