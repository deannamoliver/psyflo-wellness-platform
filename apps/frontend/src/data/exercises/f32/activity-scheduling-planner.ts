import type { WorksheetConfig } from "@/lib/exercises/types";

export const activitySchedulingPlanner: WorksheetConfig = {
  id: "f32-2-02",
  type: "worksheet",
  title: "Activity Scheduling Planner",
  subtitle: "Weekly activity planning calendar",
  description: "Schedule 1-2 intentional activities per day across self-care, social, productive, and pleasurable categories to rebuild your routine.",
  estimatedMinutes: 15,
  completionMessage: "Your weekly plan is set! Remember, even small activities count toward building momentum.",
  applicableCodes: ["F32", "F33"],
  printable: true,
  sections: [
    {
      id: "header-intro",
      type: "header",
      content: "Plan Your Week",
      level: 2,
    },
    {
      id: "weekly-schedule",
      type: "table",
      label: "Schedule 1-2 activities per day. Include the category (S=Self-care, So=Social, P=Productive, Pl=Pleasurable)",
      columns: [
        { id: "day", header: "Day", type: "select", options: [
          { value: "monday", label: "Monday" },
          { value: "tuesday", label: "Tuesday" },
          { value: "wednesday", label: "Wednesday" },
          { value: "thursday", label: "Thursday" },
          { value: "friday", label: "Friday" },
          { value: "saturday", label: "Saturday" },
          { value: "sunday", label: "Sunday" },
        ], width: "15%" },
        { id: "activity", header: "Planned Activity", type: "text", width: "35%" },
        { id: "category", header: "Category", type: "select", options: [
          { value: "self-care", label: "Self-care" },
          { value: "social", label: "Social" },
          { value: "productive", label: "Productive" },
          { value: "pleasurable", label: "Pleasurable" },
        ], width: "20%" },
        { id: "time", header: "Time", type: "text", width: "15%" },
        { id: "completed", header: "Done?", type: "select", options: [
          { value: "yes", label: "✓" },
          { value: "no", label: "—" },
        ], width: "10%" },
      ],
      minRows: 7,
      maxRows: 14,
      addRowLabel: "Add activity",
    },
    {
      id: "header-review",
      type: "header",
      content: "End of Week Review",
      level: 2,
    },
    {
      id: "mood-rating",
      type: "rating-row",
      label: "Rate your mood each day this week",
      items: [
        { id: "monday", label: "Monday" },
        { id: "tuesday", label: "Tuesday" },
        { id: "wednesday", label: "Wednesday" },
        { id: "thursday", label: "Thursday" },
        { id: "friday", label: "Friday" },
        { id: "saturday", label: "Saturday" },
        { id: "sunday", label: "Sunday" },
      ],
      min: 1,
      max: 5,
      minLabel: "Very low",
      maxLabel: "Great",
    },
    {
      id: "reflection",
      type: "text-field",
      label: "What did you notice about the connection between activities and mood?",
      placeholder: "Reflect on patterns you observed...",
      multiline: true,
    },
    {
      id: "next-week",
      type: "text-field",
      label: "What will you do differently next week?",
      placeholder: "Any adjustments to make...",
      multiline: true,
    },
  ],
};

export default activitySchedulingPlanner;
