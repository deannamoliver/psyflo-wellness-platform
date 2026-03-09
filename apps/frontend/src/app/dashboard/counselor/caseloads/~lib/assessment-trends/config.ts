import type { screenerTypeEnum } from "@feelwell/database";

type ScreenerType = (typeof screenerTypeEnum.enumValues)[number];

export const ASSESSMENT_SERIES_CONFIG: Record<
  Exclude<ScreenerType, "sel">,
  { label: string; color: string }
> = {
  phq_a: { label: "Depression (PHQ-A)", color: "#6366f1" },
  phq_9: { label: "Depression (PHQ-9)", color: "#a78bfa" },
  gad_child: { label: "Anxiety (GAD-7, Child)", color: "#22c55e" },
  gad_7: { label: "Anxiety (GAD-7)", color: "#f97316" },
};
