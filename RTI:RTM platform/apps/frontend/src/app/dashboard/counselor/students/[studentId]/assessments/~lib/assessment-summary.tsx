import { profiles, screeners, type screenerTypeEnum } from "@feelwell/database";
import { format } from "date-fns";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from "lucide-react";
import { Badge } from "@/lib/core-ui/badge";
import { Card } from "@/lib/core-ui/card";
import { Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";
import { cn } from "@/lib/tailwind-utils";

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

/** Returns screener types that are age-appropriate. If age is null, all types are shown. */
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

type AssessmentCardData = {
  type: ScreenerType;
  title: string;
  subtitle: string;
  score: number;
  maxScore: number;
  change: number | null;
  lastTaken: Date | null;
  levelLabel: string | null;
  borderColor: string;
  badgeColor: string;
};

const screeningConfig: Record<
  ScreenerType,
  {
    title: string;
    subtitle: string;
    borderColor: string;
    defaultMaxScore: number;
  }
> = {
  phq_a: {
    title: "PHQ-A",
    subtitle: "Depression (Ages 11–17)",
    borderColor: "border-l-indigo-500",
    defaultMaxScore: 30,
  },
  phq_9: {
    title: "PHQ-9",
    subtitle: "Depression (Ages 18+)",
    borderColor: "border-l-indigo-500",
    defaultMaxScore: 27,
  },
  gad_child: {
    title: "GAD-Child",
    subtitle: "Anxiety (Ages 11–17)",
    borderColor: "border-l-blue-500",
    defaultMaxScore: 30,
  },
  gad_7: {
    title: "GAD-7",
    subtitle: "Anxiety (Ages 18+)",
    borderColor: "border-l-blue-500",
    defaultMaxScore: 21,
  },
  sel: {
    title: "SEL",
    subtitle: "Social-Emotional Learning",
    borderColor: "border-l-orange-500",
    defaultMaxScore: 4,
  },
};

function getSeverityLabel(type: ScreenerType, score: number): string | null {
  if (type === "sel") {
    if (score >= 3) return "Strong";
    if (score >= 2) return "Moderate";
    return "Needs Support";
  }
  const riskLevel = getRiskLevel({ type, score });
  return getRiskLevelTitle({ type, riskLevel });
}

function levelBadgeColor(level: string | null): string {
  switch (level) {
    case "Minimal":
      return "bg-green-100 text-green-700";
    case "Mild":
      return "bg-yellow-100 text-yellow-700";
    case "Moderate":
      return "bg-orange-100 text-orange-700";
    case "Moderately Severe":
    case "Severe":
      return "bg-red-100 text-red-700";
    case "Strong":
      return "bg-green-100 text-green-700";
    case "Needs Support":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function AssessmentCard({ data }: { data: AssessmentCardData }) {
  const hasData = data.lastTaken !== null;
  const isSEL = data.type === "sel";

  return (
    <Card
      className={cn(
        "gap-0 border-l-4 bg-white p-5 shadow-sm",
        data.borderColor,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{data.title}</p>
          <Muted className="text-xs">{data.subtitle}</Muted>
        </div>
        {data.levelLabel && (
          <Badge className={cn("rounded-full text-xs", data.badgeColor)}>
            {data.levelLabel}
          </Badge>
        )}
      </div>

      {hasData ? (
        <>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-bold text-3xl text-gray-900">
              {isSEL ? data.score.toFixed(1) : data.score}
            </span>
            <span className="text-gray-500 text-sm">/ {data.maxScore}</span>
          </div>

          {data.change !== null && data.change !== 0 && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 font-medium text-xs",
                data.change > 0
                  ? isSEL
                    ? "text-green-600"
                    : "text-red-600"
                  : isSEL
                    ? "text-red-600"
                    : "text-green-600",
              )}
            >
              {data.change > 0 ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              {isSEL
                ? `${Math.abs(data.change)}% from last assessment`
                : `${Math.abs(data.change)} from last assessment`}
            </div>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-gray-500 text-xs">
            <CalendarIcon className="h-3 w-3" />
            Last taken: {format(data.lastTaken!, "MMM d, yyyy")}
          </div>
        </>
      ) : (
        <Muted className="mt-3 text-sm">No assessments completed yet.</Muted>
      )}
    </Card>
  );
}

async function getLatestByType(studentId: string, type: ScreenerType) {
  const db = await serverDrizzle();
  return db.admin
    .select()
    .from(screeners)
    .where(
      and(
        eq(screeners.userId, studentId),
        isNotNull(screeners.completedAt),
        eq(screeners.type, type),
      ),
    )
    .orderBy(desc(screeners.completedAt))
    .limit(1)
    .then((res) => res[0] ?? null);
}

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

export async function AssessmentSummary({ studentId }: { studentId: string }) {
  const age = await getStudentAge(studentId);
  const typesToShow = screenerTypesForAge(age);

  const results = await Promise.all(
    typesToShow.map((type) => getLatestByType(studentId, type)),
  );

  const cards: AssessmentCardData[] = [];

  for (let i = 0; i < typesToShow.length; i++) {
    const type = typesToShow[i]!;
    const data = results[i];
    const config = screeningConfig[type];
    const isSEL = type === "sel";

    const levelLabel = data ? getSeverityLabel(type, data.score) : null;
    const change =
      data?.lastScore != null
        ? isSEL
          ? Math.round(
              ((data.score - data.lastScore) / Math.max(data.lastScore, 1)) *
                100,
            )
          : Math.round(data.score - data.lastScore)
        : null;

    cards.push({
      type,
      title: config.title,
      subtitle: config.subtitle,
      score: data?.score ?? 0,
      maxScore: data?.maxScore ?? config.defaultMaxScore,
      change,
      lastTaken: data?.completedAt ?? null,
      levelLabel,
      borderColor: config.borderColor,
      badgeColor: levelBadgeColor(levelLabel),
    });
  }

  if (cards.length === 0) {
    return (
      <Muted className="text-sm">
        No assessments are applicable for this student’s age.
      </Muted>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <AssessmentCard key={card.type} data={card} />
      ))}
    </div>
  );
}
