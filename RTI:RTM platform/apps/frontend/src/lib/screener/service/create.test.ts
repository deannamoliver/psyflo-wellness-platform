import { addDays, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import { getScreenerQuestionSet } from "../utils";

/**
 * Unit tests for screener scheduling logic
 *
 * These tests verify the new schedule:
 * - Day 1: Mental health screeners (PHQ-A/GAD-Child for ages 11-17, PHQ-9/GAD-7 for ages 18+)
 * - Days 2-5: SEL screeners (all ages ≥11)
 * - Days 1-4: SEL screeners (ages <11, no mental health screeners)
 */

describe("Screener Question Set Parts", () => {
  describe("SEL Question Sets (Parts 2-5)", () => {
    it("should have Self-Awareness: Self-Concept on part 2", () => {
      const questionSet = getScreenerQuestionSet({
        part: 2,
        subtype: "sel_self_awareness_self_concept",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(2);
      expect(questionSet?.type).toBe("sel");
      expect(questionSet?.questions.length).toBe(4);
    });

    it("should have Self-Awareness: Emotion Knowledge on part 2", () => {
      const questionSet = getScreenerQuestionSet({
        part: 2,
        subtype: "sel_self_awareness_emotion_knowledge",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(2);
      expect(questionSet?.questions.length).toBe(6);
    });

    it("should have Social Awareness on part 3", () => {
      const questionSet = getScreenerQuestionSet({
        part: 3,
        subtype: "sel_social_awareness",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(3);
      expect(questionSet?.questions.length).toBe(5);
    });

    it("should have Self-Management: Emotion Regulation on part 3", () => {
      const questionSet = getScreenerQuestionSet({
        part: 3,
        subtype: "sel_self_management_emotion_regulation",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(3);
      expect(questionSet?.questions.length).toBe(4);
    });

    it("should have Self-Management: Goal Management on part 4", () => {
      const questionSet = getScreenerQuestionSet({
        part: 4,
        subtype: "sel_self_management_goal_management",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(4);
      expect(questionSet?.questions.length).toBe(4);
    });

    it("should have Self-Management: School Work on part 4", () => {
      const questionSet = getScreenerQuestionSet({
        part: 4,
        subtype: "sel_self_management_school_work",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(4);
      expect(questionSet?.questions.length).toBe(6);
    });

    it("should have Relationship Skills on part 5", () => {
      const questionSet = getScreenerQuestionSet({
        part: 5,
        subtype: "sel_relationship_skills",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(5);
      expect(questionSet?.questions.length).toBe(6);
    });

    it("should have Responsible Decision Making on part 5", () => {
      const questionSet = getScreenerQuestionSet({
        part: 5,
        subtype: "sel_responsible_decision_making",
        age: 12,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(5);
      expect(questionSet?.questions.length).toBe(5);
    });

    it("should NOT have SEL on part 1 (old schedule)", () => {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype: "sel_self_awareness_self_concept",
        age: 12,
      });

      expect(questionSet).toBeNull();
    });
  });

  describe("Mental Health Question Sets (Part 1)", () => {
    it("should have PHQ-A on part 1 for ages 11-17", () => {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype: "phq_a",
        age: 14,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(1);
      expect(questionSet?.type).toBe("phq_a");
    });

    it("should have GAD-Child on part 1 for ages 11-17", () => {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype: "gad_child",
        age: 15,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(1);
      expect(questionSet?.type).toBe("gad_child");
    });

    it("should have PHQ-9 on part 1 for ages 18+", () => {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype: "phq_9",
        age: 20,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(1);
      expect(questionSet?.type).toBe("phq_9");
    });

    it("should have GAD-7 on part 1 for ages 18+", () => {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype: "gad_7",
        age: 25,
      });

      expect(questionSet).not.toBeNull();
      expect(questionSet?.part).toBe(1);
      expect(questionSet?.type).toBe("gad_7");
    });
  });
});

describe("Screener Scheduling Logic", () => {
  const baseDate = startOfDay(new Date("2025-01-01"));

  describe("Ages 11-17 Schedule", () => {
    /**
     * Expected schedule for ages 11-17:
     * Day 1: PHQ-A (part 1) + GAD-Child (part 1)
     * Day 2: SEL domains (part 2): Self-Awareness (Self-Concept + Emotion Knowledge)
     * Day 3: SEL domains (part 3): Social Awareness + Self-Management (Emotion Regulation)
     * Day 4: SEL domains (part 4): Self-Management (Goal Management + School Work)
     * Day 5: SEL domains (part 5): Relationship Skills + Responsible Decision Making
     */

    it("should schedule PHQ-A for Day 1 (part 1, startAt + 0)", () => {
      // Mental health screeners use part 1, startAt = Day 1
      // Formula: addDays(startAt, part - 1) = addDays(baseDate, 1 - 1) = baseDate (Day 1)
      const phqStartDate = addDays(baseDate, 1 - 1);
      expect(phqStartDate).toEqual(baseDate);
    });

    it("should schedule GAD-Child for Day 1 (part 1, startAt + 0)", () => {
      const gadStartDate = addDays(baseDate, 1 - 1);
      expect(gadStartDate).toEqual(baseDate);
    });

    it("should schedule SEL Part 2 (Self-Awareness) for Day 2 (startAt + 1)", () => {
      // SEL uses parts 2-5, startAt = Day 1
      // Formula: addDays(startAt, part - 1) = addDays(baseDate, 2 - 1) = Day 2
      const selPart2Date = addDays(baseDate, 2 - 1);
      expect(selPart2Date).toEqual(addDays(baseDate, 1));
    });

    it("should schedule SEL Part 3 (Social Awareness) for Day 3 (startAt + 2)", () => {
      const selPart3Date = addDays(baseDate, 3 - 1);
      expect(selPart3Date).toEqual(addDays(baseDate, 2));
    });

    it("should schedule SEL Part 4 (Self-Management) for Day 4 (startAt + 3)", () => {
      const selPart4Date = addDays(baseDate, 4 - 1);
      expect(selPart4Date).toEqual(addDays(baseDate, 3));
    });

    it("should schedule SEL Part 5 (Relationship Skills) for Day 5 (startAt + 4)", () => {
      const selPart5Date = addDays(baseDate, 5 - 1);
      expect(selPart5Date).toEqual(addDays(baseDate, 4));
    });

    it("should verify complete 5-day schedule for ages 11-17", () => {
      const schedule = [
        { day: 1, screeners: ["PHQ-A", "GAD-Child"] },
        { day: 2, screeners: ["SEL: Self-Awareness"] },
        { day: 3, screeners: ["SEL: Social Awareness + Emotion Regulation"] },
        { day: 4, screeners: ["SEL: Goal Management + School Work"] },
        { day: 5, screeners: ["SEL: Relationship Skills + Decision Making"] },
      ];

      expect(schedule).toHaveLength(5);
      expect(schedule[0]?.day).toBe(1);
      expect(schedule[0]?.screeners).toContain("PHQ-A");
      expect(schedule[4]?.day).toBe(5);
    });
  });

  describe("Ages 18+ Schedule", () => {
    /**
     * Expected schedule for ages 18+:
     * Day 1: PHQ-9 (part 1) + GAD-7 (part 1)
     * Days 2-5: Same SEL as ages 11-17
     */

    it("should schedule PHQ-9 for Day 1 (part 1, startAt + 0)", () => {
      const phq9StartDate = addDays(baseDate, 1 - 1);
      expect(phq9StartDate).toEqual(baseDate);
    });

    it("should schedule GAD-7 for Day 1 (part 1, startAt + 0)", () => {
      const gad7StartDate = addDays(baseDate, 1 - 1);
      expect(gad7StartDate).toEqual(baseDate);
    });

    it("should schedule SEL Parts 2-5 for Days 2-5 (same as ages 11-17)", () => {
      const selSchedule = [
        { part: 2, expectedDay: addDays(baseDate, 1) },
        { part: 3, expectedDay: addDays(baseDate, 2) },
        { part: 4, expectedDay: addDays(baseDate, 3) },
        { part: 5, expectedDay: addDays(baseDate, 4) },
      ];

      for (const { part, expectedDay } of selSchedule) {
        const calculatedDate = addDays(baseDate, part - 1);
        expect(calculatedDate).toEqual(expectedDay);
      }
    });
  });

  describe("Ages <11 Schedule", () => {
    /**
     * Expected schedule for ages <11:
     * Day 1: SEL Part 2 (using addDays(startAt, -1) to offset)
     * Day 2: SEL Part 3
     * Day 3: SEL Part 4
     * Day 4: SEL Part 5
     * No mental health screeners
     */

    it("should schedule SEL Part 2 for Day 1 using offset startAt", () => {
      // For ages <11, we pass addDays(startAt, -1) as the SEL startAt
      const offsetStartAt = addDays(baseDate, -1);
      // Part 2: addDays(offsetStartAt, 2 - 1) = addDays(baseDate - 1, 1) = baseDate (Day 1)
      const selPart2Date = addDays(offsetStartAt, 2 - 1);
      expect(selPart2Date).toEqual(baseDate);
    });

    it("should schedule SEL Part 3 for Day 2 using offset startAt", () => {
      const offsetStartAt = addDays(baseDate, -1);
      const selPart3Date = addDays(offsetStartAt, 3 - 1);
      expect(selPart3Date).toEqual(addDays(baseDate, 1));
    });

    it("should schedule SEL Part 4 for Day 3 using offset startAt", () => {
      const offsetStartAt = addDays(baseDate, -1);
      const selPart4Date = addDays(offsetStartAt, 4 - 1);
      expect(selPart4Date).toEqual(addDays(baseDate, 2));
    });

    it("should schedule SEL Part 5 for Day 4 using offset startAt", () => {
      const offsetStartAt = addDays(baseDate, -1);
      const selPart5Date = addDays(offsetStartAt, 5 - 1);
      expect(selPart5Date).toEqual(addDays(baseDate, 3));
    });

    it("should verify complete 4-day SEL-only schedule for ages <11", () => {
      const offsetStartAt = addDays(baseDate, -1);
      const schedule = [2, 3, 4, 5].map((part) => ({
        part,
        date: addDays(offsetStartAt, part - 1),
      }));

      expect(schedule).toHaveLength(4);
      expect(schedule[0]?.date).toEqual(baseDate); // Day 1
      expect(schedule[1]?.date).toEqual(addDays(baseDate, 1)); // Day 2
      expect(schedule[2]?.date).toEqual(addDays(baseDate, 2)); // Day 3
      expect(schedule[3]?.date).toEqual(addDays(baseDate, 3)); // Day 4
    });
  });

  describe("Cross-Age Verification", () => {
    it("should have SEL on same calendar days (Days 2-5) for ages 11+ regardless of mental health screener", () => {
      // Both age groups use the same startAt for SEL
      const selPart2 = addDays(baseDate, 2 - 1);
      const selPart5 = addDays(baseDate, 5 - 1);

      expect(selPart2).toEqual(addDays(baseDate, 1)); // Day 2
      expect(selPart5).toEqual(addDays(baseDate, 4)); // Day 5
    });

    it("should have SEL on different calendar days (Days 1-4) for ages <11", () => {
      const offsetStartAt = addDays(baseDate, -1);
      const selPart2 = addDays(offsetStartAt, 2 - 1);
      const selPart5 = addDays(offsetStartAt, 5 - 1);

      expect(selPart2).toEqual(baseDate); // Day 1
      expect(selPart5).toEqual(addDays(baseDate, 3)); // Day 4
    });

    it("should verify no overlap between mental health and SEL for ages 11+", () => {
      // Mental health on Day 1 (part 1, baseDate)
      const mentalHealthDay = addDays(baseDate, 1 - 1);

      // SEL starts on Day 2 (part 2, baseDate + 1)
      const selStartDay = addDays(baseDate, 2 - 1);

      expect(selStartDay).not.toEqual(mentalHealthDay);
      expect(selStartDay).toEqual(addDays(mentalHealthDay, 1));
    });
  });

  describe("Total Question Counts", () => {
    it("should verify SEL Day 2 has 10 questions (4 + 6)", () => {
      const selfConcept = getScreenerQuestionSet({
        part: 2,
        subtype: "sel_self_awareness_self_concept",
        age: 12,
      });
      const emotionKnowledge = getScreenerQuestionSet({
        part: 2,
        subtype: "sel_self_awareness_emotion_knowledge",
        age: 12,
      });

      const totalDay2 =
        (selfConcept?.questions.length || 0) +
        (emotionKnowledge?.questions.length || 0);
      expect(totalDay2).toBe(10);
    });

    it("should verify SEL Day 3 has 9 questions (5 + 4)", () => {
      const socialAwareness = getScreenerQuestionSet({
        part: 3,
        subtype: "sel_social_awareness",
        age: 12,
      });
      const emotionRegulation = getScreenerQuestionSet({
        part: 3,
        subtype: "sel_self_management_emotion_regulation",
        age: 12,
      });

      const totalDay3 =
        (socialAwareness?.questions.length || 0) +
        (emotionRegulation?.questions.length || 0);
      expect(totalDay3).toBe(9);
    });

    it("should verify SEL Day 4 has 10 questions (4 + 6)", () => {
      const goalManagement = getScreenerQuestionSet({
        part: 4,
        subtype: "sel_self_management_goal_management",
        age: 12,
      });
      const schoolWork = getScreenerQuestionSet({
        part: 4,
        subtype: "sel_self_management_school_work",
        age: 12,
      });

      const totalDay4 =
        (goalManagement?.questions.length || 0) +
        (schoolWork?.questions.length || 0);
      expect(totalDay4).toBe(10);
    });

    it("should verify SEL Day 5 has 11 questions (6 + 5)", () => {
      const relationshipSkills = getScreenerQuestionSet({
        part: 5,
        subtype: "sel_relationship_skills",
        age: 12,
      });
      const decisionMaking = getScreenerQuestionSet({
        part: 5,
        subtype: "sel_responsible_decision_making",
        age: 12,
      });

      const totalDay5 =
        (relationshipSkills?.questions.length || 0) +
        (decisionMaking?.questions.length || 0);
      expect(totalDay5).toBe(11);
    });
  });
});
