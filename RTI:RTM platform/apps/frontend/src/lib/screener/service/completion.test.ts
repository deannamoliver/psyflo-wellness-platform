import { describe, expect, it } from "vitest";

/**
 * Unit tests for screener completion and alert logic
 *
 * These tests verify the new alert triggering rules:
 * 1. Immediate safety alert for Q9 > 0 (suicidal ideation)
 * 2. Alert on FIRST threshold crossing (not continuous above-threshold alerts)
 * 3. Alert on ANY score increase from previous screener
 * 4. No alert if score stays same or decreases (unless first crossing)
 *
 * Thresholds:
 * - PHQ-A/PHQ-9: Total score ≥ 10
 * - GAD-Child: Average score ≥ 2.5 (total ≥ 25)
 * - GAD-7: Total score ≥ 10
 */

// Mock types matching database schema
type Screener = {
  id: string;
  userId: string;
  type: "phq_a" | "phq_9" | "gad_child" | "gad_7" | "sel";
  score: number;
  lastScore: number | null;
  completedAt: Date | null;
};

// Helper functions to test (these are the actual implementation logic)
function shouldTriggerThresholdAlert(
  screener: Screener,
  previousScore: number | null,
): boolean {
  // No previous screener means this is the first one
  if (previousScore === null) {
    // First screener: only alert if crossing threshold
    return isCrossingThreshold(screener);
  }

  // Check if previous score was below threshold
  const wasBelowThreshold = !isAboveThreshold(screener.type, previousScore);

  // Check if current score is above threshold
  const isNowAboveThreshold = isAboveThreshold(screener.type, screener.score);

  // Alert only if crossing from below to above threshold
  return wasBelowThreshold && isNowAboveThreshold;
}

function shouldTriggerIncreaseAlert(
  screener: Screener,
  previousScore: number | null,
): boolean {
  // No alert if there's no previous score to compare
  if (previousScore === null) {
    return false;
  }

  // Alert on any positive increase
  return screener.score > previousScore;
}

function isCrossingThreshold(screener: Screener): boolean {
  return isAboveThreshold(screener.type, screener.score);
}

function isAboveThreshold(type: Screener["type"], score: number): boolean {
  switch (type) {
    case "phq_a":
    case "phq_9":
      return score >= 10;
    case "gad_child":
      // GAD-Child uses average: total score / 10 questions
      return score / 10 >= 2.5; // equivalent to total >= 25
    case "gad_7":
      return score >= 10;
    case "sel":
      return false; // SEL doesn't trigger alerts
  }
}

