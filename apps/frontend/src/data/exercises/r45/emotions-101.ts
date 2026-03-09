import type { PsychoedConfig } from "@/lib/exercises/types";

export const emotions101: PsychoedConfig = {
  id: "r45-3-01",
  type: "psychoed",
  title: "Emotions 101",
  subtitle: "Understanding what emotions are and why they matter",
  description: "Learn about what emotions are, their function, primary vs. secondary emotions, and explore the emotion wheel.",
  estimatedMinutes: 12,
  completionMessage: "You now have a foundation for understanding your emotional experiences.",
  applicableCodes: ["R45"],
  allowSkip: false,
  trackCompletion: true,
  slides: [
    {
      id: "intro",
      type: "text",
      title: "What Are Emotions?",
      content: "Emotions are **whole-body experiences** that include:\n\n• **Thoughts** — Interpretations and meanings\n• **Physical sensations** — Body responses (heart rate, tension)\n• **Action urges** — What the emotion makes you want to do\n• **Behaviors** — What you actually do\n• **Expressions** — Facial expressions, body language\n\nEmotions aren't just 'feelings' — they're complex experiences that evolved to help us survive and thrive.",
    },
    {
      id: "function",
      type: "text",
      title: "Emotions Have Functions",
      content: "Every emotion — even painful ones — serves a purpose:\n\n**Fear** → Alerts you to danger, motivates protection\n**Anger** → Signals boundary violation, mobilizes action\n**Sadness** → Signals loss, invites support\n**Joy** → Reinforces beneficial experiences\n**Disgust** → Protects from contamination/harm\n**Shame** → Maintains social bonds (don't do things that risk rejection)\n**Guilt** → Maintains values (I did something against my values)\n\nProblems arise when emotions are **too intense**, **too frequent**, or **don't match the situation**.",
    },
    {
      id: "primary-secondary",
      type: "text",
      title: "Primary vs. Secondary Emotions",
      content: "**Primary emotions** are the first, instinctive response to a situation. They come and go quickly if allowed.\n\n**Secondary emotions** are reactions to primary emotions. Often we have secondary emotions because we judge our primary emotions as wrong or unacceptable.\n\nExample:\n• Primary: Sadness after a loss\n• Secondary: Anger at yourself for 'being weak'\n\nOr:\n• Primary: Fear in a new situation\n• Secondary: Shame about being afraid\n\nSometimes what feels like the main emotion is actually a secondary emotion covering something else.",
    },
    {
      id: "emotion-wheel",
      type: "text",
      title: "The Emotion Wheel",
      content: "Emotional vocabulary matters. Research shows that naming emotions precisely — **affect labeling** — actually reduces their intensity.\n\nThe emotion wheel helps you go beyond basic labels:\n\n**ANGRY** → irritated, frustrated, annoyed, bitter, resentful, furious, outraged\n\n**SAD** → disappointed, lonely, isolated, grief-stricken, hopeless, melancholy\n\n**ANXIOUS** → nervous, worried, apprehensive, overwhelmed, panicked, tense\n\n**HAPPY** → content, joyful, optimistic, proud, grateful, excited, peaceful\n\n**ASHAMED** → embarrassed, guilty, humiliated, regretful, self-conscious\n\nThe more precisely you can name what you feel, the better you can understand and address it.",
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Check Your Understanding",
      questions: [
        {
          id: "q1",
          question: "What is a 'secondary emotion'?",
          options: [
            { id: "a", text: "An emotion that's less important" },
            { id: "b", text: "A reaction to a primary emotion, often involving judgment", correct: true },
            { id: "c", text: "An emotion that happens second in a sequence" },
            { id: "d", text: "A mild emotion" },
          ],
          explanation: "Secondary emotions are reactions to primary emotions — often involving self-judgment about how we 'should' feel.",
        },
        {
          id: "q2",
          question: "Why is naming emotions precisely (affect labeling) helpful?",
          options: [
            { id: "a", text: "It makes you more emotional" },
            { id: "b", text: "It actually reduces the intensity of the emotion", correct: true },
            { id: "c", text: "It impresses other people" },
            { id: "d", text: "It doesn't help — emotions should be avoided" },
          ],
          explanation: "Research shows that putting emotions into specific words activates prefrontal brain regions and reduces amygdala activation.",
        },
      ],
      showCorrectAnswers: true,
    },
  ],
};

export default emotions101;
