import type { ExerciseConfig } from "@/lib/exercises/types";

export const diaphragmaticBreathing: ExerciseConfig = {
  id: "f41-3-01",
  type: "exercise",
  title: "Diaphragmatic Breathing Guide",
  subtitle: "Activate your relaxation response",
  description: "Learn and practice slow, deep diaphragmatic breathing using the 4-7-8 technique to reduce anxiety and activate your parasympathetic nervous system.",
  estimatedMinutes: 8,
  completionMessage: "Great practice! Use this technique anytime you feel anxious or stressed.",
  applicableCodes: ["F41", "F32", "F33", "F43", "R45"],
  allowBackNavigation: true,
  showProgressBar: true,
  steps: [
    {
      id: "intro",
      type: "instruction",
      label: "Why Breathing Matters",
      content: "When anxious, we tend to breathe fast and shallow — from our chest. This keeps the fight-flight response active.\n\n**Slow, deep breathing** from your diaphragm (belly) activates the **parasympathetic nervous system** — your body's 'rest and digest' mode.\n\nThis is one of the fastest ways to reduce physical anxiety symptoms.\n\nWe'll practice the **4-7-8 technique**:\n• Inhale for 4 counts\n• Hold for 7 counts\n• Exhale for 8 counts",
    },
    {
      id: "pre-rating",
      type: "likert",
      label: "Rate your current anxiety/tension level",
      min: 0,
      max: 10,
      minLabel: "Completely calm",
      maxLabel: "Extremely anxious",
      required: true,
    },
    {
      id: "position",
      type: "instruction",
      label: "Get Comfortable",
      content: "Find a comfortable position — sitting or lying down.\n\n1. Place one hand on your chest and one on your belly\n2. Relax your shoulders\n3. Close your eyes if comfortable\n\nThe goal: When you breathe, your **belly hand** should rise, while your **chest hand** stays relatively still. This means you're breathing from your diaphragm.",
    },
    {
      id: "practice-1",
      type: "instruction",
      label: "Practice Round 1",
      content: "Let's do 3 breath cycles together.\n\n**Breath 1:**\n• **INHALE** slowly through your nose... 2... 3... 4\n• **HOLD** gently... 2... 3... 4... 5... 6... 7\n• **EXHALE** slowly through your mouth... 2... 3... 4... 5... 6... 7... 8\n\n**Breath 2:**\n• **INHALE**... 2... 3... 4\n• **HOLD**... 2... 3... 4... 5... 6... 7\n• **EXHALE**... 2... 3... 4... 5... 6... 7... 8\n\n**Breath 3:**\n• **INHALE**... 2... 3... 4\n• **HOLD**... 2... 3... 4... 5... 6... 7\n• **EXHALE**... 2... 3... 4... 5... 6... 7... 8\n\n*Continue to the next step when ready.*",
    },
    {
      id: "check-in-1",
      type: "likert",
      label: "How are you feeling after 3 breaths?",
      min: 0,
      max: 10,
      minLabel: "Completely calm",
      maxLabel: "Still very anxious",
      required: true,
    },
    {
      id: "practice-2",
      type: "instruction",
      label: "Practice Round 2",
      content: "Let's do 3 more breath cycles. Focus on making the exhale longer than the inhale — this is key for activating relaxation.\n\n**Breath 4:**\n• **INHALE** through nose... 2... 3... 4\n• **HOLD**... 2... 3... 4... 5... 6... 7\n• **EXHALE** through mouth... 2... 3... 4... 5... 6... 7... 8\n\n**Breath 5:**\n• **INHALE**... 2... 3... 4\n• **HOLD**... 2... 3... 4... 5... 6... 7\n• **EXHALE**... 2... 3... 4... 5... 6... 7... 8\n\n**Breath 6:**\n• **INHALE**... 2... 3... 4\n• **HOLD**... 2... 3... 4... 5... 6... 7\n• **EXHALE**... 2... 3... 4... 5... 6... 7... 8",
    },
    {
      id: "post-rating",
      type: "likert",
      label: "Rate your anxiety/tension level now",
      min: 0,
      max: 10,
      minLabel: "Completely calm",
      maxLabel: "Extremely anxious",
      required: true,
    },
    {
      id: "tips",
      type: "instruction",
      label: "Tips for Using This Technique",
      content: "**When to use:**\n• When you notice anxiety rising\n• Before stressful situations\n• To help fall asleep\n• Anytime you need to calm down\n\n**Tips:**\n• If 4-7-8 feels too long, start with 3-5-6\n• Don't force it — let it be gentle\n• Practice daily, even when calm, to build the skill\n• 3-6 breath cycles is usually enough to feel a shift\n\n**Remember:** This works best with practice. The more you use it when calm, the more effective it'll be when anxious.",
    },
    {
      id: "reflection",
      type: "reflection",
      label: "Reflection",
      prompt: "What did you notice during the breathing practice? When might you use this technique?",
    },
  ],
};

export default diaphragmaticBreathing;