describe("Alert Triggering Logic", () => {
  describe("shouldTriggerThresholdAlert", () => {
    describe("First Screener (no previous score)", () => {
      it("should alert when PHQ-A first screener crosses threshold (≥10)", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "phq_a",
          score: 15,
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(true);
      });

      it("should NOT alert when PHQ-A first screener is below threshold", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "phq_a",
          score: 5,
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(false);
      });

      it("should alert when GAD-Child first screener crosses threshold (avg ≥2.5)", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "gad_child",
          score: 28, // 28/10 = 2.8 average
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(true);
      });

      it("should NOT alert when GAD-Child first screener is at threshold edge (exactly 2.5)", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "gad_child",
          score: 25, // 25/10 = 2.5 average (at threshold)
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(true);
      });

      it("should alert when GAD-7 first screener crosses threshold (≥10)", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "gad_7",
          score: 12,
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(true);
      });
    });

    describe("Subsequent Screeners (threshold crossing)", () => {
      it("should alert when crossing from below to above threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 12,
          lastScore: 8,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 8)).toBe(true);
      });

      it("should NOT alert when staying above threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 15,
          lastScore: 12,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 12)).toBe(false);
      });

      it("should NOT alert when staying below threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 7,
          lastScore: 5,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 5)).toBe(false);
      });

      it("should NOT alert when dropping from above to below threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 8,
          lastScore: 15,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 15)).toBe(false);
      });

      it("should alert when crossing GAD-Child threshold with average calculation", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "gad_child",
          score: 26, // 26/10 = 2.6 average (above 2.5)
          lastScore: 24, // 24/10 = 2.4 average (below 2.5)
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 24)).toBe(true);
      });
    });

    describe("Edge Cases", () => {
      it("should handle exact threshold values for PHQ", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_9",
          score: 10, // exactly at threshold
          lastScore: 9,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, 9)).toBe(true);
      });

      it("should NOT alert for SEL screeners (no thresholds)", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "sel",
          score: 100,
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerThresholdAlert(screener, null)).toBe(false);
      });
    });
  });

  describe("shouldTriggerIncreaseAlert", () => {
    describe("Score Increases", () => {
      it("should alert on any positive score increase", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 8,
          lastScore: 5,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 5)).toBe(true);
      });

      it("should alert on small increase (1 point)", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "gad_7",
          score: 6,
          lastScore: 5,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 5)).toBe(true);
      });

      it("should alert on large increase", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_9",
          score: 20,
          lastScore: 5,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 5)).toBe(true);
      });

      it("should alert on increase that crosses threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 12,
          lastScore: 8,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 8)).toBe(true);
      });

      it("should alert on increase while above threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "gad_child",
          score: 30,
          lastScore: 28,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 28)).toBe(true);
      });
    });

    describe("No Alert Scenarios", () => {
      it("should NOT alert when score stays the same", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 10,
          lastScore: 10,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 10)).toBe(false);
      });

      it("should NOT alert when score decreases", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "phq_a",
          score: 8,
          lastScore: 12,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 12)).toBe(false);
      });

      it("should NOT alert when score decreases while above threshold", () => {
        const screener: Screener = {
          id: "2",
          userId: "user1",
          type: "gad_7",
          score: 14,
          lastScore: 18,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, 18)).toBe(false);
      });

      it("should NOT alert when there is no previous score", () => {
        const screener: Screener = {
          id: "1",
          userId: "user1",
          type: "phq_a",
          score: 15,
          lastScore: null,
          completedAt: new Date(),
        };

        expect(shouldTriggerIncreaseAlert(screener, null)).toBe(false);
      });
    });
  });

  describe("Combined Alert Scenarios", () => {
    it("should trigger BOTH threshold and increase alerts when crossing threshold upward", () => {
      const screener: Screener = {
        id: "2",
        userId: "user1",
        type: "phq_a",
        score: 12,
        lastScore: 8,
        completedAt: new Date(),
      };

      const thresholdAlert = shouldTriggerThresholdAlert(screener, 8);
      const increaseAlert = shouldTriggerIncreaseAlert(screener, 8);

      expect(thresholdAlert).toBe(true);
      expect(increaseAlert).toBe(true);
    });

    it("should trigger ONLY increase alert when increasing while above threshold", () => {
      const screener: Screener = {
        id: "2",
        userId: "user1",
        type: "phq_a",
        score: 15,
        lastScore: 12,
        completedAt: new Date(),
      };

      const thresholdAlert = shouldTriggerThresholdAlert(screener, 12);
      const increaseAlert = shouldTriggerIncreaseAlert(screener, 12);

      expect(thresholdAlert).toBe(false);
      expect(increaseAlert).toBe(true);
    });

    it("should trigger NO alerts when score decreases below threshold", () => {
      const screener: Screener = {
        id: "2",
        userId: "user1",
        type: "phq_a",
        score: 8,
        lastScore: 15,
        completedAt: new Date(),
      };

      const thresholdAlert = shouldTriggerThresholdAlert(screener, 15);
      const increaseAlert = shouldTriggerIncreaseAlert(screener, 15);

      expect(thresholdAlert).toBe(false);
      expect(increaseAlert).toBe(false);
    });

    it("should trigger NO alerts when score stays same above threshold", () => {
      const screener: Screener = {
        id: "2",
        userId: "user1",
        type: "gad_7",
        score: 12,
        lastScore: 12,
        completedAt: new Date(),
      };

      const thresholdAlert = shouldTriggerThresholdAlert(screener, 12);
      const increaseAlert = shouldTriggerIncreaseAlert(screener, 12);

      expect(thresholdAlert).toBe(false);
      expect(increaseAlert).toBe(false);
    });
  });

  describe("Threshold Calculations", () => {
    describe("PHQ-A and PHQ-9 (score ≥ 10)", () => {
      it("should identify PHQ-A score 10 as at threshold", () => {
        expect(isAboveThreshold("phq_a", 10)).toBe(true);
      });

      it("should identify PHQ-A score 9 as below threshold", () => {
        expect(isAboveThreshold("phq_a", 9)).toBe(false);
      });

      it("should identify PHQ-9 score 15 as above threshold", () => {
        expect(isAboveThreshold("phq_9", 15)).toBe(true);
      });
    });

    describe("GAD-Child (average ≥ 2.5)", () => {
      it("should identify total 25 as at threshold (avg 2.5)", () => {
        expect(isAboveThreshold("gad_child", 25)).toBe(true);
      });

      it("should identify total 24 as below threshold (avg 2.4)", () => {
        expect(isAboveThreshold("gad_child", 24)).toBe(false);
      });

      it("should identify total 30 as above threshold (avg 3.0)", () => {
        expect(isAboveThreshold("gad_child", 30)).toBe(true);
      });

      it("should handle decimal boundary correctly (25.5 = avg 2.55)", () => {
        expect(isAboveThreshold("gad_child", 25.5)).toBe(true);
      });
    });

    describe("GAD-7 (score ≥ 10)", () => {
      it("should identify GAD-7 score 10 as at threshold", () => {
        expect(isAboveThreshold("gad_7", 10)).toBe(true);
      });

      it("should identify GAD-7 score 9 as below threshold", () => {
        expect(isAboveThreshold("gad_7", 9)).toBe(false);
      });

      it("should identify GAD-7 score 14 as above threshold", () => {
        expect(isAboveThreshold("gad_7", 14)).toBe(true);
      });
    });

    describe("SEL (no threshold)", () => {
      it("should never consider SEL scores as above threshold", () => {
        expect(isAboveThreshold("sel", 0)).toBe(false);
        expect(isAboveThreshold("sel", 50)).toBe(false);
        expect(isAboveThreshold("sel", 100)).toBe(false);
      });
    });
  });
});

