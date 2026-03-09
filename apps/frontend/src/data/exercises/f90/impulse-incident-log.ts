import type { TrackerConfig } from "@/lib/exercises/types";

export const impulseIncidentLog: TrackerConfig = {
  id: "f90-2-02",
  type: "tracker",
  title: "Impulse Incident Log",
  subtitle: "Track impulsive moments",
  description: "Brief self-monitoring log for impulsive incidents: what happened, trigger, consequence, and whether you could have paused.",
  estimatedMinutes: 3,
  completionMessage: "Incident logged. Tracking builds awareness — the first step to change.",
  applicableCodes: ["F90"],
  frequency: "daily",
  showTrend: true,
  showStreak: true,
  fields: [
    {
      id: "incident",
      label: "What impulsive thing did you do (or almost do)?",
      type: "text",
      required: true,
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "verbal", label: "Verbal (interrupting, blurting, saying something regrettable)" },
        { value: "spending", label: "Spending (impulsive purchases)" },
        { value: "task_switching", label: "Task switching (abandoning current task)" },
        { value: "eating", label: "Eating (impulsive snacking)" },
        { value: "digital", label: "Digital (checking phone, social media, etc.)" },
        { value: "emotional", label: "Emotional reaction (anger, frustration outburst)" },
        { value: "other", label: "Other" },
      ],
      required: true,
    },
    {
      id: "trigger",
      label: "What triggered the impulse?",
      type: "text",
      required: false,
      helpText: "Boredom, stress, excitement, seeing/hearing something?",
    },
    {
      id: "acted_on_it",
      label: "Did you act on the impulse?",
      type: "select",
      options: [
        { value: "yes", label: "Yes, fully" },
        { value: "partially", label: "Partially — caught myself midway" },
        { value: "no", label: "No, I paused and didn't act" },
      ],
      required: true,
    },
    {
      id: "consequence",
      label: "What was the consequence?",
      type: "text",
      required: false,
      helpText: "How did it affect you, others, your goals?",
    },
    {
      id: "could_pause",
      label: "Looking back, could you have paused?",
      type: "select",
      options: [
        { value: "yes", label: "Yes, there was a moment I could have stopped" },
        { value: "maybe", label: "Maybe, if I'd been more aware" },
        { value: "no", label: "No, it happened too fast" },
      ],
      required: true,
    },
    {
      id: "what_helped",
      label: "What might help next time?",
      type: "text",
      required: false,
    },
  ],
};

export default impulseIncidentLog;
