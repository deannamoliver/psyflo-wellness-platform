export type CbtExerciseId = "thought-flip" | "mood-boost";

export interface CbtExerciseConfig {
  id: CbtExerciseId;
  title: string;
  tagline: string;
  durationSeconds: number;
  xpReward: number;
  evidenceBase: string;
  primaryColor: string;
  emoji: string;
  totalScreens: number;
}

export interface CbtExerciseResult {
  exerciseId: CbtExerciseId;
  completedAt: string;
  selections: Record<string, string>;
  xpEarned: number;
}

export interface CbtExerciseProps {
  onComplete: (result: CbtExerciseResult) => void;
  onExit: () => void;
}

export const CBT_EXERCISES: CbtExerciseConfig[] = [
  {
    id: "thought-flip",
    title: "Thought Flip",
    tagline: "Reframe a negative thought",
    durationSeconds: 40,
    xpReward: 10,
    evidenceBase: "Cognitive Restructuring (Beck, 1979)",
    primaryColor: "violet",
    emoji: "\u{1F9E0}",
    totalScreens: 3,
  },
  {
    id: "mood-boost",
    title: "Mood Boost",
    tagline: "Pick one tiny good thing",
    durationSeconds: 35,
    xpReward: 10,
    evidenceBase: "Behavioral Activation (Lewinsohn, 1974)",
    primaryColor: "teal",
    emoji: "\u26A1",
    totalScreens: 3,
  },
];

export function getCbtExercise(id: string): CbtExerciseConfig | undefined {
  return CBT_EXERCISES.find((e) => e.id === id);
}
