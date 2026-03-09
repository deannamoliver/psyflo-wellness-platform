/**
 * Seed data helpers
 *
 * High-level helper functions for creating test scenarios and test users.
 * Individual generators have been extracted to the generators/ directory.
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import { screenerQuestionSets } from "../resources/screener-questions";
import * as schema from "../schema";
import { createTestAlert } from "./generators/alert";
import { createHomeEmergencyContacts } from "./generators/emergency-contact";
import { createMoodCheckIn } from "./generators/mood-checkin";
import { createTestScreener } from "./generators/screener";
import { createTestSELScreener } from "./generators/sel-screener";
import { createTestStudent } from "./generators/student";
import { createTherapistReferral } from "./generators/therapist-referral";
import { createActiveWellnessConversation } from "./generators/wellness-conversation";
import type { TestScenario } from "./types";

// ============================================================================
// RE-EXPORT GENERATORS AND TYPES
// ============================================================================

export { createTestAlert } from "./generators/alert";
export {
  createHomeEmergencyContacts,
  createSchoolEmergencyContacts,
} from "./generators/emergency-contact";
export { createMoodCheckIn } from "./generators/mood-checkin";
export { createTestScreener } from "./generators/screener";
export { createTestSELScreener } from "./generators/sel-screener";
export { createTestStudent } from "./generators/student";
export { createTherapistReferral } from "./generators/therapist-referral";
export type { TestScenario } from "./types";

/**
 * Creates a complete test scenario
 */
export async function createTestScenario(
  db: ReturnType<typeof drizzle>,
  scenario: TestScenario,
  schoolId: string,
  counselorId: string,
  wellnessCoachId: string,
): Promise<void> {
  console.log(
    `Creating test scenario: ${scenario.student.firstName} ${scenario.student.lastName}`,
  );

  // Create student
  const studentId = await createTestStudent(db, scenario.student, schoolId);

  // Create home emergency contacts for this student
  await createHomeEmergencyContacts(db, studentId, scenario.student.lastName);

  // Create active wellness coach conversation (if specified)
  if (scenario.activeWellnessConversation) {
    await createActiveWellnessConversation(
      db,
      studentId,
      schoolId,
      wellnessCoachId,
      scenario.student.firstName,
      scenario.activeWellnessConversation,
    );
  }

  // Create mood check-ins (if specified)
  if (scenario.moodCheckIns) {
    for (const checkIn of scenario.moodCheckIns) {
      await createMoodCheckIn(
        db,
        studentId,
        checkIn.universalEmotion,
        checkIn.specificEmotion,
        checkIn.createdAt,
      );
    }
  }

  // Create SEL screeners (if specified)
  if (scenario.selScreeners) {
    for (const selConfig of scenario.selScreeners) {
      await createTestSELScreener(
        db,
        studentId,
        selConfig,
        scenario.student.age,
      );
    }
  }

  // Create alerts (and screeners if specified)
  for (const alertConfig of scenario.alerts) {
    let screenerId: string | undefined;

    // Create screener if specified
    if (alertConfig.screener) {
      screenerId = await createTestScreener(
        db,
        studentId,
        alertConfig.screener,
        scenario.student.age,
      );
    }

    // Create alert (only if specified - students can have screeners without alerts)
    if (alertConfig.alert) {
      await createTestAlert(
        db,
        studentId,
        alertConfig.alert,
        counselorId,
        wellnessCoachId,
        screenerId,
      );
    }
  }

  // Create therapist referral (if specified)
  if (scenario.therapistReferral) {
    await createTherapistReferral(
      db,
      studentId,
      counselorId,
      schoolId,
      scenario.therapistReferral,
    );
  }

  console.log(
    `✓ Created test scenario: ${scenario.student.firstName} ${scenario.student.lastName}`,
  );
}

/**
 * Main function to create all test scenarios
 */
export async function createTestScenarios(
  db: ReturnType<typeof drizzle>,
  scenarios: TestScenario[],
  schoolId: string,
  counselorId: string,
  wellnessCoachId: string,
): Promise<void> {
  console.log("\n=== Creating Test Scenarios ===\n");

  for (const scenario of scenarios) {
    await createTestScenario(
      db,
      scenario,
      schoolId,
      counselorId,
      wellnessCoachId,
    );
  }

  if (scenarios.length === 0) {
    console.log("No test scenarios defined yet");
  } else {
    console.log(`\n✓ Created ${scenarios.length} test scenarios`);
  }
}

/**
 * Creates test users for manual testing (counselor@psyflo.com and student@psyflo.com)
 * Returns their IDs to exclude from random seed data assignments
 */
