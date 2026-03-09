import type { TrackerConfig } from "@/lib/exercises/types";

export const medicationAdherenceTracker: TrackerConfig = {
  id: "cross-01",
  type: "tracker",
  title: "Medication Adherence Tracker",
  subtitle: "Daily medication tracking",
  description: "Daily yes/no check-in per medication with side effects notes and streak tracking.",
  estimatedMinutes: 1,
  completionMessage: "Medications logged! Consistent tracking supports your treatment.",
  applicableCodes: ["F32", "F33", "F41", "F43", "F90", "R45"],
  frequency: "daily",
  showTrend: true,
  showStreak: true,
  fields: [
    {
      id: "med1_taken",
      label: "Did you take your primary medication today?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "partial", label: "Partial dose" },
        { value: "na", label: "N/A" },
      ],
      required: true,
    },
    {
      id: "med1_time",
      label: "Time taken (if applicable)",
      type: "time",
      required: false,
    },
    {
      id: "med2_taken",
      label: "Did you take your second medication? (if applicable)",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "partial", label: "Partial dose" },
        { value: "na", label: "N/A - no second medication" },
      ],
      required: false,
    },
    {
      id: "med3_taken",
      label: "Did you take your third medication? (if applicable)",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "partial", label: "Partial dose" },
        { value: "na", label: "N/A - no third medication" },
      ],
      required: false,
    },
    {
      id: "side_effects",
      label: "Any side effects noticed?",
      type: "select",
      options: [
        { value: "none", label: "None" },
        { value: "mild", label: "Mild" },
        { value: "moderate", label: "Moderate" },
        { value: "severe", label: "Severe" },
      ],
      required: true,
    },
    {
      id: "side_effect_notes",
      label: "Side effect details (if any)",
      type: "text",
      required: false,
      helpText: "Describe any side effects you experienced",
    },
    {
      id: "missed_reason",
      label: "If you missed a dose, why?",
      type: "select",
      options: [
        { value: "na", label: "N/A - took all medications" },
        { value: "forgot", label: "Forgot" },
        { value: "side_effects", label: "Side effects" },
        { value: "ran_out", label: "Ran out of medication" },
        { value: "choice", label: "Chose not to take it" },
        { value: "other", label: "Other" },
      ],
      required: false,
    },
  ],
  alertRules: [
    {
      fieldId: "side_effects",
      condition: "eq",
      value: "severe",
      severity: "critical",
      message: "Severe side effects reported. Please contact your prescriber.",
      notifyClinician: true,
    },
  ],
};

export default medicationAdherenceTracker;
