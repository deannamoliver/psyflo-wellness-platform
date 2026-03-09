/**
 * Mood check-in generator
 *
 * Generator for creating mood check-ins for test students.
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";
import type { SpecificEmotion, UniversalEmotion } from "../types";

/**
 * Creates a mood check-in for a student
 *
 * @param db - Drizzle database instance
 * @param studentId - The auth user ID of the student
 * @param universalEmotion - The universal emotion category
 * @param specificEmotion - The specific emotion within the category
 * @param createdAt - Optional timestamp for the check-in (defaults to now)
 */
export async function createMoodCheckIn(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  universalEmotion: UniversalEmotion,
  specificEmotion: SpecificEmotion,
  createdAt?: Date,
): Promise<void> {
  await db.insert(schema.moodCheckIns).values({
    userId: studentId,
    universalEmotion,
    specificEmotion,
    createdAt: createdAt ?? new Date(),
  });
}
