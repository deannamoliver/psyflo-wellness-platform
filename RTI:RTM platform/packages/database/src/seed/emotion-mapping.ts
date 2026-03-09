/**
 * Emotion mapping utilities
 *
 * This file contains the mapping between universal and specific emotions,
 * and helper functions for validating emotion relationships.
 */

import type { SpecificEmotion, UniversalEmotion } from "./types";

/**
 * Mapping from universal emotions to their valid specific emotions
 */
export const universalToSpecificEmotionMap: Record<
  UniversalEmotion,
  SpecificEmotion[]
> = {
  happy: [
    "playful",
    "joyful",
    "curious",
    "confident",
    "valued",
    "creative",
    "peaceful",
    "hopeful",
  ],
  sad: [
    "lonely",
    "left_out",
    "guilty",
    "embarrassed",
    "empty",
    "hurt",
    "let_down",
  ],
  afraid: [
    "scared",
    "nervous",
    "worried",
    "insecure",
    "powerless",
    "threatened",
  ],
  angry: [
    "disrespected",
    "holding_a_grudge",
    "mad",
    "jealous",
    "aggressive",
    "frustrated",
    "annoyed",
  ],
  disgusted: [
    "grossed_out",
    "horrified",
    "disapproving",
    "disappointed",
    "offended",
  ],
  surprised: [
    "excited",
    "shocked",
    "amazed",
    "confused",
    "startled",
    "anxious",
  ],
  bad: [
    "blah",
    "tired",
    "stressed",
    "bored",
    "overwhelmed",
    "distracted",
    "excluded",
  ],
};

/**
 * Reverse mapping: specific emotion to universal emotion
 */
export const specificToUniversalEmotionMap: Record<
  SpecificEmotion,
  UniversalEmotion
> = (() => {
  const map = {} as Record<SpecificEmotion, UniversalEmotion>;
  for (const [universal, specifics] of Object.entries(
    universalToSpecificEmotionMap,
  )) {
    for (const specific of specifics) {
      map[specific] = universal as UniversalEmotion;
    }
  }
  return map;
})();

/**
 * Check if a specific emotion is valid for a given universal emotion
 */
export function isValidEmotionPair(
  universal: UniversalEmotion,
  specific: SpecificEmotion,
): boolean {
  return universalToSpecificEmotionMap[universal]?.includes(specific) ?? false;
}

/**
 * Get the universal emotion for a specific emotion
 */
export function getUniversalForSpecific(
  specific: SpecificEmotion,
): UniversalEmotion | undefined {
  return specificToUniversalEmotionMap[specific];
}
