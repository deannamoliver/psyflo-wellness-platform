/*
 * Skills tab content temporarily disabled.
 *
 * Previous implementation (data fetching + UI) is preserved below
 * in comments so it can be restored easily when we re‑enable this tab.
 *
 * NOTE: Do not delete this block – we are intentionally keeping
 * all original logic commented out.
 */

// import {
//   profiles,
//   screenerSessions,
//   screeners,
//   userSchools,
//   users,
// } from "@feelwell/database";
// import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
//
// import { Card, CardContent } from "@/lib/core-ui/card";
// import { serverDrizzle } from "@/lib/database/drizzle";
//
// import { SkillsDomainOverview } from "./skills-domain-overview";
// import { SkillsInsights } from "./skills-insights";
// import {
//   buildCaselDomains,
//   buildDistribution,
//   SEL_SUBTYPES,
// } from "./skills-tab-data";
//
// async function getSubtypeAggregates(
//   schoolId: string,
//   gradeLevel: number | null,
// ) {
//   const db = await serverDrizzle();
//
//   return db.admin
//     .select({
//       subtype: screenerSessions.subtype,
//       score: sql<number>`SUM(${screenerSessions.score})`,
//       maxScore: sql<number>`SUM(${screenerSessions.maxScore})`,
//     })
//     .from(users)
//     .innerJoin(userSchools, eq(users.id, userSchools.userId))
//     .innerJoin(profiles, eq(users.id, profiles.id))
//     .innerJoin(
//       screeners,
//       and(
//         eq(users.id, screeners.userId),
//         eq(screeners.type, "sel"),
//         isNotNull(screeners.completedAt),
//       ),
//     )
//     .innerJoin(
//       screenerSessions,
//       and(
//         eq(screeners.id, screenerSessions.screenerId),
//         isNotNull(screenerSessions.completedAt),
//         inArray(screenerSessions.subtype, [...SEL_SUBTYPES]),
//       ),
//     )
//     .where(
//       and(
//         eq(userSchools.schoolId, schoolId),
//         eq(userSchools.role, "student"),
//         gradeLevel != null ? eq(profiles.grade, gradeLevel) : undefined,
//       ),
//     )
//     .groupBy(screenerSessions.subtype);
// }
//
// async function getStudentOverallScores(
//   schoolId: string,
//   gradeLevel: number | null,
// ) {
//   const db = await serverDrizzle();
//
//   return db.admin
//     .select({
//       studentId: users.id,
//       score: sql<number>`SUM(${screenerSessions.score})`,
//       maxScore: sql<number>`SUM(${screenerSessions.maxScore})`,
//     })
//     .from(users)
//     .innerJoin(userSchools, eq(users.id, userSchools.userId))
//     .innerJoin(profiles, eq(users.id, profiles.id))
//     .innerJoin(
//       screeners,
//       and(
//         eq(users.id, screeners.userId),
//         eq(screeners.type, "sel"),
//         isNotNull(screeners.completedAt),
//       ),
//     )
//     .innerJoin(
//       screenerSessions,
//       and(
//         eq(screeners.id, screenerSessions.screenerId),
//         isNotNull(screenerSessions.completedAt),
//         inArray(screenerSessions.subtype, [...SEL_SUBTYPES]),
//       ),
//     )
//     .where(
//       and(
//         eq(userSchools.schoolId, schoolId),
//         eq(userSchools.role, "student"),
//         gradeLevel != null ? eq(profiles.grade, gradeLevel) : undefined,
//       ),
//     )
//     .groupBy(users.id);
// }
//
// export async function SkillsTabSection({
//   schoolId,
//   gradeLevel,
// }: {
//   schoolId: string;
//   gradeLevel: number | null;
// }) {
//   const [subtypeRows, studentRows] = await Promise.all([
//     getSubtypeAggregates(schoolId, gradeLevel),
//     getStudentOverallScores(schoolId, gradeLevel),
//   ]);
//
//   if (subtypeRows.length === 0) {
//     return (
//       <Card className="overflow-clip p-0">
//         <CardContent className="bg-white p-6">
//           <div className="flex min-h-[300px] items-center justify-center px-4 py-8 text-center">
//             <p className="max-w-md text-muted-foreground">
//               Skill development data will appear here once students have
//               completed the SEL screener series, which covers 8 domains
//               administered over a 4-day period.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }
//
//   const domains = buildCaselDomains(subtypeRows);
//   const { distribution, studentCount } = buildDistribution(studentRows);
//
//   const totalScore = domains.reduce((s, d) => s + d.score, 0);
//   const totalMaxScore = domains.reduce((s, d) => s + d.maxScore, 0);
//   const overallPercentage = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;
//
//   const sorted = [...domains].sort((a, b) => b.percentage - a.percentage);
//   const strengths = sorted.slice(0, 2);
//   const growthAreas = sorted.slice(-2).reverse();
//
//   return (
//     <div className="flex flex-col gap-6">
//       <SkillsDomainOverview
//         overallPercentage={overallPercentage}
//         domains={domains}
//         studentCount={studentCount}
//       />
//       <SkillsInsights
//         strengths={strengths}
//         growthAreas={growthAreas}
//         distribution={distribution}
//         studentCount={studentCount}
//       />
//     </div>
//   );
// }

// Temporary minimal implementation: render nothing under the Skills tab.
export async function SkillsTabSection({
  schoolId,
  gradeLevel,
}: {
  schoolId: string;
  gradeLevel: number | null;
}) {
  void schoolId;
  void gradeLevel;
  return null;
}
