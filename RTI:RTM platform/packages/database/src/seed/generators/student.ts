/**
 * Student generator
 *
 * Creates test student users with profiles and school associations
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";
import type { TestScenario } from "../types";

/**
 * Creates a test student user with profile and school association
 */
export async function createTestStudent(
  db: ReturnType<typeof drizzle>,
  scenario: TestScenario["student"],
  schoolId: string,
): Promise<string> {
  const email = `${scenario.firstName.toLowerCase()}.${scenario.lastName.toLowerCase()}@psyflo.com`;
  const userId = crypto.randomUUID();

  // Create auth user
  await db.execute(`
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      aud,
      role,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '${userId}',
      '00000000-0000-0000-0000-000000000000',
      '${email}',
      '',
      NOW(),
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"${scenario.firstName}","last_name":"${scenario.lastName}"}',
      '',
      '',
      '',
      ''
    )
  `);

  // Create identity
  await db.execute(`
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '${userId}',
      '${userId}',
      jsonb_build_object('sub', '${userId}', 'email', '${email}'),
      'email',
      NOW(),
      NOW(),
      NOW()
    )
  `);

  // Calculate dateOfBirth from age (PostgreSQL date field expects string YYYY-MM-DD)
  const today = new Date();
  const birthYear = today.getFullYear() - scenario.age;
  const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
  const dateOfBirth = birthDate.toISOString().split("T")[0] as string;

  // Create profile
  await db.insert(schema.profiles).values({
    id: userId,
    dateOfBirth,
    grade: scenario.grade,
    gender: null,
    pronouns: null,
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
  });

  // Create user-school association
  await db.insert(schema.userSchools).values({
    userId,
    schoolId,
    role: "student",
  });

  // Create user settings
  await db.insert(schema.userSettings).values({
    id: userId,
    timezone: "America/New_York",
  });

  return userId;
}
