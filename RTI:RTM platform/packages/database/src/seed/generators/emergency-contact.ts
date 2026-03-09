/**
 * Emergency contact generator
 *
 * Creates test emergency contacts for students (home contacts) and schools (school contacts)
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";

// Sample data for generating realistic emergency contacts
const firstNames = {
  male: [
    "Michael",
    "David",
    "James",
    "Robert",
    "John",
    "William",
    "Thomas",
    "Richard",
  ],
  female: [
    "Sarah",
    "Jennifer",
    "Lisa",
    "Maria",
    "Patricia",
    "Elizabeth",
    "Susan",
    "Karen",
  ],
};

const lastNamePrefixes = [
  "Johnson",
  "Williams",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
];

const homeRelations = [
  "Mother",
  "Father",
  "Guardian",
  "Stepmother",
  "Stepfather",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
];

/**
 * Generates a random phone number
 */
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

/**
 * Generates a random email address
 */
function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

/**
 * Creates home emergency contacts for a student
 * Generates 1-3 contacts: primary, backup_1, backup_2
 */
export async function createHomeEmergencyContacts(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  studentLastName: string,
): Promise<void> {
  // Create primary contact (usually a parent)
  const primaryGender = Math.random() > 0.5 ? "female" : "male";
  const primaryFirstName = firstNames[primaryGender][
    Math.floor(Math.random() * firstNames[primaryGender].length)
  ] as string;
  const primaryRelation = primaryGender === "female" ? "Mother" : "Father";

  await db.insert(schema.emergencyContacts).values({
    studentId,
    contactType: "home",
    name: `${primaryFirstName} ${studentLastName}`,
    relation: primaryRelation,
    tag: "primary",
    primaryPhone: generatePhoneNumber(),
    primaryEmail: generateEmail(primaryFirstName, studentLastName),
  });

  // 80% chance to have a backup contact
  if (Math.random() < 0.8) {
    const backupGender = primaryGender === "female" ? "male" : "female";
    const backupFirstName = firstNames[backupGender][
      Math.floor(Math.random() * firstNames[backupGender].length)
    ] as string;
    const backupRelation = backupGender === "female" ? "Mother" : "Father";

    await db.insert(schema.emergencyContacts).values({
      studentId,
      contactType: "home",
      name: `${backupFirstName} ${studentLastName}`,
      relation: backupRelation,
      tag: "backup_1",
      primaryPhone: generatePhoneNumber(),
      secondaryPhone: Math.random() > 0.5 ? generatePhoneNumber() : null,
      primaryEmail: generateEmail(backupFirstName, studentLastName),
    });
  }

  // 30% chance to have a second backup contact (grandparent/aunt/uncle)
  if (Math.random() < 0.3) {
    const otherRelations = homeRelations.filter(
      (r) => !["Mother", "Father"].includes(r),
    );
    const otherRelation = otherRelations[
      Math.floor(Math.random() * otherRelations.length)
    ] as string;
    const otherGender = ["Grandmother", "Aunt", "Stepmother"].includes(
      otherRelation,
    )
      ? "female"
      : "male";
    const otherFirstName = firstNames[otherGender][
      Math.floor(Math.random() * firstNames[otherGender].length)
    ] as string;
    const otherLastName = lastNamePrefixes[
      Math.floor(Math.random() * lastNamePrefixes.length)
    ] as string;

    await db.insert(schema.emergencyContacts).values({
      studentId,
      contactType: "home",
      name: `${otherFirstName} ${otherLastName}`,
      relation: otherRelation,
      tag: "backup_2",
      primaryPhone: generatePhoneNumber(),
      primaryEmail:
        Math.random() > 0.5
          ? generateEmail(otherFirstName, otherLastName)
          : null,
    });
  }
}

/**
 * Creates school emergency contacts for a school
 * These apply to ALL students at the school
 */
export async function createSchoolEmergencyContacts(
  db: ReturnType<typeof drizzle>,
  schoolId: string,
): Promise<void> {
  // Primary school contact - School Counselor
  const counselorGender = Math.random() > 0.5 ? "female" : "male";
  const counselorFirstName = firstNames[counselorGender][
    Math.floor(Math.random() * firstNames[counselorGender].length)
  ] as string;
  const counselorLastName = lastNamePrefixes[
    Math.floor(Math.random() * lastNamePrefixes.length)
  ] as string;

  await db.insert(schema.emergencyContacts).values({
    schoolId,
    contactType: "school",
    name: `${counselorFirstName} ${counselorLastName}`,
    relation: "School Counselor",
    tag: "primary",
    primaryPhone: generatePhoneNumber(),
    primaryEmail: `${counselorFirstName.toLowerCase()}.${counselorLastName.toLowerCase()}@school.edu`,
  });

  // Backup school contact - Principal or Vice Principal
  const principalGender = Math.random() > 0.5 ? "female" : "male";
  const principalFirstName = firstNames[principalGender][
    Math.floor(Math.random() * firstNames[principalGender].length)
  ] as string;
  const principalLastName = lastNamePrefixes[
    Math.floor(Math.random() * lastNamePrefixes.length)
  ] as string;
  const principalRole = Math.random() > 0.5 ? "Principal" : "Vice Principal";

  await db.insert(schema.emergencyContacts).values({
    schoolId,
    contactType: "school",
    name: `${principalFirstName} ${principalLastName}`,
    relation: principalRole,
    tag: "backup_1",
    primaryPhone: generatePhoneNumber(),
    secondaryPhone: generatePhoneNumber(), // Office phone
    primaryEmail: `${principalFirstName.toLowerCase()}.${principalLastName.toLowerCase()}@school.edu`,
  });

  // 50% chance for a second backup - School Nurse
  if (Math.random() > 0.5) {
    const nurseGender = Math.random() > 0.7 ? "male" : "female"; // Nurses more commonly female in data
    const nurseFirstName = firstNames[nurseGender][
      Math.floor(Math.random() * firstNames[nurseGender].length)
    ] as string;
    const nurseLastName = lastNamePrefixes[
      Math.floor(Math.random() * lastNamePrefixes.length)
    ] as string;

    await db.insert(schema.emergencyContacts).values({
      schoolId,
      contactType: "school",
      name: `${nurseFirstName} ${nurseLastName}`,
      relation: "School Nurse",
      tag: "backup_2",
      primaryPhone: generatePhoneNumber(),
      primaryEmail: `nurse.${nurseLastName.toLowerCase()}@school.edu`,
    });
  }
}
