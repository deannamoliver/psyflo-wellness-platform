/**
 * Skills tab data types, CASEL domain mapping, and score helpers.
 *
 * SEL screener subtypes (8) are grouped into the 5 CASEL domains:
 *   - Self-Awareness: self_concept + emotion_knowledge
 *   - Self-Management: emotion_regulation + goal_management + school_work
 *   - Social Awareness: social_awareness
 *   - Relationship Skills: relationship_skills
 *   - Responsible Decision-Making: responsible_decision_making
 *
 * Score normalization: percentage = score / maxScore (0–1 range).
 * Thresholds:
 *   - Excelling:  >= 75%
 *   - On Track:   >= 50%
 *   - Developing: < 50%
 */

export type ScoreLevel = "excelling" | "on_track" | "developing";

export type CaselDomainScore = {
  domain: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: ScoreLevel;
};

export type Distribution = {
  developing: number;
  on_track: number;
  excelling: number;
};

/** The 8 SEL screener session subtypes used for skill development. */
export const SEL_SUBTYPES = [
  "sel_self_awareness_self_concept",
  "sel_self_awareness_emotion_knowledge",
  "sel_social_awareness",
  "sel_self_management_emotion_regulation",
  "sel_self_management_goal_management",
  "sel_self_management_school_work",
  "sel_relationship_skills",
  "sel_responsible_decision_making",
] as const;

/** Maps each SEL subtype to one of the 5 CASEL domains. */
export const SEL_SUBTYPE_TO_CASEL: Record<string, string> = {
  sel_self_awareness_self_concept: "self_awareness",
  sel_self_awareness_emotion_knowledge: "self_awareness",
  sel_social_awareness: "social_awareness",
  sel_self_management_emotion_regulation: "self_management",
  sel_self_management_goal_management: "self_management",
  sel_self_management_school_work: "self_management",
  sel_relationship_skills: "relationship_skills",
  sel_responsible_decision_making: "responsible_decision_making",
};

export const CASEL_DOMAIN_LABELS: Record<string, string> = {
  self_awareness: "Self-Awareness",
  self_management: "Self-Management",
  social_awareness: "Social Awareness",
  relationship_skills: "Relationship Skills",
  responsible_decision_making: "Responsible Decision-Making",
};

export const CASEL_DOMAIN_ORDER = [
  "self_awareness",
  "self_management",
  "social_awareness",
  "relationship_skills",
  "responsible_decision_making",
];

export const CASEL_DOMAIN_COLORS: Record<string, string> = {
  self_awareness: "#3b82f6",
  self_management: "#8b5cf6",
  social_awareness: "#10b981",
  relationship_skills: "#f59e0b",
  responsible_decision_making: "#ec4899",
};

const EXCELLING_THRESHOLD = 0.75;
const ON_TRACK_THRESHOLD = 0.5;

export function getScoreLevel(pct: number): ScoreLevel {
  if (pct >= EXCELLING_THRESHOLD) return "excelling";
  if (pct >= ON_TRACK_THRESHOLD) return "on_track";
  return "developing";
}

export function getScoreLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case "excelling":
      return "Excelling";
    case "on_track":
      return "On Track";
    case "developing":
      return "Developing";
  }
}

/** Aggregates 8 subtype rows into 5 CASEL domain scores. */
export function buildCaselDomains(
  subtypeRows: { subtype: string; score: number; maxScore: number }[],
): CaselDomainScore[] {
  const domainMap = new Map<string, { score: number; maxScore: number }>();

  for (const row of subtypeRows) {
    const caselDomain = SEL_SUBTYPE_TO_CASEL[row.subtype];
    if (!caselDomain) continue;

    const existing = domainMap.get(caselDomain) ?? { score: 0, maxScore: 0 };
    existing.score += row.score;
    existing.maxScore += row.maxScore;
    domainMap.set(caselDomain, existing);
  }

  return CASEL_DOMAIN_ORDER.filter((d) => domainMap.has(d))
    .map((domain) => {
      const data = domainMap.get(domain);
      if (!data) return null;
      const pct = data.maxScore > 0 ? data.score / data.maxScore : 0;
      return {
        domain,
        label: CASEL_DOMAIN_LABELS[domain] ?? domain,
        score: data.score,
        maxScore: data.maxScore,
        percentage: pct,
        level: getScoreLevel(pct),
      };
    })
    .filter((d): d is CaselDomainScore => d !== null);
}

/** Classifies per-student scores into a distribution of Developing/On Track/Excelling. */
export function buildDistribution(
  studentRows: { score: number; maxScore: number }[],
): { distribution: Distribution; studentCount: number } {
  const distribution: Distribution = {
    developing: 0,
    on_track: 0,
    excelling: 0,
  };

  for (const row of studentRows) {
    const pct = row.maxScore > 0 ? row.score / row.maxScore : 0;
    distribution[getScoreLevel(pct)]++;
  }

  return { distribution, studentCount: studentRows.length };
}
