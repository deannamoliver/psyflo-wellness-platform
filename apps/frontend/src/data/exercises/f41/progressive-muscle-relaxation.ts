import type { ExerciseConfig } from "@/lib/exercises/types";

export const progressiveMuscleRelaxation: ExerciseConfig = {
  id: "f41-3-02",
  type: "exercise",
  title: "Progressive Muscle Relaxation",
  subtitle: "Release tension through your body",
  description: "Guided 7-muscle-group PMR sequence: systematically tense and release muscles to reduce physical tension and anxiety.",
  estimatedMinutes: 15,
  completionMessage: "Great relaxation practice! Use PMR regularly to reduce baseline tension.",
  applicableCodes: ["F41", "F32", "F43", "R45"],
  allowBackNavigation: true,
  showProgressBar: true,
  steps: [
    {
      id: "intro",
      type: "instruction",
      label: "What is PMR?",
      content: "Progressive Muscle Relaxation (PMR) works by **tensing and then releasing** muscle groups. This teaches you:\n\n1. To recognize what tension feels like\n2. How to release it\n3. The contrast between tension and relaxation\n\nWe'll go through **7 muscle groups**:\n1. Hands & Forearms\n2. Upper Arms (Biceps)\n3. Forehead\n4. Jaw & Face\n5. Shoulders & Neck\n6. Chest & Stomach\n7. Legs & Feet\n\n**Technique:** Tense for 5 seconds, release for 10-15 seconds. Focus on the feeling of release.",
    },
    {
      id: "pre-rating",
      type: "likert",
      label: "Rate your current body tension",
      min: 0,
      max: 10,
      minLabel: "Completely relaxed",
      maxLabel: "Very tense",
      required: true,
    },
    {
      id: "setup",
      type: "instruction",
      label: "Getting Started",
      content: "Find a comfortable position — sitting or lying down.\n\n• Loosen any tight clothing\n• Take 3 slow, deep breaths\n• Close your eyes if comfortable\n\nRemember: Tense firmly but don't strain. If any area is injured, skip that muscle group.\n\n*When ready, continue to begin the practice.*",
    },
    {
      id: "group1",
      type: "instruction",
      label: "1. Hands & Forearms",
      content: "**TENSE:** Make tight fists with both hands. Squeeze hard, feeling the tension in your fingers, hands, and forearms.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Let go completely. Let your hands fall open. Feel the tension drain away.\n\nNotice the difference... warmth... heaviness... relaxation flowing in.\n\nBreathe slowly... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group2",
      type: "instruction",
      label: "2. Upper Arms (Biceps)",
      content: "**TENSE:** Bend your elbows and flex your biceps. Squeeze them tight like you're showing off your muscles.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Let your arms drop down. Feel them go loose and limp.\n\nNotice the contrast... the relief... the relaxation spreading.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group3",
      type: "instruction",
      label: "3. Forehead",
      content: "**TENSE:** Raise your eyebrows as high as you can. Feel the tension across your forehead and scalp.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Let your forehead smooth out completely. Let all the wrinkles soften.\n\nFeel your forehead becoming smooth... calm... relaxed.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group4",
      type: "instruction",
      label: "4. Jaw & Face",
      content: "**TENSE:** Clench your jaw. Squeeze your eyes shut. Scrunch up your whole face.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Let your face go completely slack. Let your jaw hang slightly open. Smooth out your expression.\n\nFeel the release around your eyes... your cheeks... your jaw.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group5",
      type: "instruction",
      label: "5. Shoulders & Neck",
      content: "**TENSE:** Raise your shoulders up toward your ears. Squeeze them up tight. Feel the tension in your shoulders and neck.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Drop your shoulders down. Let them fall completely. Feel the tension melting away.\n\nNotice how much lighter they feel... the warmth... the release.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group6",
      type: "instruction",
      label: "6. Chest & Stomach",
      content: "**TENSE:** Take a deep breath and hold it. Tighten your chest and stomach muscles.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Exhale fully and let your stomach and chest go soft. Let your breathing return to normal.\n\nFeel your torso relaxing... your breathing easy and natural.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "group7",
      type: "instruction",
      label: "7. Legs & Feet",
      content: "**TENSE:** Squeeze your thighs together. Point your toes and curl them under. Tighten your whole lower body.\n\nHold... 2... 3... 4... 5...\n\n**RELEASE:** Let everything go loose. Let your legs fall open slightly. Feel your feet relax.\n\nNotice the relaxation flowing through your legs... heavy and warm.\n\nBreathe... 10... 9... 8... 7... 6... 5... 4... 3... 2... 1...",
    },
    {
      id: "body-scan",
      type: "instruction",
      label: "Final Body Scan",
      content: "Take a moment to scan through your body.\n\nNotice any remaining areas of tension. If you find any, you can do a quick tense-release there.\n\nOtherwise, just enjoy the feeling of relaxation throughout your body.\n\nTake a few more slow breaths.\n\nWhen you're ready, wiggle your fingers and toes, and slowly open your eyes.",
    },
    {
      id: "post-rating",
      type: "likert",
      label: "Rate your body tension now",
      min: 0,
      max: 10,
      minLabel: "Completely relaxed",
      maxLabel: "Very tense",
      required: true,
    },
    {
      id: "reflection",
      type: "reflection",
      label: "Reflection",
      prompt: "Where did you notice the most tension? Where did you feel the biggest release? When might you use PMR?",
    },
  ],
};

export default progressiveMuscleRelaxation;
