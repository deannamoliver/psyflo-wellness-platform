import type { TrackerConfig } from "@/lib/exercises/types";

export const gad7SelfCheck: TrackerConfig = {
  id: "f41-1-01",
  type: "tracker",
  title: "Weekly GAD-7 Self-Check",
  subtitle: "Anxiety symptom tracker",
  description: "Over the last 2 weeks, how often have you been bothered by the following problems?",
  estimatedMinutes: 5,
  completionMessage: "Thank you for completing your weekly check-in. Your counselor will review your responses.",
  applicableCodes: ["F41"],
  frequency: "weekly",
  showTrend: true,
  showStreak: true,
  scoringFunction: "gad7",
  alertRules: [
    {
      fieldId: "gad7_total",
      condition: "gte",
      value: 15,
      severity: "warning",
      message: "GAD-7 score indicates severe anxiety. Please review with clinician.",
      notifyClinician: true,
    },
  ],
  fields: [
    {
      id: "gad7_q1",
      label: "Feeling nervous, anxious, or on edge",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q2",
      label: "Not being able to stop or control worrying",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q3",
      label: "Worrying too much about different things",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q4",
      label: "Trouble relaxing",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q5",
      label: "Being so restless that it's hard to sit still",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q6",
      label: "Becoming easily annoyed or irritable",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
    {
      id: "gad7_q7",
      label: "Feeling afraid as if something awful might happen",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
  ],
};

export default gad7SelfCheck;