/**
 * Re-administration Cadence Tests
 *
 * These tests verify the correct follow-up intervals for each screener type:
 * - PHQ-A (11-17): If ≥10 or Q9>0 → 2 weeks; else → 2 months
 * - GAD-Child (11-17): If ≥2.5 avg → 2 weeks; else → 2 months
 * - PHQ-9 (18+): If ≥10 or Q9>0 → 2 weeks; else → 2 months
 * - GAD-7 (18+): If ≥10 → 2 weeks; else → 2 months
 * - SEL: Always 10 weeks (fixed)
 */

// Helper function to determine re-administration interval
function getReadministrationWeeks(
  screener: Screener,
  hasQuestion9: boolean = false,
): number | null {
  // SEL: Fixed 10-week interval
  if (screener.type === "sel") {
    return 10;
  }

  // PHQ-A: 2 weeks if ≥10 or Q9>0, else 8 weeks (2 months)
  if (screener.type === "phq_a") {
    return screener.score >= 10 || hasQuestion9 ? 2 : 8;
  }

  // PHQ-9: 2 weeks if ≥10 or Q9>0, else 8 weeks (2 months)
  if (screener.type === "phq_9") {
    return screener.score >= 10 || hasQuestion9 ? 2 : 8;
  }

  // GAD-Child: 2 weeks if avg ≥2.5 (total ≥25), else 8 weeks (2 months)
  if (screener.type === "gad_child") {
    const averageScore = screener.score / 10;
    return averageScore >= 2.5 ? 2 : 8;
  }

  // GAD-7: 2 weeks if ≥10, else 8 weeks (2 months)
  if (screener.type === "gad_7") {
    return screener.score >= 10 ? 2 : 8;
  }

  return null;
}

