import { screenerSessions, screeners } from "@feelwell/database";
import { subMonths } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { Large } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import SkillDevelopmentChart, {
  type SkillDevelopmentData,
} from "./skill-dev-chart";

function getPeriodKey(date: Date, periodDays: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = date.getDate();

  const periodStart = Math.floor((day - 1) / periodDays) * periodDays + 1;
  const periodStartStr = String(periodStart).padStart(2, "0");

  return `${year}-${month}-${periodStartStr}`;
}

function processScreenerData(
  rawData: {
    completedAt: Date | null;
    subtype: string;
    score: number;
    maxScore: number;
  }[],
): SkillDevelopmentData[] {
  const periodScores = new Map<string, Record<string, number>>();

  for (const record of rawData) {
    if (!record.completedAt) {
      continue;
    }

    const period = getPeriodKey(record.completedAt, 10);
    if (!periodScores.has(period)) {
      periodScores.set(period, {});
    }

    const periodScore = periodScores.get(period);
    if (periodScore) {
      periodScore[record.subtype] =
        (periodScore[record.subtype] ?? 0) + record.score;
    }
  }

  return Array.from(periodScores.entries())
    .map(([period, skills]) => ({
      week: new Date(period).getTime(),
      cognitive: skills["cognitive"] ?? 0,
      emotion: skills["emotion"] ?? 0,
      social: skills["social"] ?? 0,
      values: skills["values"] ?? 0,
      perspective: skills["perspective"] ?? 0,
      identity: skills["identity"] ?? 0,
    }))
    .sort((a, b) => a.week - b.week);
}

export default async function SkillDevelopment({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  const rawData = await db.admin
    .select({
      completedAt: screeners.completedAt,
      subtype: screenerSessions.subtype,
      score: screenerSessions.score,
      maxScore: screenerSessions.maxScore,
    })
    .from(screeners)
    .innerJoin(screenerSessions, eq(screeners.id, screenerSessions.screenerId))
    .where(
      and(
        eq(screeners.userId, studentId),
        eq(screeners.type, "sel"),
        gte(screeners.completedAt, subMonths(new Date(), 6)),
      ),
    )
    .orderBy(screeners.completedAt);

  const chartData = processScreenerData(rawData);

  return (
    <div className="flex flex-col gap-4">
      <Large className="font-normal">Skill Development</Large>
      <SkillDevelopmentChart data={chartData} className="h-80" />
    </div>
  );
}
