import { screeners } from "@feelwell/database";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { AssessmentChartsClient } from "./assessment-charts-client";

// DB-backed screener types
type DbScreenerType = "phq_a" | "phq_9" | "gad_child" | "gad_7" | "sel";
const DB_SCREENER_TYPES: DbScreenerType[] = ["phq_9", "phq_a", "gad_7", "gad_child", "sel"];

// All assessment types shown on the dashboard (including non-DB ones)
export type AssessmentTypeKey = DbScreenerType | "gad_2" | "scared" | "sdq";

export type SerializedDataPoint = {
  id: string;
  type: string;
  score: number;
  maxScore: number;
  completedAt: string;
};

export type SeverityZone = {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
};

export type AssessmentGroup = {
  type: AssessmentTypeKey;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  maxScore: number;
  severityZones: SeverityZone[];
  dataPoints: SerializedDataPoint[];
};

// Full config for every assessment type
const ALL_ASSESSMENT_CONFIG: Record<AssessmentTypeKey, {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  maxScore: number;
  severityZones: SeverityZone[];
}> = {
  phq_9: {
    title: "PHQ-9",
    subtitle: "Patient Health Questionnaire",
    description: "Screens for depression severity in adults (18+). 9 items scored 0–3.",
    color: "#8b5cf6",
    icon: "brain",
    maxScore: 27,
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Mod. Severe", min: 15, max: 19, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Severe", min: 20, max: 27, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  phq_a: {
    title: "PHQ-A",
    subtitle: "Adolescent Depression Screen",
    description: "Modified PHQ for adolescents ages 11–17. Screens for depressive symptoms.",
    color: "#a78bfa",
    icon: "brain",
    maxScore: 27,
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Mod. Severe", min: 15, max: 19, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Severe", min: 20, max: 27, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  gad_7: {
    title: "GAD-7",
    subtitle: "Generalized Anxiety Disorder",
    description: "7-item anxiety severity measure for adults (18+). Scored 0–3 per item.",
    color: "#3b82f6",
    icon: "activity",
    maxScore: 21,
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 15, max: 21, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  gad_2: {
    title: "GAD-2",
    subtitle: "Anxiety Quick Screen",
    description: "Ultra-brief 2-item anxiety screener. Scores ≥ 3 suggest further evaluation.",
    color: "#60a5fa",
    icon: "activity",
    maxScore: 6,
    severityZones: [
      { label: "Normal", min: 0, max: 2, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Elevated", min: 3, max: 6, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  gad_child: {
    title: "GAD-Child",
    subtitle: "Child Anxiety Scale",
    description: "Anxiety assessment for children ages 11–17. 10 items scored 0–4 evaluating worry and nervousness.",
    color: "#38bdf8",
    icon: "activity",
    maxScore: 40,
    severityZones: [
      { label: "None", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Minimal", min: 5, max: 14, color: "text-green-600", bgColor: "bg-green-50" },
      { label: "Mild", min: 15, max: 24, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 25, max: 34, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 35, max: 40, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  scared: {
    title: "SCARED",
    subtitle: "Screen for Child Anxiety",
    description: "41-item child/parent anxiety screen covering panic, GAD, separation, social, and school anxiety.",
    color: "#f472b6",
    icon: "shield",
    maxScore: 82,
    severityZones: [
      { label: "Not Significant", min: 0, max: 24, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Significant", min: 25, max: 82, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  sel: {
    title: "SEL Assessment",
    subtitle: "Social-Emotional Learning",
    description: "Measures social-emotional competencies including self-awareness, self-management, and relationship skills.",
    color: "#f59e0b",
    icon: "heart",
    maxScore: 4,
    severityZones: [
      { label: "Needs Support", min: 0, max: 1.99, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Moderate", min: 2, max: 2.99, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Strong", min: 3, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
    ],
  },
  sdq: {
    title: "SDQ",
    subtitle: "Strengths & Difficulties",
    description: "25-item behavioral screening for emotional, conduct, hyperactivity, peer, and prosocial domains (ages 4–17).",
    color: "#14b8a6",
    icon: "users",
    maxScore: 40,
    severityZones: [
      { label: "Normal", min: 0, max: 13, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Borderline", min: 14, max: 16, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Abnormal", min: 17, max: 40, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
};

// Display order
const DISPLAY_ORDER: AssessmentTypeKey[] = [
  "phq_9", "phq_a", "gad_7", "gad_2", "gad_child", "scared", "sel", "sdq",
];

export default async function AssessmentCharts({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const results = await db.admin
    .select({
      id: screeners.id,
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
        inArray(screeners.type, DB_SCREENER_TYPES),
      ),
    )
    .orderBy(desc(screeners.completedAt));

  const grouped = new Map<string, SerializedDataPoint[]>();
  for (const r of results) {
    if (!r.completedAt) continue;
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push({
      id: r.id,
      type: r.type,
      score: r.score,
      maxScore: r.maxScore,
      completedAt: r.completedAt.toISOString(),
    });
  }

  const allGroups: AssessmentGroup[] = DISPLAY_ORDER.map((type) => {
    const config = ALL_ASSESSMENT_CONFIG[type];
    const points = grouped.get(type);
    return {
      type,
      title: config.title,
      subtitle: config.subtitle,
      description: config.description,
      color: config.color,
      icon: config.icon,
      maxScore: config.maxScore,
      severityZones: config.severityZones,
      dataPoints: points ? points.slice(0, 10).reverse() : [],
    };
  });

  const activeGroups = allGroups.filter((g) => g.dataPoints.length > 0);
  const inactiveGroups = allGroups.filter((g) => g.dataPoints.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-gray-900">Assessment Breakdown</h3>
          <p className="text-xs text-gray-500 mt-0.5">Showing assigned & completed assessments. Click to expand details and view reports.</p>
        </div>
      </div>
      <AssessmentChartsClient groups={activeGroups} inactiveGroups={inactiveGroups} />
    </div>
  );
}
