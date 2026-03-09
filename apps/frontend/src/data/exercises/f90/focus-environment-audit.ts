import type { ChecklistConfig } from "@/lib/exercises/types";

export const focusEnvironmentAudit: ChecklistConfig = {
  id: "f90-1-02",
  type: "checklist",
  title: "Focus Environment Audit",
  subtitle: "Identify and address distractors",
  description: "Checklist of common distractors with mitigation strategies. Set up your environment for focus success.",
  estimatedMinutes: 10,
  completionMessage: "Your environment is set up for better focus! Revisit this when you notice distractions creeping back.",
  applicableCodes: ["F90"],
  requireAll: false,
  allowPartialSave: true,
  items: [
    {
      id: "phone-silent",
      label: "Phone on silent or Do Not Disturb during focus time",
      helpText: "Notifications are focus killers. Even a buzz can derail your train of thought.",
    },
    {
      id: "phone-location",
      label: "Phone in another room or out of sight during focus time",
      helpText: "Out of sight = out of mind. Even seeing your phone reduces cognitive capacity.",
    },
    {
      id: "app-blockers",
      label: "App/website blockers installed for distracting sites",
      helpText: "Tools like Freedom, Cold Turkey, or built-in Screen Time can block tempting sites.",
    },
    {
      id: "notifications-off",
      label: "Desktop/laptop notifications turned off",
      helpText: "Email, Slack, Teams — turn them all off during focus time.",
    },
    {
      id: "tabs-closed",
      label: "Unnecessary browser tabs closed",
      helpText: "Each open tab is a potential distraction. Close everything except what you need.",
    },
    {
      id: "desk-clear",
      label: "Desk/workspace cleared of clutter",
      helpText: "Visual clutter = mental clutter. Keep only what you need for the current task.",
    },
    {
      id: "supplies-ready",
      label: "All needed supplies within reach before starting",
      helpText: "Avoid getting up mid-task. Have water, snacks, materials ready.",
    },
    {
      id: "noise-managed",
      label: "Noise environment optimized (headphones, white noise, quiet space)",
      helpText: "Find what works for you — some focus better with background noise, others need silence.",
    },
    {
      id: "lighting-good",
      label: "Lighting is adequate (not too dim, not harsh)",
      helpText: "Good lighting reduces eye strain and keeps you alert.",
    },
    {
      id: "temperature-comfortable",
      label: "Temperature is comfortable",
      helpText: "Too hot or cold? You'll be distracted. Adjust before starting.",
    },
    {
      id: "others-notified",
      label: "Others know not to interrupt during focus time",
      helpText: "Tell roommates/family when you need uninterrupted time. Use a signal if helpful.",
    },
    {
      id: "timer-visible",
      label: "Timer visible to track focus sessions",
      helpText: "External time pressure helps. Use a visible timer or Pomodoro app.",
    },
  ],
};

export default focusEnvironmentAudit;
