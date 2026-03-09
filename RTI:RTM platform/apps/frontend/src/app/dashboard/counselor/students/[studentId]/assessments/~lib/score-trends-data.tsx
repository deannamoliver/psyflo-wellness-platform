import { profiles, screeners, type screenerTypeEnum } from "@feelwell/database";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { ScoreTrendsChart } from "./score-trends-chart";

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

function screenerTypesForAge(age: number | null): ScreenerType[] {
  const all: ScreenerType[] = ["phq_a", "phq_9", "gad_child", "gad_7", "sel"];
  if (age === null) return all;
  return all.filter((type) => {
    if (type === "sel") return true;
    if (type === "phq_a" || type === "gad_child") return age >= 11 && age <= 17;
    if (type === "phq_9" || type === "gad_7") return age >= 18;
    return false;
  });
}

export type TrendDataPoint = {
  date: string;
  score: number;
  maxScore: number;
  pct: number;
  type: ScreenerType;
};

export type TrendSeries = {
  type: ScreenerType;
  label: string;
  maxScore: number;
  color: string;
  points: TrendDataPoint[];
};

const SERIES_CONFIG: Record<
  ScreenerType,
  { label: string; maxScore: number; color: string }
> = {
  phq_a: { label: "PHQ-A (Depression)", maxScore: 27, color: "#a78bfa" },
  phq_9: { label: "PHQ-9 (Depression)", maxScore: 27, color: "#a78bfa" },
  gad_child: { label: "GAD-Child (Anxiety)", maxScore: 40, color: "#3b82f6" },
  gad_7: { label: "GAD-7 (Anxiety)", maxScore: 21, color: "#3b82f6" },
  sel: { label: "WCSD-40 Short Form (SEL)", maxScore: 4, color: "#f59e0b" },
};

async function getStudentAge(studentId: string): Promise<number | null> {
  const db = await serverDrizzle();
  const profile = await db.admin
    .select({ dateOfBirth: profiles.dateOfBirth, grade: profiles.grade })
    .from(profiles)
    .where(eq(profiles.id, studentId))
    .limit(1)
    .then((rows) => rows[0]);
  if (!profile) return null;
  if (profile.dateOfBirth) {
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }
  if (profile.grade != null) return profile.grade + 5;
  return null;
}

export async function ScoreTrendsData({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();
  const age = await getStudentAge(studentId);
  const typesToShow = screenerTypesForAge(age);

  const results = await db.admin
    .select({
      type: screeners.type,
      score: screeners.score,
      maxScore: screeners.maxScore,
      completedAt: screeners.completedAt,
    })
    .from(screeners)
    .where(
      and(
        eq(screeners.userId, studentId),
        isNotNull(screeners.completedAt),
        ...(typesToShow.length > 0
          ? [inArray(screeners.type, typesToShow)]
          : []),
      ),
    )
    .orderBy(desc(screeners.completedAt));

  const seriesMap = new Map<ScreenerType, TrendSeries>();

  for (const row of results) {
    if (!row.completedAt) continue;
    const type = row.type as ScreenerType;
    if (!seriesMap.has(type)) {
      const config = SERIES_CONFIG[type];
      seriesMap.set(type, {
        type,
        label: config.label,
        maxScore: row.maxScore || config.maxScore,
        color: config.color,
        points: [],
      });
    }
    const maxScore = row.maxScore || SERIES_CONFIG[type].maxScore;
    seriesMap.get(type)!.points.push({
      date: row.completedAt.toISOString(),
      score: row.score,
      maxScore,
      pct: maxScore > 0 ? Math.round((row.score / maxScore) * 100) : 0,
      type,
    });
  }

  const series = Array.from(seriesMap.values());

  // Reverse points so they're chronological
  for (const s of series) {
    s.points.reverse();
  }

  return <ScoreTrendsChart series={series} />;
}
