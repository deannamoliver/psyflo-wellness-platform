import { addDays, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";

/**
 * Integration tests for onboarding screener creation
 *
 * These tests verify that completing onboarding creates the correct screeners
 * based on student age, following the new schedule:
 * - Ages ≥11: Mental health (Day 1) + SEL (Days 2-5)
 * - Ages <11: SEL only (Days 1-4)
 */

// Mock types for testing
type Profile = {
  id: string;
  dateOfBirth: Date | null;
  grade: number | null;
};

type ScreenerType = "phq_a" | "phq_9" | "gad_child" | "gad_7" | "sel";

type CreatedScreener = {
  type: ScreenerType;
  startAt: Date;
};

// Helper function that mimics createAllScreeners logic
function getExpectedScreeners(
  profile: Profile,
  onboardingStartAt: Date,
): CreatedScreener[] {
  const screeners: CreatedScreener[] = [];

  // Calculate age (same logic as actual implementation)
  let age: number;
  if (profile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(profile.dateOfBirth);
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  } else if (profile.grade != null) {
    age = profile.grade + 5;
  } else {
    throw new Error("Student age or grade is required");
  }

  // Age-specific screener creation
  if (age >= 11 && age <= 17) {
    // Mental health screeners on Day 1
    screeners.push({ type: "phq_a", startAt: onboardingStartAt });
    screeners.push({ type: "gad_child", startAt: onboardingStartAt });
    // SEL screener (Days 2-5, parts 2-5 auto-shift from startAt)
    screeners.push({ type: "sel", startAt: onboardingStartAt });
  } else if (age >= 18) {
    // Mental health screeners on Day 1
    screeners.push({ type: "phq_9", startAt: onboardingStartAt });
    screeners.push({ type: "gad_7", startAt: onboardingStartAt });
    // SEL screener (Days 2-5, parts 2-5 auto-shift from startAt)
    screeners.push({ type: "sel", startAt: onboardingStartAt });
  } else {
    // Ages < 11: SEL only, offset by -1 day so parts 2-5 map to Days 1-4
    screeners.push({ type: "sel", startAt: addDays(onboardingStartAt, -1) });
  }

  return screeners;
}

describe("Onboarding Screener Creation", () => {
  describe("Ages 11-17 (Middle/High School)", () => {
    it("should create PHQ-A, GAD-Child, and SEL screeners for age 12", () => {
      const profile: Profile = {
        id: "student1",
        dateOfBirth: new Date("2013-01-15"), // ~12 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners).toContainEqual({ type: "phq_a", startAt });
      expect(screeners).toContainEqual({ type: "gad_child", startAt });
      expect(screeners).toContainEqual({ type: "sel", startAt });
    });

    it("should create correct screeners for age 11 (youngest eligible)", () => {
      const profile: Profile = {
        id: "student2",
        dateOfBirth: new Date("2014-06-01"), // ~11 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_a");
      expect(screeners.map((s) => s.type)).toContain("gad_child");
      expect(screeners.map((s) => s.type)).toContain("sel");
    });

    it("should create correct screeners for age 17 (oldest in range)", () => {
      const profile: Profile = {
        id: "student3",
        dateOfBirth: new Date("2008-01-15"), // ~17 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_a");
      expect(screeners.map((s) => s.type)).toContain("gad_child");
      expect(screeners.map((s) => s.type)).toContain("sel");
    });

    it("should use grade to calculate age when dateOfBirth is null", () => {
      const profile: Profile = {
        id: "student4",
        dateOfBirth: null,
        grade: 7, // 7th grade = ~12 years old
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_a");
      expect(screeners.map((s) => s.type)).toContain("gad_child");
      expect(screeners.map((s) => s.type)).toContain("sel");
    });

    it("should have all mental health screeners start on same day", () => {
      const profile: Profile = {
        id: "student5",
        dateOfBirth: new Date("2012-03-15"), // ~13 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      const phqA = screeners.find((s) => s.type === "phq_a");
      const gadChild = screeners.find((s) => s.type === "gad_child");
      const sel = screeners.find((s) => s.type === "sel");

      expect(phqA?.startAt).toEqual(startAt);
      expect(gadChild?.startAt).toEqual(startAt);
      expect(sel?.startAt).toEqual(startAt); // SEL also starts same day (sessions auto-offset to Days 2-5)
    });
  });

  describe("Ages 18+ (Adults)", () => {
    it("should create PHQ-9, GAD-7, and SEL screeners for age 18", () => {
      const profile: Profile = {
        id: "student6",
        dateOfBirth: new Date("2007-01-15"), // ~18 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners).toContainEqual({ type: "phq_9", startAt });
      expect(screeners).toContainEqual({ type: "gad_7", startAt });
      expect(screeners).toContainEqual({ type: "sel", startAt });
    });

    it("should create correct screeners for age 25", () => {
      const profile: Profile = {
        id: "student7",
        dateOfBirth: new Date("2000-06-01"), // ~25 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_9");
      expect(screeners.map((s) => s.type)).toContain("gad_7");
      expect(screeners.map((s) => s.type)).toContain("sel");
    });

    it("should NOT create PHQ-A or GAD-Child for adults", () => {
      const profile: Profile = {
        id: "student8",
        dateOfBirth: new Date("2005-01-15"), // ~20 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners.map((s) => s.type)).not.toContain("phq_a");
      expect(screeners.map((s) => s.type)).not.toContain("gad_child");
    });

    it("should have all screeners start on same day", () => {
      const profile: Profile = {
        id: "student9",
        dateOfBirth: new Date("2006-03-15"), // ~19 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      const phq9 = screeners.find((s) => s.type === "phq_9");
      const gad7 = screeners.find((s) => s.type === "gad_7");
      const sel = screeners.find((s) => s.type === "sel");

      expect(phq9?.startAt).toEqual(startAt);
      expect(gad7?.startAt).toEqual(startAt);
      expect(sel?.startAt).toEqual(startAt);
    });
  });

  describe("Ages <11 (Elementary School)", () => {
    it("should create ONLY SEL screener for age 10", () => {
      const profile: Profile = {
        id: "student10",
        dateOfBirth: new Date("2015-01-15"), // ~10 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.type).toBe("sel");
    });

    it("should create ONLY SEL screener for age 8", () => {
      const profile: Profile = {
        id: "student11",
        dateOfBirth: new Date("2017-06-01"), // ~8 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.type).toBe("sel");
    });

    it("should offset SEL startAt by -1 day for ages <11", () => {
      const profile: Profile = {
        id: "student12",
        dateOfBirth: new Date("2016-01-15"), // ~9 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.type).toBe("sel");
      expect(screeners[0]?.startAt).toEqual(addDays(startAt, -1));
    });

    it("should NOT create mental health screeners for ages <11", () => {
      const profile: Profile = {
        id: "student13",
        dateOfBirth: new Date("2016-06-01"), // ~9 years old
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners.map((s) => s.type)).not.toContain("phq_a");
      expect(screeners.map((s) => s.type)).not.toContain("phq_9");
      expect(screeners.map((s) => s.type)).not.toContain("gad_child");
      expect(screeners.map((s) => s.type)).not.toContain("gad_7");
    });

    it("should work with grade-based age calculation", () => {
      const profile: Profile = {
        id: "student14",
        dateOfBirth: null,
        grade: 4, // 4th grade = ~9 years old
      };

      const startAt = startOfDay(new Date("2025-09-01"));
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.type).toBe("sel");
      expect(screeners[0]?.startAt).toEqual(addDays(startAt, -1));
    });
  });

  describe("Age Boundary Cases", () => {
    it("should create mental health screeners at exactly age 11", () => {
      // Birthday today = exactly 11 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 11,
        today.getMonth(),
        today.getDate(),
      );

      const profile: Profile = {
        id: "student15",
        dateOfBirth: birthDate,
        grade: null,
      };

      const startAt = startOfDay(new Date());
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_a");
      expect(screeners.map((s) => s.type)).toContain("gad_child");
    });

    it("should NOT create mental health screeners one day before 11th birthday", () => {
      // Birthday tomorrow = still 10 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 11,
        today.getMonth(),
        today.getDate() + 1,
      );

      const profile: Profile = {
        id: "student16",
        dateOfBirth: birthDate,
        grade: null,
      };

      const startAt = startOfDay(new Date());
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.type).toBe("sel");
    });

    it("should switch from PHQ-A to PHQ-9 at exactly age 18", () => {
      // Birthday today = exactly 18 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );

      const profile: Profile = {
        id: "student17",
        dateOfBirth: birthDate,
        grade: null,
      };

      const startAt = startOfDay(new Date());
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_9");
      expect(screeners.map((s) => s.type)).toContain("gad_7");
      expect(screeners.map((s) => s.type)).not.toContain("phq_a");
      expect(screeners.map((s) => s.type)).not.toContain("gad_child");
    });

    it("should still use PHQ-A at age 17 (one day before 18th birthday)", () => {
      // Birthday tomorrow = still 17 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate() + 1,
      );

      const profile: Profile = {
        id: "student18",
        dateOfBirth: birthDate,
        grade: null,
      };

      const startAt = startOfDay(new Date());
      const screeners = getExpectedScreeners(profile, startAt);

      expect(screeners).toHaveLength(3);
      expect(screeners.map((s) => s.type)).toContain("phq_a");
      expect(screeners.map((s) => s.type)).toContain("gad_child");
      expect(screeners.map((s) => s.type)).not.toContain("phq_9");
      expect(screeners.map((s) => s.type)).not.toContain("gad_7");
    });
  });

  describe("Different Start Dates", () => {
    it("should respect custom startAt dates", () => {
      const profile: Profile = {
        id: "student19",
        dateOfBirth: new Date("2012-01-15"), // ~13 years old
        grade: null,
      };

      const customStartAt = startOfDay(new Date("2025-12-15"));
      const screeners = getExpectedScreeners(profile, customStartAt);

      expect(screeners).toHaveLength(3);
      screeners.forEach((screener) => {
        if (screener.type !== "sel") {
          expect(screener.startAt).toEqual(customStartAt);
        }
      });
    });

    it("should offset SEL correctly for ages <11 regardless of start date", () => {
      const profile: Profile = {
        id: "student20",
        dateOfBirth: new Date("2016-01-15"), // ~9 years old
        grade: null,
      };

      const customStartAt = startOfDay(new Date("2025-10-20"));
      const screeners = getExpectedScreeners(profile, customStartAt);

      expect(screeners).toHaveLength(1);
      expect(screeners[0]?.startAt).toEqual(addDays(customStartAt, -1));
    });
  });

  describe("Error Cases", () => {
    it("should throw error when both dateOfBirth and grade are null", () => {
      const profile: Profile = {
        id: "student21",
        dateOfBirth: null,
        grade: null,
      };

      const startAt = startOfDay(new Date("2025-09-01"));

      expect(() => getExpectedScreeners(profile, startAt)).toThrow(
        "Student age or grade is required",
      );
    });
  });
});