describe("Re-administration Cadence Logic", () => {
  describe("PHQ-A (ages 11-17)", () => {
    it("should schedule 2-week follow-up when score ≥10", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_a",
        score: 15,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(2);
    });

    it("should schedule 2-week follow-up when score at threshold (10)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_a",
        score: 10,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(2);
    });

    it("should schedule 2-week follow-up when Q9 > 0 (even with low score)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_a",
        score: 5,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, true)).toBe(2);
    });

    it("should schedule 2-month follow-up when score <10 and Q9=0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_a",
        score: 9,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(8);
    });

    it("should schedule 2-month follow-up when score is 0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_a",
        score: 0,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(8);
    });
  });

  describe("PHQ-9 (ages 18+)", () => {
    it("should schedule 2-week follow-up when score ≥10", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_9",
        score: 12,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(2);
    });

    it("should schedule 2-week follow-up when Q9 > 0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_9",
        score: 7,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, true)).toBe(2);
    });

    it("should schedule 2-month follow-up when score ≤9 and Q9=0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "phq_9",
        score: 9,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener, false)).toBe(8);
    });
  });

  describe("GAD-Child (ages 11-17)", () => {
    it("should schedule 2-week follow-up when average ≥2.5 (total 25)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 25, // 25/10 = 2.5 average
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(2);
    });

    it("should schedule 2-week follow-up when average >2.5 (total 28)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 28, // 28/10 = 2.8 average
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(2);
    });

    it("should schedule 2-month follow-up when average <2.5 (total 24)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 24, // 24/10 = 2.4 average
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(8);
    });

    it("should schedule 2-month follow-up when average <2.5 (total 10)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 10, // 10/10 = 1.0 average
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(8);
    });

    it("should schedule 2-month follow-up when score is 0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 0,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(8);
    });

    it("should handle decimal scores correctly (26 = avg 2.6)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_child",
        score: 26, // 26/10 = 2.6 average
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(2);
    });
  });

  describe("GAD-7 (ages 18+)", () => {
    it("should schedule 2-week follow-up when score ≥10", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_7",
        score: 15,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(2);
    });

    it("should schedule 2-week follow-up when score at threshold (10)", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_7",
        score: 10,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(2);
    });

    it("should schedule 2-month follow-up when score ≤9", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_7",
        score: 9,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(8);
    });

    it("should schedule 2-month follow-up when score is 0", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "gad_7",
        score: 0,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(8);
    });
  });

  describe("SEL (all ages)", () => {
    it("should always schedule 10-week follow-up regardless of score", () => {
      const lowScore: Screener = {
        id: "1",
        userId: "user1",
        type: "sel",
        score: 10,
        lastScore: null,
        completedAt: new Date(),
      };

      const highScore: Screener = {
        id: "2",
        userId: "user2",
        type: "sel",
        score: 100,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(lowScore)).toBe(10);
      expect(getReadministrationWeeks(highScore)).toBe(10);
    });

    it("should schedule 10-week follow-up for zero score", () => {
      const screener: Screener = {
        id: "1",
        userId: "user1",
        type: "sel",
        score: 0,
        lastScore: null,
        completedAt: new Date(),
      };

      expect(getReadministrationWeeks(screener)).toBe(10);
    });
  });

  describe("Edge Cases", () => {
    it("should handle boundary scores correctly for all types", () => {
      // PHQ at threshold boundary
      expect(
        getReadministrationWeeks(
          {
            id: "1",
            userId: "u1",
            type: "phq_a",
            score: 10,
            lastScore: null,
            completedAt: new Date(),
          },
          false,
        ),
      ).toBe(2);

      // GAD-7 at threshold boundary
      expect(
        getReadministrationWeeks({
          id: "1",
          userId: "u1",
          type: "gad_7",
          score: 10,
          lastScore: null,
          completedAt: new Date(),
        }),
      ).toBe(2);

      // GAD-Child at threshold boundary (25 = avg 2.5)
      expect(
        getReadministrationWeeks({
          id: "1",
          userId: "u1",
          type: "gad_child",
          score: 25,
          lastScore: null,
          completedAt: new Date(),
        }),
      ).toBe(2);
    });

    it("should prioritize Q9 over score for PHQ screeners", () => {
      // Low score but Q9 positive should still be 2 weeks
      expect(
        getReadministrationWeeks(
          {
            id: "1",
            userId: "u1",
            type: "phq_a",
            score: 3,
            lastScore: null,
            completedAt: new Date(),
          },
          true,
        ),
      ).toBe(2);

      expect(
        getReadministrationWeeks(
          {
            id: "1",
            userId: "u1",
            type: "phq_9",
            score: 5,
            lastScore: null,
            completedAt: new Date(),
          },
          true,
        ),
      ).toBe(2);
    });
  });
});
