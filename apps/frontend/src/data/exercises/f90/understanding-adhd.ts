import type { PsychoedConfig } from "@/lib/exercises/types";

export const understandingADHD: PsychoedConfig = {
  id: "f90-1-03",
  type: "psychoed",
  title: "Understanding ADHD & Your Brain",
  subtitle: "Executive function, dopamine, and why willpower isn't enough",
  description: "Learn about executive function, the dopamine connection, and why ADHD isn't about willpower — it's about brain wiring.",
  estimatedMinutes: 12,
  completionMessage: "Understanding your brain is powerful. Use this knowledge to build systems that work WITH your brain, not against it.",
  applicableCodes: ["F90"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "intro",
      type: "text",
      title: "ADHD: Not a Willpower Problem",
      content: "If you have ADHD, you've probably heard:\n• \"Just try harder\"\n• \"You're so smart, why can't you just focus?\"\n• \"Everyone procrastinates, just use discipline\"\n\nHere's the truth: **ADHD is a neurological difference**, not a character flaw.\n\nYour brain is wired differently. Understanding how can help you work WITH your brain instead of fighting against it.",
    },
    {
      id: "executive-function",
      type: "text",
      title: "Executive Function",
      content: "**Executive functions** are mental skills that help you manage life:\n\n• **Working memory** — holding information while using it\n• **Flexible thinking** — adapting to new situations\n• **Self-control** — managing impulses and emotions\n• **Planning & organization** — sequencing steps toward goals\n• **Time management** — perceiving and using time well\n• **Task initiation** — starting tasks (especially boring ones)\n• **Sustained attention** — staying focused over time\n\nADHD affects **all of these** — it's not just about attention. It's why ADHD impacts so many areas of life.",
    },
    {
      id: "dopamine",
      type: "text",
      title: "The Dopamine Connection",
      content: "Your brain runs on **dopamine** — a neurotransmitter involved in motivation, reward, and attention.\n\nIn ADHD brains:\n• Dopamine signaling is different\n• The reward system responds less to ordinary tasks\n• Novel, urgent, or interesting things provide more dopamine\n\nThis explains why you can hyperfocus on video games but can't start a report.\n\n**It's not that you WON'T focus — it's that your brain doesn't release enough dopamine for low-stimulation tasks.**\n\nThis isn't laziness. It's neurochemistry.",
    },
    {
      id: "time-blindness",
      type: "text",
      title: "Time Blindness",
      content: "Many with ADHD experience **time blindness** — difficulty perceiving the passage of time.\n\nThis shows up as:\n• Underestimating how long tasks take\n• Being shocked when hours have passed\n• Difficulty planning for the future (it feels abstract)\n• Struggling with deadlines until they're urgent\n\nADHD brains often operate on two timezones: **NOW** and **NOT NOW**.\n\nIf it's not now, it barely exists. This is why external reminders, alarms, and visible timers are so important.",
    },
    {
      id: "interest-based",
      type: "text",
      title: "Interest-Based Nervous System",
      content: "Most people are motivated by importance, rewards, and consequences.\n\nADHD brains are motivated by:\n• **Interest** — Is this fascinating to me?\n• **Challenge** — Is this engaging my brain?\n• **Novelty** — Is this new and stimulating?\n• **Urgency** — Is this due RIGHT NOW?\n\nThis is the **interest-based nervous system**.\n\nYou're not lacking motivation — you're lacking the right kind of stimulation. The solution isn't willpower; it's finding ways to add interest, challenge, novelty, or urgency to tasks.",
    },
    {
      id: "strengths",
      type: "text",
      title: "ADHD Strengths",
      content: "ADHD isn't all challenges. Many people with ADHD have:\n\n• **Creativity** — Out-of-the-box thinking\n• **Hyperfocus** — Intense concentration on interesting things\n• **Energy & enthusiasm** — Passionate engagement\n• **Spontaneity** — Adaptability and quick thinking\n• **Empathy** — Strong emotional attunement\n• **Resilience** — Years of overcoming challenges\n\nThe goal isn't to 'fix' your brain — it's to build systems that minimize challenges and leverage strengths.",
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Check Your Understanding",
      questions: [
        {
          id: "q1",
          question: "ADHD difficulty with focus is primarily caused by:",
          options: [
            { id: "a", text: "Laziness or lack of effort" },
            { id: "b", text: "Differences in dopamine and executive function", correct: true },
            { id: "c", text: "Not caring enough" },
            { id: "d", text: "Poor upbringing" },
          ],
          explanation: "ADHD involves neurological differences in dopamine signaling and executive function — it's brain wiring, not character.",
        },
        {
          id: "q2",
          question: "The 'interest-based nervous system' means ADHD brains are most motivated by:",
          options: [
            { id: "a", text: "Fear of consequences" },
            { id: "b", text: "Long-term rewards" },
            { id: "c", text: "Interest, challenge, novelty, and urgency", correct: true },
            { id: "d", text: "What others think" },
          ],
          explanation: "ADHD brains respond to interest, challenge, novelty, and urgency rather than importance or long-term consequences.",
        },
      ],
      showCorrectAnswers: true,
    },
  ],
};

export default understandingADHD;
