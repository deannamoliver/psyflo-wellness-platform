import type { WorksheetConfig } from "@/lib/exercises/types";

export const betweenSessionCheckIn: WorksheetConfig = {
  id: "cross-03",
  type: "worksheet",
  title: "Between-Session Check-In",
  subtitle: "Mid-week brief assessment",
  description: "A brief mid-week prompt with mood rating, homework progress, and optional urgent-flag for clinician notification.",
  estimatedMinutes: 3,
  completionMessage: "Check-in submitted. Your clinician may follow up if you flagged anything urgent.",
  applicableCodes: ["F32", "F33", "F41", "F43", "F90", "R45"],
  printable: false,
  sections: [
    {
      id: "header",
      type: "header",
      content: "Mid-Week Check-In",
      level: 1,
    },
    {
      id: "mood",
      type: "rating-row",
      label: "How is your mood today?",
      items: [{ id: "mood", label: "Mood" }],
      min: 1,
      max: 10,
      minLabel: "Very low",
      maxLabel: "Excellent",
    },
    {
      id: "anxiety",
      type: "rating-row",
      label: "How is your anxiety level?",
      items: [{ id: "anxiety", label: "Anxiety" }],
      min: 1,
      max: 10,
      minLabel: "None",
      maxLabel: "Severe",
    },
    {
      id: "homework-progress",
      type: "text-field",
      label: "How is your homework/exercise progress this week?",
      placeholder: "What have you been working on? Any challenges?",
      multiline: true,
    },
    {
      id: "brief-update",
      type: "text-field",
      label: "Anything important happening this week?",
      placeholder: "Brief update on your week...",
      multiline: true,
    },
    {
      id: "struggling",
      type: "text-field",
      label: "Is there anything you're struggling with right now?",
      multiline: true,
    },
    {
      id: "urgent-flag",
      type: "text-field",
      label: "Is there anything URGENT your clinician should know about?",
      helpText: "If you check this, your clinician will be notified. For emergencies, call 988 or go to your nearest ER.",
      placeholder: "Leave blank if nothing urgent. Describe concern if urgent.",
      multiline: true,
    },
    {
      id: "support-needed",
      type: "text-field",
      label: "What support do you need right now?",
      placeholder: "e.g., Just checking in, would like a call, need to reschedule, have a question...",
      multiline: true,
    },
  ],
};

export default betweenSessionCheckIn;
