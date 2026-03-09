import type { PsychoedConfig } from "@/lib/exercises/types";

export const understandingYourAnxiety: PsychoedConfig = {
  id: "f41-1-03",
  type: "psychoed",
  title: "Understanding Your Anxiety",
  subtitle: "Learn about the anxiety response and cycle",
  description: "Learn about the fight-flight-freeze response, the anxiety cycle, and the difference between anxiety and actual danger.",
  estimatedMinutes: 12,
  completionMessage: "Great job learning about anxiety! Understanding is the first step to managing it.",
  applicableCodes: ["F41"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "intro",
      type: "text",
      title: "What Is Anxiety?",
      content: "Anxiety is your body's built-in alarm system — designed to protect you from danger.\n\nThe problem isn't that you have anxiety. **Everyone does.** The problem is when the alarm goes off too often, too intensely, or in situations that aren't actually dangerous.\n\nUnderstanding how anxiety works is the first step to managing it better.",
    },
    {
      id: "fight-flight-freeze",
      type: "text",
      title: "Fight, Flight, or Freeze",
      content: "When your brain perceives threat (real or imagined), it triggers the **fight-flight-freeze response**:\n\n**Fight**: Heart races, muscles tense, ready to confront the threat\n**Flight**: Urge to escape, rapid breathing, restlessness\n**Freeze**: Going still or numb, feeling detached or paralyzed\n\nThese responses happen automatically — controlled by the **amygdala**, your brain's alarm center.\n\nThe amygdala reacts first, asks questions later. It can't distinguish between a tiger and a difficult email.",
    },
    {
      id: "physical-symptoms",
      type: "text",
      title: "Why Anxiety Feels So Physical",
      content: "Anxiety isn't 'just in your head.' The fight-flight response causes real physical changes:\n\n• **Racing heart** — pumping blood to muscles\n• **Rapid breathing** — getting more oxygen\n• **Sweating** — cooling the body for action\n• **Muscle tension** — ready to fight or run\n• **Digestive changes** — blood diverts from stomach\n• **Dizziness** — changes in blood flow and breathing\n• **Tingling** — hyperventilation effects\n\nThese symptoms are **uncomfortable but not dangerous**. Your body is doing exactly what it's designed to do.",
    },
    {
      id: "anxiety-cycle",
      type: "text",
      title: "The Anxiety Cycle",
      content: "Anxiety often becomes a self-reinforcing cycle:\n\n**Trigger** → Something happens (or you think about something)\n↓\n**Thought** → \"This is dangerous\" / \"I can't handle this\"\n↓\n**Physical response** → Heart races, breathing quickens\n↓\n**Behavior** → Avoid, escape, seek reassurance\n↓\n**Short-term relief** → Anxiety drops temporarily\n↓\n**Long-term problem** → Brain learns the situation was \"dangerous\"\n↓\n*Cycle strengthens*\n\n**The key insight**: Avoidance provides short-term relief but maintains anxiety long-term.",
    },
    {
      id: "anxiety-vs-danger",
      type: "text",
      title: "Anxiety ≠ Danger",
      content: "One of anxiety's tricks is making you believe that **feeling anxious = being in danger**.\n\nBut anxiety is just a feeling — an alarm. And alarms can be false alarms.\n\n**Anxiety says**: \"This is dangerous! Something bad will happen!\"\n**Reality often shows**: The feared outcome doesn't occur, or you cope better than expected.\n\nLearning to tolerate anxiety without avoiding teaches your brain: \"This isn't actually dangerous.\"\n\nThis is the core of exposure-based treatment — facing fears gradually to retrain the alarm system.",
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Check Your Understanding",
      questions: [
        {
          id: "q1",
          question: "The fight-flight-freeze response is:",
          options: [
            { id: "a", text: "A sign something is wrong with you" },
            { id: "b", text: "A normal protective response everyone has", correct: true },
            { id: "c", text: "Only triggered by real danger" },
            { id: "d", text: "Something you can completely eliminate" },
          ],
          explanation: "Fight-flight-freeze is a normal survival response. The goal isn't to eliminate it, but to respond to it more helpfully.",
        },
        {
          id: "q2",
          question: "Why does avoidance maintain anxiety long-term?",
          options: [
            { id: "a", text: "It provides too much relief" },
            { id: "b", text: "It teaches the brain the situation was dangerous", correct: true },
            { id: "c", text: "It makes you lazy" },
            { id: "d", text: "It doesn't — avoidance is the best strategy" },
          ],
          explanation: "When you avoid, you get relief, but your brain concludes the situation must have been truly dangerous. This strengthens the anxiety.",
        },
        {
          id: "q3",
          question: "Physical anxiety symptoms (racing heart, sweating) are:",
          options: [
            { id: "a", text: "Signs of a medical emergency" },
            { id: "b", text: "Dangerous to your health" },
            { id: "c", text: "Uncomfortable but not dangerous", correct: true },
            { id: "d", text: "Proof that something is wrong" },
          ],
          explanation: "Anxiety symptoms feel intense but are not medically dangerous. They're your body's normal response to perceived threat.",
        },
      ],
      showCorrectAnswers: true,
    },
  ],
};

export default understandingYourAnxiety;
