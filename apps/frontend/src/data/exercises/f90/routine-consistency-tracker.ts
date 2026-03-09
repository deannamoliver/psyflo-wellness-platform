import type { TrackerConfig } from "@/lib/exercises/types";

export const routineConsistencyTracker: TrackerConfig = {
  id: "f90-3-02",
  type: "tracker",
  title: "Routine Consistency Tracker",
  subtitle: "Build morning and evening habits",
  description: "Track your morning and evening routine completion with consistency percentage and streak tracking.",
  estimatedMinutes: 2,
  completionMessage: "Routine logged! Consistency builds momentum over time.",
  applicableCodes: ["F90"],
  frequency: "daily",
  showTrend: true,
  showStreak: true,
  fields: [
    {
      id: "morning_routine",
      label: "Did you complete your morning routine?",
      type: "select",
      options: [
        { value: "full", label: "Yes, fully" },
        { value: "partial", label: "Partially (some items)" },
        { value: "no", label: "No" },
      ],
      required: true,
    },
    {
      id: "morning_items",
      label: "Morning routine items completed",
      type: "multiselect",
      options: [
        { value: "wake_time", label: "Woke up on time" },
        { value: "made_bed", label: "Made bed" },
        { value: "hygiene", label: "Hygiene (shower, teeth, etc.)" },
        { value: "dressed", label: "Got dressed" },
        { value: "breakfast", label: "Ate breakfast" },
        { value: "medication", label: "Took medication" },
        { value: "review_day", label: "Reviewed day/to-do list" },
      ],
      required: false,
    },
    {
      id: "evening_routine",
      label: "Did you complete your evening routine?",
      type: "select",
      options: [
        { value: "full", label: "Yes, fully" },
        { value: "partial", label: "Partially (some items)" },
        { value: "no", label: "No" },
        { value: "na", label: "N/A (haven't done evening yet)" },
      ],
      required: true,
    },
    {
      id: "evening_items",
      label: "Evening routine items completed",
      type: "multiselect",
      options: [
        { value: "prep_tomorrow", label: "Prepared for tomorrow" },
        { value: "tidy_space", label: "Tidied space" },
        { value: "wind_down", label: "Wind-down activity" },
        { value: "screens_off", label: "Screens off by target time" },
        { value: "bed_time", label: "In bed on time" },
      ],
      required: false,
    },
    {
      id: "what_helped",
      label: "What helped you stick to routine today?",
      type: "text",
      required: false,
    },
    {
      id: "what_derailed",
      label: "What got in the way (if anything)?",
      type: "text",
      required: false,
    },
  ],
};

export default routineConsistencyTracker;
