import type { PsychoedConfig } from "@/lib/exercises/types";

export const understandingDepression: PsychoedConfig = {
  id: "f32-psychoed-understanding-depression",
  type: "psychoed",
  title: "Understanding Depression",
  subtitle: "Learn about depression and how CBT can help",
  description: "This lesson will help you understand what depression is, how it affects your thoughts, feelings, and behaviors, and how cognitive behavioral therapy (CBT) can help.",
  estimatedMinutes: 10,
  completionMessage: "Great job completing this lesson! Understanding depression is the first step toward feeling better.",
  applicableCodes: ["F32", "F33"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "slide-1",
      type: "text",
      title: "What is Depression?",
      content: "Depression is more than just feeling sad. It's a common but serious mood disorder that affects how you **feel**, **think**, and **handle daily activities**.\n\nDepression can make everything feel harder — from getting out of bed to enjoying things you used to love. The good news is that depression is highly treatable, and the strategies you'll learn can make a real difference.",
    },
    {
      id: "slide-2",
      type: "text",
      title: "Common Signs of Depression",
      content: "Depression can look different for everyone, but common signs include:\n\n• **Persistent sad or empty mood** — feeling down most of the day, nearly every day\n\n• **Loss of interest** — things you used to enjoy don't feel fun anymore\n\n• **Sleep changes** — sleeping too much or having trouble sleeping\n\n• **Energy changes** — feeling tired or slowed down\n\n• **Difficulty concentrating** — trouble focusing or making decisions\n\n• **Negative thoughts** — feeling worthless, guilty, or hopeless\n\nIf you're experiencing several of these, you're not alone — and there are effective ways to feel better.",
    },
    {
      id: "slide-3",
      type: "text",
      title: "The CBT Triangle",
      content: "Cognitive Behavioral Therapy (CBT) is based on a simple but powerful idea: **our thoughts, feelings, and behaviors are all connected**.\n\nImagine a triangle:\n\n🔷 **Thoughts** — What we think affects how we feel and act\n\n❤️ **Feelings** — Our emotions influence our thoughts and behaviors\n\n🏃 **Behaviors** — Our actions impact our thoughts and feelings\n\nWhen we change one part of the triangle, it affects the other parts. This is good news — it means we have multiple ways to start feeling better!",
    },
    {
      id: "slide-4",
      type: "text",
      title: "How the Triangle Works in Depression",
      content: "Let's see how the CBT triangle works with depression:\n\n**Situation**: You don't get invited to a party\n\n**Thought**: \"Nobody likes me. I'm such a loser.\"\n\n**Feeling**: Sad, lonely, worthless\n\n**Behavior**: Stay home alone, avoid friends, stop trying to connect\n\nNotice how the negative thought leads to painful feelings, which lead to withdrawal, which might lead to more negative thoughts. This is called a **negative cycle**.\n\nThe good news? We can break this cycle by changing any part of the triangle!",
    },
    {
      id: "slide-5",
      type: "text",
      title: "Breaking the Cycle",
      content: "Here are three ways to break the negative cycle:\n\n**1. Change the Thought** 💭\nInstead of \"Nobody likes me,\" try: \"One party doesn't define my worth. I have friends who care about me.\"\n\n**2. Change the Behavior** 🏃\nInstead of staying home, reach out to a friend or do something enjoyable. Action often comes before motivation, not after!\n\n**3. Manage the Feeling** ❤️\nUse coping skills like deep breathing, exercise, or talking to someone to help manage intense emotions.\n\nIn the exercises ahead, you'll practice all three approaches!",
    },
    {
      id: "quiz-1",
      type: "quiz",
      title: "Check Your Understanding",
      questions: [
        {
          id: "q1",
          question: "According to CBT, thoughts, feelings, and behaviors are:",
          options: [
            { id: "a", text: "Completely separate and unrelated" },
            { id: "b", text: "All connected and influence each other", correct: true },
            { id: "c", text: "Only connected when we're depressed" },
            { id: "d", text: "Controlled by other people" },
          ],
          explanation: "The CBT triangle shows that thoughts, feelings, and behaviors are all interconnected. Changing one can affect the others.",
        },
        {
          id: "q2",
          question: "When trying to break a negative cycle, you can:",
          options: [
            { id: "a", text: "Only change your thoughts" },
            { id: "b", text: "Only change your feelings" },
            { id: "c", text: "Change any part of the triangle", correct: true },
            { id: "d", text: "Wait for the cycle to stop on its own" },
          ],
          explanation: "You can intervene at any point in the triangle — changing thoughts, behaviors, or managing feelings can all help break negative cycles.",
        },
        {
          id: "q3",
          question: "Depression is:",
          options: [
            { id: "a", text: "A sign of weakness" },
            { id: "b", text: "Just feeling sad sometimes" },
            { id: "c", text: "A treatable mood disorder", correct: true },
            { id: "d", text: "Something you should hide" },
          ],
          explanation: "Depression is a common, treatable condition. It's not a sign of weakness, and seeking help is a sign of strength.",
        },
      ],
      passingScore: 66,
      showCorrectAnswers: true,
    },
  ],
};

export default understandingDepression;
