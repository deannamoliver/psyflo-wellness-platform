"server-only";

import {
  type ethnicityEnum,
  type genderEnum,
  type languageEnum,
  profiles,
  type pronounEnum,
} from "@feelwell/database";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function updateProfile(data: {
  dateOfBirth?: string;
  grade?: number;
  gender?: (typeof genderEnum.enumValues)[number];
  pronouns?: (typeof pronounEnum.enumValues)[number];
  ethnicity?: (typeof ethnicityEnum.enumValues)[number];
  preferredLanguage?: (typeof languageEnum.enumValues)[number];
  interests?: string[];
  learningStyles?: string[];
  goals?: string[];
}) {
  const db = await serverDrizzle();

  await db.rls(async (tx) =>
    tx
      .insert(profiles)
      .values({
        id: db.userId(),
        dateOfBirth: data.dateOfBirth,
        grade: data.grade,
        gender: data.gender,
        pronouns: data.pronouns,
        ethnicity: data.ethnicity,
        language: data.preferredLanguage,
        interests: data.interests,
        learningStyles: data.learningStyles,
        goals: data.goals,
      })
      .onConflictDoUpdate({
        target: [profiles.id],
        set: {
          dateOfBirth: data.dateOfBirth,
          grade: data.grade,
          gender: data.gender,
          pronouns: data.pronouns,
          ethnicity: data.ethnicity,
          language: data.preferredLanguage,
          interests: data.interests,
          learningStyles: data.learningStyles,
          goals: data.goals,
        },
      }),
  );
}
