/**
 * Seed data validators
 *
 * This file contains all constraint validators for ensuring seed data integrity.
 * Each validator is a pure function that returns a ValidationResult.
 *
 * Phase 1: Basic validators (screenerType, gradeAge, emailDomain)
 * Phase 2: Business logic validators (alertScreenerMatch, timelineOrder)
 * Phase 3: Complex validators (screenerScore)
 * Phase 4: Mood check-in validators (emotionPair)
 */

import { isValidEmotionPair } from "./emotion-mapping";
import type {
  AlertType,
  ScreenerType,
  SpecificEmotion,
  TestScenario,
  UniversalEmotion,
} from "./types";

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Individual validators
 */
export const validators = {
  /**
   * Validate screener type is appropriate for age
   */
  screenerType: (age: number, type: ScreenerType): ValidationResult => {
    if ((type === "phq_a" || type === "gad_child") && (age < 11 || age > 17)) {
      return {
        valid: false,
        errors: [`${type} requires age 11-17, got ${age}`],
      };
    }
    if ((type === "phq_9" || type === "gad_7") && age < 18) {
      return {
        valid: false,
        errors: [`${type} requires age 18+, got ${age}`],
      };
    }
    return { valid: true };
  },

  /**
   * Validate grade-age alignment
   */
  gradeAge: (grade: number, age: number): ValidationResult => {
    const expectedAges: Record<number, number[]> = {
      8: [13, 14],
      9: [14, 15],
      10: [15, 16],
      11: [16, 17],
      12: [17, 18],
    };

    if (!expectedAges[grade]?.includes(age)) {
      return {
        valid: false,
        errors: [
          `Grade ${grade} expects ages ${expectedAges[grade]?.join("-")}, got ${age}`,
        ],
      };
    }
    return { valid: true };
  },

  /**
   * Validate email domain matches school domain
   */
  emailDomain: (email: string, schoolDomain: string): ValidationResult => {
    if (!email.endsWith(`@${schoolDomain}`)) {
      return {
        valid: false,
        errors: [`Email ${email} doesn't match school domain ${schoolDomain}`],
      };
    }
    return { valid: true };
  },

  /**
   * Validate alert type matches screener type
   */
  alertScreenerMatch: (
    alertType: AlertType,
    screenerType: ScreenerType,
  ): ValidationResult => {
    const validPairs: Record<AlertType, ScreenerType[]> = {
      depression: ["phq_a", "phq_9"],
      anxiety: ["gad_child", "gad_7"],
      safety: ["phq_a", "phq_9"], // Question 9
      abuse_neglect: [], // Detected via chat, not screeners
      harm_to_others: [], // Detected via chat, not screeners
    };

    if (!validPairs[alertType]?.includes(screenerType)) {
      return {
        valid: false,
        errors: [
          `Alert type ${alertType} doesn't match screener ${screenerType}`,
        ],
      };
    }
    return { valid: true };
  },

  /**
   * Validate timeline entries are in chronological order
   */
  timelineOrder: (entries: Array<{ createdAt?: Date }>): ValidationResult => {
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1]?.createdAt;
      const curr = entries[i]?.createdAt;
      if (prev && curr && curr < prev) {
        return {
          valid: false,
          errors: [`Timeline entry ${i} is before entry ${i - 1}`],
        };
      }
    }
    return { valid: true };
  },

  /**
   * Validate that a specific emotion is valid for a given universal emotion
   */
  emotionPair: (
    universalEmotion: UniversalEmotion,
    specificEmotion: SpecificEmotion,
  ): ValidationResult => {
    if (!isValidEmotionPair(universalEmotion, specificEmotion)) {
      return {
        valid: false,
        errors: [
          `Specific emotion '${specificEmotion}' is not valid for universal emotion '${universalEmotion}'`,
        ],
      };
    }
    return { valid: true };
  },
};

/**
 * Composite validator for entire scenario
 * Validates all constraints for a test scenario before creation
 */
export function validateScenario(scenario: TestScenario): ValidationResult {
  const errors: string[] = [];
  const studentName = `${scenario.student.firstName} ${scenario.student.lastName}`;

  // Validate student grade-age alignment
  const gradeAgeResult = validators.gradeAge(
    scenario.student.grade,
    scenario.student.age,
  );
  if (!gradeAgeResult.valid) {
    errors.push(
      ...gradeAgeResult.errors.map((e) => `[${studentName}] Student: ${e}`),
    );
  }

  // Validate mood check-ins
  if (scenario.moodCheckIns) {
    for (let i = 0; i < scenario.moodCheckIns.length; i++) {
      const checkIn = scenario.moodCheckIns[i];
      if (!checkIn) continue;

      const checkInPrefix = `[${studentName}] Mood Check-in ${i + 1}`;

      // Validate that specific emotion matches universal emotion
      const emotionPairResult = validators.emotionPair(
        checkIn.universalEmotion,
        checkIn.specificEmotion,
      );
      if (!emotionPairResult.valid) {
        errors.push(
          ...emotionPairResult.errors.map((e) => `${checkInPrefix}: ${e}`),
        );
      }
    }
  }

  // Validate each alert
  for (let i = 0; i < scenario.alerts.length; i++) {
    const alert = scenario.alerts[i];
    if (!alert) continue;

    const alertPrefix = `[${studentName}] Alert ${i + 1}`;

    if (alert.screener) {
      // Validate screener type for age
      const typeResult = validators.screenerType(
        scenario.student.age,
        alert.screener.type,
      );
      if (!typeResult.valid) {
        errors.push(
          ...typeResult.errors.map((e) => `${alertPrefix}: Screener: ${e}`),
        );
      }

      // Validate alert matches screener (only if alert exists and source is screener)
      if (alert.alert && alert.alert.source === "screener") {
        const matchResult = validators.alertScreenerMatch(
          alert.alert.type,
          alert.screener.type,
        );
        if (!matchResult.valid) {
          errors.push(...matchResult.errors.map((e) => `${alertPrefix}: ${e}`));
        }
      }
    }

    // Validate timeline order (only if alert exists)
    if (alert.alert) {
      const timelineResult = validators.timelineOrder(alert.alert.timeline);
      if (!timelineResult.valid) {
        errors.push(
          ...timelineResult.errors.map((e) => `${alertPrefix}: Timeline: ${e}`),
        );
      }
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Format validation errors for console output
 */
export function formatValidationErrors(
  scenarioName: string,
  errors: string[],
): string {
  return [
    `❌ Invalid scenario: ${scenarioName}`,
    ...errors.map((e) => `   - ${e}`),
  ].join("\n");
}
