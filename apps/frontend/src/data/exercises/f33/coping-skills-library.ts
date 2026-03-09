import type { PsychoedConfig } from "@/lib/exercises/types";

export const copingSkillsLibrary: PsychoedConfig = {
  id: "f33-3-01",
  type: "psychoed",
  title: "Coping Skills Library",
  subtitle: "Evidence-based strategies for managing difficult moments",
  description: "Explore 15 evidence-based coping strategies across cognitive, behavioral, somatic, social, and mindfulness categories. Build your personalized toolkit.",
  estimatedMinutes: 15,
  completionMessage: "You've explored the coping skills library! Return anytime to review or try new strategies.",
  applicableCodes: ["F33", "F32"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "intro",
      type: "text",
      title: "Building Your Coping Toolkit",
      content: "Everyone needs a toolkit of strategies for managing difficult moments. The key is having **multiple options** — what works one day might not work another.\n\nWe'll explore 15 evidence-based strategies across five categories:\n\n• **Cognitive** — Working with thoughts\n• **Behavioral** — Taking action\n• **Somatic** — Working with the body\n• **Social** — Connecting with others\n• **Mindfulness** — Present-moment awareness\n\nAs you go through, note which strategies appeal to you.",
    },
    {
      id: "cognitive",
      type: "text",
      title: "Cognitive Strategies",
      content: "**1. Thought Challenging**\nQuestion negative thoughts: What's the evidence? What would I tell a friend? Is there another way to see this?\n\n**2. Worry Time**\nSchedule 15-30 min daily for worries. When worries arise outside this time, write them down and postpone.\n\n**3. Gratitude Focusing**\nName 3 specific things you're grateful for. Be detailed — not just 'family' but 'that my mom called to check on me yesterday.'",
    },
    {
      id: "behavioral",
      type: "text",
      title: "Behavioral Strategies",
      content: "**4. Behavioral Activation**\nDo something — anything — even when you don't feel like it. Action often precedes motivation, not the other way around.\n\n**5. Pleasant Activity**\nEngage in something enjoyable, even briefly: listen to music, take a walk, have a cup of tea.\n\n**6. Opposite Action**\nWhen an emotion urges you to do something unhelpful (isolate, avoid, lash out), do the opposite instead.",
    },
    {
      id: "somatic",
      type: "text",
      title: "Somatic (Body) Strategies",
      content: "**7. Deep Breathing**\nSlow, diaphragmatic breathing activates the parasympathetic nervous system. Try: 4-count inhale, 7-count hold, 8-count exhale.\n\n**8. Progressive Muscle Relaxation**\nSystematically tense and release muscle groups: hands, arms, face, shoulders, stomach, legs.\n\n**9. Physical Movement**\nAny movement helps: walking, stretching, dancing, jumping jacks. Exercise releases endorphins and reduces stress hormones.",
    },
    {
      id: "social",
      type: "text",
      title: "Social Strategies",
      content: "**10. Reach Out**\nConnection is protective. Text a friend, call family, or just be around others (even at a coffee shop).\n\n**11. Ask for Help**\nBe specific about what you need: 'Can you listen for 5 minutes?' or 'Can you help me with this task?'\n\n**12. Give to Others**\nHelping others boosts mood. Volunteer, do a favor for someone, or simply offer genuine compliments.",
    },
    {
      id: "mindfulness",
      type: "text",
      title: "Mindfulness Strategies",
      content: "**13. Grounding (5-4-3-2-1)**\nName 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Anchors you in the present.\n\n**14. Self-Compassion**\nTreat yourself as you would a good friend. Acknowledge suffering, remember you're not alone, offer yourself kindness.\n\n**15. Acceptance**\n'It is what it is.' Fighting reality causes additional suffering. Accept what you cannot change; focus on what you can.",
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Quick Check",
      questions: [
        {
          id: "q1",
          question: "When an emotion urges you to do something unhelpful, what strategy involves doing the reverse?",
          options: [
            { id: "a", text: "Thought Challenging" },
            { id: "b", text: "Opposite Action", correct: true },
            { id: "c", text: "Grounding" },
            { id: "d", text: "Progressive Muscle Relaxation" },
          ],
          explanation: "Opposite Action is a DBT skill where you intentionally do the opposite of what your emotion urges you to do.",
        },
        {
          id: "q2",
          question: "Which breathing pattern activates the parasympathetic nervous system?",
          options: [
            { id: "a", text: "Fast, shallow breathing" },
            { id: "b", text: "Holding your breath" },
            { id: "c", text: "Slow, deep diaphragmatic breathing", correct: true },
            { id: "d", text: "Breathing only through your mouth" },
          ],
          explanation: "Slow, deep breathing activates the vagus nerve and triggers the relaxation response.",
        },
      ],
      showCorrectAnswers: true,
    },
  ],
};

export default copingSkillsLibrary;
