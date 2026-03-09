import type { TrackerConfig } from "@/lib/exercises/types";

export const phq9SelfCheck: TrackerConfig = {
  id: "f32-tracker-phq9",
  type: "tracker",
  title: "Weekly PHQ-9 Self-Check",
  subtitle: "Depression symptom tracker",
  description: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  estimatedMinutes: 5,
  completionMessage: "Thank you for completing your weekly check-in. Your counselor will review your responses.",
  applicableCodes: ["F32", "F33"],
  frequency: "weekly",
  showTrend: true,
  showStreak: true,
  scoringFunction: "phq9",
  alertRules: [
    {
      fieldId: "phq9_q9",
      condition: "gte",
      value: 1,
      severity: "critical",
      message: "Patient indicated thoughts of self-harm. Please assess immediately.",
      notifyClinician: true,
    },
  ],
  fields: [
    {
      id: "phq9_q1",
      label: "Little interest or pleasure in doing things",
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
      id: "phq9_q2",
      label: "Feeling down, depressed, or hopeless",
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
      id: "phq9_q3",
      label: "Trouble falling or staying asleep, or sleeping too much",
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
      id: "phq9_q4",
      label: "Feeling tired or having little energy",
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
      id: "phq9_q5",
      label: "Poor appetite or overeating",
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
      id: "phq9_q6",
      label: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
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
      id: "phq9_q7",
      label: "Trouble concentrating on things, such as reading the newspaper or watching television",
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
      id: "phq9_q8",
      label: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
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
      id: "phq9_q9",
      label: "Thoughts that you would be better off dead or of hurting yourself in some way",
      type: "select",
      required: true,
      helpText: "This question helps us understand if you need additional support. Please answer honestly.",
      options: [
        { value: "0", label: "Not at all" },
        { value: "1", label: "Several days" },
        { value: "2", label: "More than half the days" },
        { value: "3", label: "Nearly every day" },
      ],
    },
  ],
};

export default phq9SelfCheck;
