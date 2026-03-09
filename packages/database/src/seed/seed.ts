import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/bun-sql";
import { reset } from "drizzle-seed";
import * as schema from "../schema";
import {
  createSchoolEmergencyContacts,
  createTestScenarios,
  createTestUsers,
} from "./helpers";
import { allScenarios } from "./scenarios";
import { formatValidationErrors, validateScenario } from "./validators";

const supabase = createClient(
  process.env["SUPABASE_API_URL"] as string,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] as string,
);

async function confirmAction(): Promise<boolean> {
  console.log("⚠️  This will DELETE all existing data and reseed the database.");
  console.log("This action cannot be undone!\n");

  process.stdout.write("Are you sure you want to continue? (yes/no): ");

  const input = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });

  return input.toLowerCase() === "yes" || input.toLowerCase() === "y";
}

async function main() {
  const db = drizzle({
    connection: process.env["SUPABASE_PG_URL"] as string,
    casing: "snake_case",
  });

  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log("Seeding cancelled.");
    process.exit(0);
  }

  try {
    console.log("Clearing existing data...");

    await reset(db, schema);

    // Clear auth tables manually since reset() doesn't handle auth schema
    await db.execute("DELETE FROM auth.identities");
    await db.execute("DELETE FROM auth.users");

    // Create schools
    console.log("Creating schools...");
    const schools = await db
      .insert(schema.schools)
      .values([
        {
          name: "Lincoln High School",
          address: "123 School St",
          email: "info@lincoln.edu",
        },
        {
          name: "Washington Elementary",
          address: "456 Education Ave",
          email: "contact@washington.edu",
        },
        {
          name: "Roosevelt Middle School",
          address: "789 Learning Blvd",
          email: "admin@roosevelt.edu",
        },
        {
          name: "Psyflo Academy",
          address: "100 Wellness Way",
          email: "info@psyflo.com",
        },
      ])
      .returning({ id: schema.schools.id, name: schema.schools.name });

    console.log(`✓ Created ${schools.length} schools`);

    // Get Psyflo Academy school
    const psyfloSchool = schools.find((s) => s.name === "Psyflo Academy");

    if (!psyfloSchool) {
      throw new Error("Psyflo Academy not found");
    }

    // Create school domains
    console.log("Creating school domains...");
    const [lincoln, washington, roosevelt] = schools;
    if (!lincoln || !washington || !roosevelt) {
      throw new Error("Failed to create all schools");
    }
    await db.insert(schema.schoolDomains).values([
      { schoolId: lincoln.id, domain: "lincoln.edu" },
      { schoolId: washington.id, domain: "washington.edu" },
      { schoolId: roosevelt.id, domain: "roosevelt.edu" },
      { schoolId: psyfloSchool.id, domain: "psyflo.com" },
    ]);
    console.log("✓ Created school domains");

    // Create school emergency contacts (these apply to ALL students at each school)
    console.log("Creating school emergency contacts...");
    for (const school of schools) {
      await createSchoolEmergencyContacts(db, school.id);
    }
    console.log(
      `✓ Created school emergency contacts for ${schools.length} schools`,
    );

    // Create test users (admin, counselor, student, wellness coach)
    const {
      counselorId: counselorUserId,
      wellnessCoachId: wellnessCoachUserId,
    } = await createTestUsers(db, psyfloSchool.id, supabase);

    console.log(
      `✓ Created test users: admin@psyflo.com, counselor@psyflo.com, student@psyflo.com, wellness.coach@psyflo.com, wellness.coach2@psyflo.com`,
    );

    // Validate all scenarios before creating them
    console.log(`\n=== Validating ${allScenarios.length} scenarios ===\n`);
    let hasValidationErrors = false;

    for (const scenario of allScenarios) {
      const result = validateScenario(scenario);
      if (!result.valid) {
        hasValidationErrors = true;
        console.error(
          formatValidationErrors(
            `${scenario.student.firstName} ${scenario.student.lastName}`,
            result.errors,
          ),
        );
      }
    }

    if (hasValidationErrors) {
      throw new Error(
        "❌ Scenario validation failed. Please fix the errors above before seeding.",
      );
    }

    console.log(`✓ All ${allScenarios.length} scenarios are valid\n`);

    // Create all test scenarios
    await createTestScenarios(
      db,
      allScenarios,
      psyfloSchool.id,
      counselorUserId,
      wellnessCoachUserId,
    );

    console.log(
      `\n✓ Seeding complete! Created ${schools.length} schools and ${allScenarios.length} test scenarios.`,
    );
    console.log("All test users have password: password");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
