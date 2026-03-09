import type { TrackerConfig } from "@/lib/exercises/types";

export const protectiveFactorsHabitTracker: TrackerConfig = {
  id: "f33-4-01",
  type: "tracker",
  title: "Protective Factors Habit Tracker",
  subtitle: "Daily wellness habit tracking",
  description: "Track daily protective behaviors — exercise, social connection, sleep hygiene, mindfulness, and medication adherence — with streak tracking.",
  estimatedMinutes: 2,
  completionMessage: "Daily check-in complete! Keep building those protective habits.",
  applicableCodes: ["F33"],
  frequency: "daily",
  showTrend: true,
  showStreak: true,
  fields: [
    {
      id: "exercise",
      label: "Did you get physical movement today? (20+ minutes)",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      required: true,
    },
    {
      id: "social",
      label: "Did you have meaningful social connection today?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      required: true,
      helpText: "In-person, phone, video — quality over quantity",
    },
    {
      id: "sleep_hygiene",
      label: "Did you follow your sleep hygiene routine?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "partial", label: "Partially" },
        { value: "no", label: "No" },
      ],
      required: true,
    },
    {
      id: "mindfulness",
      label: "Did you practice mindfulness today? (even 5 minutes)",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      required: true,
      helpText: "Meditation, breathing exercises, mindful activity",
    },
    {
      id: "medication",
      label: "Did you take your medication as prescribed?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "na", label: "N/A - No medication" },
        { value: "no", label: "No" },
      ],
      required: true,
    },
    {
      id: "meals",
      label: "Did you eat regular meals today?",
      type: "select",
      options: [
        { value: "yes", label: "Yes (2-3 meals)" },
        { value: "partial", label: "Somewhat (1-2 meals)" },
        { value: "no", label: "No" },
      ],
      required: true,
    },
    {
      id: "outdoors",
      label: "Did you spend time outdoors?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      required: false,
    },
    {
      id: "overall_mood",
      label: "Overall mood today",
      type: "likert",
      min: 1,
      max: 10,
      minLabel: "Very low",
      maxLabel: "Excellent",
      required: true,
    },
    {
      id: "notes",
      label: "Notes (optional)",
      type: "text",
      required: false,
    },
  ],
};

export default protectiveFactorsHabitTracker;
