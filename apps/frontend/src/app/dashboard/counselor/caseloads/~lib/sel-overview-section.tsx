import {
  profiles,
  screenerSessions,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { inferParserType } from "nuqs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";
import type { searchParamsParsers } from "./parsers";
import type { SELDomainData } from "./sel-domains";
import SELOverviewCharts from "./sel-overview-charts";

async function getDomainData(
  schoolId: string,
  sParams: inferParserType<typeof searchParamsParsers>,
): Promise<SELDomainData[]> {
  const db = await serverDrizzle();

  return await db.admin
    .select({
      domain: screenerSessions.subtype,
      score: sql<number>`SUM(${screenerSessions.score})`,
      maxScore: sql<number>`SUM(${screenerSessions.maxScore})`,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .innerJoin(
      screeners,
      and(
        eq(users.id, screeners.userId),
        eq(screeners.type, "sel"),
        isNotNull(screeners.completedAt),
      ),
    )
    .innerJoin(
      screenerSessions,
      and(
        eq(screeners.id, screenerSessions.screenerId),
        isNotNull(screenerSessions.completedAt),
        inArray(screenerSessions.subtype, [
          "sel_self_awareness_self_concept",
          "sel_self_awareness_emotion_knowledge",
          "sel_social_awareness",
          "sel_self_management_emotion_regulation",
          "sel_self_management_goal_management",
          "sel_self_management_school_work",
          "sel_relationship_skills",
          "sel_responsible_decision_making",
        ]),
      ),
    )
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "student"),
        sParams.gradeLevel !== null
          ? eq(profiles.grade, sParams.gradeLevel)
          : undefined,
      ),
    )
    .groupBy(screenerSessions.subtype)
    .then((results) =>
      results.map((result) => ({
        domain: result.domain,
        label: titleCase(result.domain, { delimiter: "_" }),
        score: result.score,
        maxScore: result.maxScore,
      })),
    );
}

export async function SELOverviewSection({
  schoolId,
  sParams,
}: {
  schoolId: string;
  sParams: inferParserType<typeof searchParamsParsers>;
}) {
  const domainData = await getDomainData(schoolId, sParams);

  return (
    <Card className="overflow-clip p-0">
      <CardHeader className="rounded-t-xl px-6 py-2">
        <CardTitle className="mt-6 font-bold text-2xl">
          Skill Development Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-6">
        {domainData.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-4 py-8 text-center">
            <p className="max-w-md text-muted-foreground">
              Skill development data will appear here once patients have
              completed all 8 SEL screener sessions, which are administered over
              a 4-day period.
            </p>
          </div>
        ) : (
          <SELOverviewCharts domainData={domainData} />
        )}
      </CardContent>
    </Card>
  );
}
