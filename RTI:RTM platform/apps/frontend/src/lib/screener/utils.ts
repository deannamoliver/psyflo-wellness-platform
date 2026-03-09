import type { screenerSubtypeEnum, screenerTypeEnum } from "@feelwell/database";
import {
  type ScreenerQuestion,
  type ScreenerQuestionSet,
  screenerQuestionSets,
} from "@feelwell/database";
import type { RiskLevel } from "./type";

export function getScreenerQuestion(code: string): ScreenerQuestion | null {
  for (const s of screenerQuestionSets) {
    const q = s.questions.find((q) => q.code === code);
    if (q != null) {
      return q;
    }
  }

  return null;
}

export function getScreenerQuestionSet(props: {
  part: number;
  subtype: (typeof screenerSubtypeEnum.enumValues)[number];
  age: number;
}): ScreenerQuestionSet | null {
  return (
    screenerQuestionSets.find(
      (s) =>
        s.part === props.part &&
        s.subtype === props.subtype &&
        s.minAge <= props.age &&
        props.age <= s.maxAge,
    ) ?? null
  );
}

export function getMaxScoreForQuestionSet(
  questionSet: ScreenerQuestionSet,
): number {
  let maxScore = 0;

  for (const question of questionSet.questions) {
    maxScore +=
      Math.max(...question.options.map((o) => o.score)) *
      question.weight *
      questionSet.multiplier;
  }

  return maxScore;
}

export function getRiskLevel({
  type,
  score,
}: {
  type: (typeof screenerTypeEnum.enumValues)[number];
  score: number;
}): RiskLevel {
  switch (type) {
    case "sel": {
      return 1;
    }

    case "phq_a": {
      // PHQ-A scoring similar to PHQ-9
      if (score <= 4) return 1;
      if (score <= 9) return 2;
      if (score <= 14) return 3;
      if (score <= 19) return 4;
      return 5;
    }

    case "phq_9": {
      // PHQ-9 does not have a risk level of 0
      if (score <= 4) return 1;
      if (score <= 9) return 2;
      if (score <= 14) return 3;
      if (score <= 19) return 4;
      return 5;
    }

    case "gad_child": {
      // GAD-Child scoring: calculate average first
      const averageScore = score / 10; // 10 questions
      if (averageScore < 0.5) return 0;
      if (averageScore < 1.5) return 1;
      if (averageScore < 2.5) return 2;
      if (averageScore < 3.5) return 3;
      return 5;
    }

    case "gad_7": {
      // GAD-7 scoring: sum-based
      if (score <= 4) return 1;
      if (score <= 9) return 2;
      if (score <= 14) return 3;
      return 5;
    }
  }
}

export function getRiskLevelTitle({
  type,
  riskLevel,
}: {
  type: (typeof screenerTypeEnum.enumValues)[number];
  riskLevel: RiskLevel;
}): string | null {
  if (type === "sel") {
    return null;
  }

  if (type === "phq_a" || type === "phq_9") {
    switch (riskLevel) {
      case 1:
        return "Minimal";
      case 2:
        return "Mild";
      case 3:
        return "Moderate";
      case 4:
        return "Moderately Severe";
      case 5:
        return "Severe";
    }
  }

  if (type === "gad_child") {
    switch (riskLevel) {
      case 0:
        return "None";
      case 1:
        return "Minimal";
      case 2:
        return "Mild";
      case 3:
        return "Moderate";
      case 5:
        return "Severe";
    }
  }

  if (type === "gad_7") {
    switch (riskLevel) {
      case 1:
        return "Minimal";
      case 2:
        return "Mild";
      case 3:
        return "Moderate";
      case 5:
        return "Severe";
    }
  }

  return null;
}

export function getSubtypesFromType(
  type: (typeof screenerTypeEnum.enumValues)[number],
): (typeof screenerSubtypeEnum.enumValues)[number][] {
  switch (type) {
    case "sel":
      return [
        "sel_self_awareness_self_concept",
        "sel_self_awareness_emotion_knowledge",
        "sel_social_awareness",
        "sel_self_management_emotion_regulation",
        "sel_self_management_goal_management",
        "sel_self_management_school_work",
        "sel_relationship_skills",
        "sel_responsible_decision_making",
      ];

    case "phq_a":
      return ["phq_a"];

    case "phq_9":
      return ["phq_9"];

    case "gad_child":
      return ["gad_child"];

    case "gad_7":
      return ["gad_7"];
  }
}

export function getQuestionAndAnswer(
  questionCode: string,
  answerCode: string,
): { question: string; answer: string } | null {
  const question = getScreenerQuestion(questionCode);
  if (!question) {
    return null;
  }

  const answer = question.options.find((opt) => opt.code === answerCode);
  if (!answer) {
    return null;
  }

  return {
    question: question.text,
    answer: answer.text,
  };
}
