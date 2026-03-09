import type { ChecklistConfig } from "@/lib/exercises/types";

export const sleepHygieneChecklist: ChecklistConfig = {
  id: "f32-checklist-sleep-hygiene",
  type: "checklist",
  title: "Sleep Hygiene Checklist",
  subtitle: "Daily habits for better sleep",
  description: "Review and check off each healthy sleep habit you practiced today. Building consistent sleep hygiene is essential for managing depression symptoms.",
  estimatedMinutes: 5,
  completionMessage: "Great work reviewing your sleep habits! Consistent sleep hygiene is one of the most effective tools for managing mood.",
  applicableCodes: ["F32", "F33", "F41"],
  requireAll: false,
  allowPartialSave: true,
  items: [
    {
      id: "consistent-wake",
      label: "I woke up at a consistent time today",
      helpText: "Waking at the same time every day (even weekends) helps regulate your circadian rhythm and improves sleep quality over time.",
    },
    {
      id: "limit-caffeine",
      label: "I avoided caffeine after 2pm",
      helpText: "Caffeine has a half-life of 5-6 hours, meaning half of it is still in your system hours later. Afternoon caffeine can significantly impact sleep quality.",
    },
    {
      id: "screen-free",
      label: "I stopped using screens 1 hour before bed",
      helpText: "Blue light from screens suppresses melatonin production. The content we consume can also be stimulating and make it harder to wind down.",
    },
    {
      id: "relaxation",
      label: "I practiced a relaxation technique before bed",
      helpText: "This could include deep breathing, progressive muscle relaxation, gentle stretching, or meditation. Even 5-10 minutes helps signal to your body it's time to sleep.",
    },
    {
      id: "comfortable-environment",
      label: "My bedroom was cool, dark, and quiet",
      helpText: "The ideal sleeping temperature is 60-67°F (15-19°C). Use blackout curtains and white noise if needed. Your bedroom should be a sleep sanctuary.",
    },
    {
      id: "no-bed-activities",
      label: "I only used my bed for sleep (not watching TV, working, etc.)",
      helpText: "This strengthens the mental association between your bed and sleep. If you can't sleep after 20 minutes, get up and do something calming until you feel sleepy.",
    },
    {
      id: "limit-alcohol",
      label: "I avoided alcohol close to bedtime",
      helpText: "While alcohol may help you fall asleep faster, it disrupts REM sleep and causes more awakenings in the second half of the night.",
    },
    {
      id: "exercise",
      label: "I got some physical activity today (not within 3 hours of bed)",
      helpText: "Regular exercise improves sleep quality, but exercising too close to bedtime can be stimulating. Aim to finish workouts at least 3 hours before bed.",
    },
    {
      id: "light-exposure",
      label: "I got natural light exposure during the day",
      helpText: "Exposure to natural light, especially in the morning, helps regulate your circadian rhythm and improves nighttime sleep quality.",
    },
    {
      id: "worry-journal",
      label: "I wrote down any worries before bed to clear my mind",
      helpText: "Spending 5-10 minutes writing down worries or tomorrow's to-do list can help prevent racing thoughts when trying to fall asleep.",
    },
  ],
};

export default sleepHygieneChecklist;
