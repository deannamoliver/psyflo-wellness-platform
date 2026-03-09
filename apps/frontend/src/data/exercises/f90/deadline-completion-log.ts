import type { TrackerConfig } from "@/lib/exercises/types";

export const deadlineCompletionLog: TrackerConfig = {
  id: "f90-4-02",
  type: "tracker",
  title: "Deadline & Completion Log",
  subtitle: "Track on-time task completion",
  description: "Log tasks, deadlines, and completion dates to track your on-time percentage toward the 90% goal.",
  estimatedMinutes: 2,
  completionMessage: "Task logged! Keep tracking to see your on-time percentage improve.",
  applicableCodes: ["F90"],
  frequency: "daily",
  showTrend: true,
  showStreak: true,
  fields: [
    {
      id: "task",
      label: "What task did you complete?",
      type: "text",
      required: true,
    },
    {
      id: "deadline",
      label: "What was the deadline?",
      type: "text",
      required: true,
      helpText: "Date/time the task was due",
    },
    {
      id: "completion_date",
      label: "When did you actually complete it?",
      type: "text",
      required: true,
    },
    {
      id: "on_time",
      label: "Was it on time?",
      type: "select",
      options: [
        { value: "early", label: "Early" },
        { value: "on_time", label: "On time" },
        { value: "slightly_late", label: "Slightly late (within 24 hrs)" },
        { value: "late", label: "Late (more than 24 hrs)" },
      ],
      required: true,
    },
    {
      id: "what_helped",
      label: "What helped you get it done?",
      type: "text",
      required: false,
      helpText: "e.g., Broke it down, set reminders, body doubling, deadline pressure",
    },
    {
      id: "what_hindered",
      label: "What got in the way (if anything)?",
      type: "text",
      required: false,
      helpText: "e.g., Forgot about it, underestimated time, got distracted",
    },
    {
      id: "lesson",
      label: "Lesson for next time",
      type: "text",
      required: false,
    },
  ],
};

export default deadlineCompletionLog;
