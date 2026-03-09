import type { ChecklistConfig } from "@/lib/exercises/types";

export const weeklyWellnessCheckIn: ChecklistConfig = {
  id: "f33-2-03",
  type: "checklist",
  title: "Weekly Wellness Check-In",
  subtitle: "Brief self-assessment across key domains",
  description: "Rate your wellness across sleep, appetite, energy, social engagement, mood, and motivation with color-coded feedback.",
  estimatedMinutes: 5,
  completionMessage: "Check-in complete! Pay attention to any yellow or red zones.",
  applicableCodes: ["F33"],
  requireAll: true,
  allowPartialSave: false,
  items: [
    {
      id: "sleep-quality",
      label: "My sleep has been adequate this week (6-8 hours, restful)",
      helpText: "Green if mostly good sleep, Yellow if some disruption, Red if significant problems",
    },
    {
      id: "sleep-routine",
      label: "I've maintained a consistent sleep schedule",
      helpText: "Going to bed and waking up at similar times",
    },
    {
      id: "appetite-normal",
      label: "My appetite has been normal this week",
      helpText: "Eating regular meals without significant over/under eating",
    },
    {
      id: "energy-adequate",
      label: "I've had enough energy to do daily activities",
      helpText: "Able to complete basic tasks without excessive fatigue",
    },
    {
      id: "social-connection",
      label: "I've had meaningful social connection this week",
      helpText: "Quality time with friends, family, or community (in person or virtually)",
    },
    {
      id: "social-responsiveness",
      label: "I've been responding to messages and calls",
      helpText: "Not avoiding or ignoring people reaching out",
    },
    {
      id: "mood-stable",
      label: "My mood has been relatively stable this week",
      helpText: "Not extreme highs and lows or persistent low mood",
    },
    {
      id: "mood-enjoyment",
      label: "I've experienced moments of enjoyment or interest",
      helpText: "Some activities or moments felt engaging or pleasant",
    },
    {
      id: "motivation-present",
      label: "I've felt motivated to engage in activities",
      helpText: "Wanted to do things, not just forcing myself through everything",
    },
    {
      id: "self-care",
      label: "I've maintained basic self-care (hygiene, eating, etc.)",
      helpText: "Showering, brushing teeth, changing clothes, eating meals",
    },
    {
      id: "no-hopelessness",
      label: "I have NOT had persistent thoughts of hopelessness",
      helpText: "If you've had thoughts like 'things will never get better' or 'what's the point', leave unchecked",
    },
    {
      id: "no-self-harm-thoughts",
      label: "I have NOT had thoughts of hurting myself",
      helpText: "If you've had any thoughts of self-harm or suicide, leave unchecked and talk to your clinician",
    },
  ],
};

export default weeklyWellnessCheckIn;