export async function createTestUsers(
  db: ReturnType<typeof drizzle>,
  schoolId: string,
  supabaseAdminClient: any,
): Promise<{
  adminId: string;
  counselorId: string;
  studentId: string;
  wellnessCoachId: string;
}> {
  console.log("\n=== Creating Test Users ===\n");

  // Create admin@psyflo.com (platform admin)
  console.log("Creating admin@psyflo.com...");

  const { data: adminUser, error: adminCreateError } =
    await supabaseAdminClient.auth.admin.createUser({
      email: "admin@psyflo.com",
      password: "password",
      email_confirm: true,
      user_metadata: {
        first_name: "Admin",
        last_name: "Psyflo",
      },
    });

  if (adminCreateError || !adminUser.user) {
    throw adminCreateError || new Error("Failed to create admin user");
  }

  const adminUserId = adminUser.user.id;

  await db.insert(schema.profiles).values({
    id: adminUserId,
    dateOfBirth: null,
    grade: null,
    gender: null,
    pronouns: null,
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
    platformRole: "admin",
  });

  await db.insert(schema.userSchools).values({
    userId: adminUserId,
    schoolId: schoolId,
    role: "counselor",
  });

  await db.insert(schema.userSettings).values({
    id: adminUserId,
    timezone: "America/New_York",
  });

  console.log("✓ Created admin@psyflo.com");

  // Create counselor@psyflo.com
  console.log("Creating counselor@psyflo.com...");

  // Use Supabase auth admin API to create user (cleaner than raw SQL)
  const { data: counselorUser, error: counselorCreateError } =
    await supabaseAdminClient.auth.admin.createUser({
      email: "counselor@psyflo.com",
      password: "password",
      email_confirm: true,
      user_metadata: {
        first_name: "Counselor",
        last_name: "Psyflo",
      },
    });

  if (counselorCreateError || !counselorUser.user) {
    throw counselorCreateError || new Error("Failed to create counselor user");
  }

  const counselorUserId = counselorUser.user.id;

  await db.insert(schema.profiles).values({
    id: counselorUserId,
    dateOfBirth: null,
    grade: null,
    gender: null,
    pronouns: null,
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
  });

  await db.insert(schema.userSchools).values({
    userId: counselorUserId,
    schoolId: schoolId,
    role: "counselor",
  });

  await db.insert(schema.userSettings).values({
    id: counselorUserId,
    timezone: "America/New_York",
  });

  console.log("✓ Created counselor@psyflo.com");

  // Create student@psyflo.com
  console.log("Creating student@psyflo.com...");

  // Use Supabase auth admin API to create user (cleaner than raw SQL)
  const { data: studentUser, error: studentCreateError } =
    await supabaseAdminClient.auth.admin.createUser({
      email: "student@psyflo.com",
      password: "password",
      email_confirm: true,
      user_metadata: {
        first_name: "Student",
        last_name: "Psyflo",
      },
    });

  if (studentCreateError || !studentUser.user) {
    throw studentCreateError || new Error("Failed to create student user");
  }

  const studentUserId = studentUser.user.id;

  await db.insert(schema.profiles).values({
    id: studentUserId,
    dateOfBirth: "2009-01-01", // 16 years old
    grade: 10,
    gender: "non_binary",
    pronouns: "they/them",
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
  });

  await db.insert(schema.userSchools).values({
    userId: studentUserId,
    schoolId: schoolId,
    role: "student",
  });

  await db.insert(schema.userSettings).values({
    id: studentUserId,
    timezone: "America/New_York",
  });

  console.log("✓ Created student@psyflo.com");

  // Create PHQ-A and GAD-Child screeners for student
  console.log("Creating mental health screeners for student@psyflo.com...");

  const phqAQuestionSet = screenerQuestionSets.find(
    (qs) => qs.subtype === "phq_a" && 16 >= qs.minAge && 16 <= qs.maxAge,
  );

  if (phqAQuestionSet) {
    const phqAScreenerId = await db
      .insert(schema.screeners)
      .values({
        userId: studentUserId,
        age: 16,
        type: "phq_a",
      })
      .returning({ id: schema.screeners.id })
      .then((rows) => rows[0]?.id);

    if (phqAScreenerId) {
      const phqAMaxScore = phqAQuestionSet.questions.reduce(
        (sum, q) => sum + q.weight * Math.max(...q.options.map((o) => o.score)),
        0,
      );

      const phqASessionId = await db
        .insert(schema.screenerSessions)
        .values({
          screenerId: phqAScreenerId,
          startAt: new Date(Date.now() - 300000), // 5 minutes ago to ensure availability
          part: phqAQuestionSet.part,
          subtype: phqAQuestionSet.subtype,
          maxScore: phqAMaxScore,
        })
        .returning({ id: schema.screenerSessions.id })
        .then((rows) => rows[0]?.id);

      if (phqASessionId) {
        await db.insert(schema.screenerSessionResponses).values(
          phqAQuestionSet.questions.map((q, index) => ({
            ordinal: index + 1,
            sessionId: phqASessionId,
            questionCode: q.code,
            answerCode: null,
          })),
        );
        console.log("✓ Created PHQ-A screener");
      }
    }
  }

  const gadChildQuestionSet = screenerQuestionSets.find(
    (qs) => qs.subtype === "gad_child" && 16 >= qs.minAge && 16 <= qs.maxAge,
  );

  if (gadChildQuestionSet) {
    const gadChildScreenerId = await db
      .insert(schema.screeners)
      .values({
        userId: studentUserId,
        age: 16,
        type: "gad_child",
      })
      .returning({ id: schema.screeners.id })
      .then((rows) => rows[0]?.id);

    if (gadChildScreenerId) {
      const gadChildMaxScore = gadChildQuestionSet.questions.reduce(
        (sum, q) => sum + q.weight * Math.max(...q.options.map((o) => o.score)),
        0,
      );

      const gadChildSessionId = await db
        .insert(schema.screenerSessions)
        .values({
          screenerId: gadChildScreenerId,
          startAt: new Date(Date.now() - 300000), // 5 minutes ago to ensure availability
          part: gadChildQuestionSet.part,
          subtype: gadChildQuestionSet.subtype,
          maxScore: gadChildMaxScore,
        })
        .returning({ id: schema.screenerSessions.id })
        .then((rows) => rows[0]?.id);

      if (gadChildSessionId) {
        await db.insert(schema.screenerSessionResponses).values(
          gadChildQuestionSet.questions.map((q, index) => ({
            ordinal: index + 1,
            sessionId: gadChildSessionId,
            questionCode: q.code,
            answerCode: null,
          })),
        );
        console.log("✓ Created GAD-Child screener");
      }
    }
  }

  // Create wellness coach for Psyflo Academy (for active conversations)
  console.log("Creating wellness.coach@psyflo.com...");

  const { data: wellnessCoachUser, error: wellnessCoachCreateError } =
    await supabaseAdminClient.auth.admin.createUser({
      email: "wellness.coach@psyflo.com",
      password: "password",
      email_confirm: true,
      user_metadata: {
        first_name: "Coach",
        last_name: "Martinez",
      },
    });

  if (wellnessCoachCreateError || !wellnessCoachUser.user) {
    throw (
      wellnessCoachCreateError ||
      new Error("Failed to create wellness coach user")
    );
  }

  const wellnessCoachUserId = wellnessCoachUser.user.id;

  await db.insert(schema.profiles).values({
    id: wellnessCoachUserId,
    dateOfBirth: null,
    grade: null,
    gender: null,
    pronouns: null,
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
  });

  await db.insert(schema.userSchools).values({
    userId: wellnessCoachUserId,
    schoolId: schoolId,
    role: "wellness_coach",
  });

  await db.insert(schema.userSettings).values({
    id: wellnessCoachUserId,
    timezone: "America/New_York",
  });

  console.log("✓ Created wellness.coach@psyflo.com");

  // Create second wellness coach for Psyflo Academy
  console.log("Creating wellness.coach2@psyflo.com...");

  const { data: wellnessCoach2User, error: wellnessCoach2CreateError } =
    await supabaseAdminClient.auth.admin.createUser({
      email: "wellness.coach2@psyflo.com",
      password: "password",
      email_confirm: true,
      user_metadata: {
        first_name: "Jordan",
        last_name: "Lee",
      },
    });

  if (wellnessCoach2CreateError || !wellnessCoach2User.user) {
    throw (
      wellnessCoach2CreateError ||
      new Error("Failed to create second wellness coach user")
    );
  }

  const wellnessCoach2UserId = wellnessCoach2User.user.id;

  await db.insert(schema.profiles).values({
    id: wellnessCoach2UserId,
    dateOfBirth: null,
    grade: null,
    gender: null,
    pronouns: null,
    language: "english",
    ethnicity: null,
    onboardingCompletedAt: new Date(),
  });

  await db.insert(schema.userSchools).values({
    userId: wellnessCoach2UserId,
    schoolId: schoolId,
    role: "wellness_coach",
  });

  await db.insert(schema.userSettings).values({
    id: wellnessCoach2UserId,
    timezone: "America/New_York",
  });

  console.log("✓ Created wellness.coach2@psyflo.com");

  console.log("\n✓ Test users created successfully\n");

  return {
    adminId: adminUserId,
    counselorId: counselorUserId,
    studentId: studentUserId,
    wellnessCoachId: wellnessCoachUserId,
  };
}
