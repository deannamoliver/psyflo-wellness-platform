import type { PsychoedConfig } from "@/lib/exercises/types";

export const understandingStressTrauma: PsychoedConfig = {
  id: "f43-1-03",
  type: "psychoed",
  title: "Understanding Stress & Trauma Responses",
  subtitle: "Learn about normal reactions to abnormal events",
  description: "Learn about normal stress responses, the window of tolerance, and why your symptoms are adaptive—not signs of weakness.",
  estimatedMinutes: 12,
  completionMessage: "Understanding your stress response is the first step toward healing.",
  applicableCodes: ["F43"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "intro",
      type: "text",
      title: "Normal Reactions to Abnormal Events",
      content: "When something overwhelming happens, your mind and body respond in ways that might feel strange or scary.\n\nBut here's the key insight: **Your reactions are normal responses to abnormal circumstances.**\n\nYou're not broken. You're not weak. Your system is doing what it was designed to do.\n\nLet's understand how stress and trauma affect us.",
    },
    {
      id: "stress-response",
      type: "text",
      title: "The Stress Response System",
      content: "Your nervous system has two main modes:\n\n**Sympathetic** (fight or flight)\n• Activated when danger is perceived\n• Heart races, breathing quickens\n• Prepares you to fight or flee\n\n**Parasympathetic** (rest and digest)\n• Activated when you feel safe\n• Heart slows, body relaxes\n• Allows healing and restoration\n\nAfter a traumatic event, the sympathetic system can get **stuck on high alert**, constantly scanning for danger even when you're safe.",
    },
    {
      id: "window-tolerance",
      type: "text",
      title: "The Window of Tolerance",
      content: "Think of your 'window of tolerance' as the zone where you can handle life's ups and downs.\n\n**HYPERAROUSAL** (above the window)\n• Anxiety, panic, racing thoughts\n• Feeling on edge, irritable, angry\n• Can't calm down or sleep\n\n**WINDOW OF TOLERANCE** (the middle zone)\n• Able to think clearly\n• Can feel emotions without overwhelm\n• Able to connect with others\n\n**HYPOAROUSAL** (below the window)\n• Numbness, disconnection\n• Feeling flat, empty, shut down\n• Difficulty engaging with life\n\nAfter trauma, the window often **shrinks** — you flip between hyperarousal and hypoarousal more easily.",
    },
    {
      id: "common-symptoms",
      type: "text",
      title: "Common Stress & Trauma Symptoms",
      content: "These reactions are **adaptive responses** — your brain trying to protect you:\n\n**Intrusions**: Flashbacks, nightmares, unwanted memories\n→ Brain's attempt to process what happened\n\n**Avoidance**: Avoiding reminders, places, people\n→ Protecting yourself from painful feelings\n\n**Hypervigilance**: Always on alert, easily startled\n→ Watching for danger to keep you safe\n\n**Numbing**: Feeling detached, difficulty experiencing emotions\n→ Protecting against overwhelming feelings\n\n**Sleep problems**: Trouble sleeping, nightmares\n→ Brain staying alert for threats\n\nAll of these make sense given what you experienced.",
    },
    {
      id: "healing",
      type: "text",
      title: "Healing Is Possible",
      content: "Your nervous system can learn to feel safe again. Healing involves:\n\n1. **Understanding** your reactions (you're doing this now!)\n2. **Stabilization** — learning to regulate your nervous system\n3. **Processing** — working through the trauma in a safe way\n4. **Integration** — building a new narrative and moving forward\n\nThis takes time. Be patient with yourself. Recovery isn't linear — there will be ups and downs.\n\nWith the right support and tools, most people see significant improvement.",
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Check Your Understanding",
      questions: [
        {
          id: "q1",
          question: "Trauma symptoms like hypervigilance and avoidance are:",
          options: [
            { id: "a", text: "Signs of weakness" },
            { id: "b", text: "Adaptive responses trying to protect you", correct: true },
            { id: "c", text: "Permanent conditions" },
            { id: "d", text: "Things you should ignore" },
          ],
          explanation: "These symptoms developed to protect you. Understanding them as adaptive (not broken) is key to healing.",
        },
        {
          id: "q2",
          question: "The 'window of tolerance' refers to:",
          options: [
            { id: "a", text: "How much pain you can handle" },
            { id: "b", text: "The zone where you can function and regulate emotions", correct: true },
            { id: "c", text: "A time limit for feeling upset" },
            { id: "d", text: "How patient you need to be" },
          ],
          explanation: "The window of tolerance is the optimal zone of arousal where you can think clearly and manage emotions.",
        },
      ],
      showCorrectAnswers: true,
    },
  ],
};

export default understandingStressTrauma;
