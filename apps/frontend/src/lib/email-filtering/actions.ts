"use server";

import {
  schoolAllowedEmails,
  schoolEmailFilterSettings,
  schools,
} from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isSchoolCounselor } from "../access-control/school";
import { serverDrizzle } from "../database/drizzle";
import { getCurrentUserInfo } from "../user/info";

/**
 * Gets the email filtering settings for a school
 */
export async function getEmailFilterSettings(
  schoolId: string,
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();

  const settings = await db.admin.query.schoolEmailFilterSettings.findFirst({
    where: eq(schoolEmailFilterSettings.schoolId, schoolId),
  });

  const allowedEmails = await db.admin.query.schoolAllowedEmails.findMany({
    where: and(
      eq(schoolAllowedEmails.schoolId, schoolId),
      eq(schoolAllowedEmails.role, role),
    ),
    orderBy: (emails, { asc }) => [asc(emails.email)],
  });

  return {
    studentFilteringEnabled: settings?.studentFilteringEnabled ?? false,
    emails: allowedEmails.map((e) => ({ id: e.id, email: e.email })),
  };
}

/**
 * Toggles student email filtering on/off for a school
 */
export async function toggleStudentEmailFiltering(
  schoolId: string,
  enabled: boolean,
) {
  const db = await serverDrizzle();
  const user = await getCurrentUserInfo();

  // Check if user is an counselor at this school
  const isCounselor = await isSchoolCounselor(user.id, schoolId);

  if (!isCounselor) {
    throw new Error("Unauthorized: You must be an counselor at this school");
  }

  await db.admin
    .insert(schoolEmailFilterSettings)
    .values({
      schoolId,
      studentFilteringEnabled: enabled,
    })
    .onConflictDoUpdate({
      target: [schoolEmailFilterSettings.schoolId],
      set: {
        studentFilteringEnabled: enabled,
      },
    });

  revalidatePath("/dashboard/counselor/settings");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Adds an allowed email to the school's whitelist
 */
export async function addAllowedEmail(
  schoolId: string,
  email: string,
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();
  const user = await getCurrentUserInfo();

  // Check if user is an counselor at this school
  const isCounselor = await isSchoolCounselor(user.id, schoolId);

  if (!isCounselor) {
    throw new Error("Unauthorized: You must be an counselor at this school");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Get school domain
  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: true,
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Verify email matches one of the school's domains
  const emailDomain = email.split("@")[1];
  const isValidDomain = school.domains.some((d) => d.domain === emailDomain);

  if (!isValidDomain) {
    throw new Error(
      `Email must be from one of the school's domains: ${school.domains.map((d) => d.domain).join(", ")}`,
    );
  }

  try {
    const [newEmail] = await db.admin
      .insert(schoolAllowedEmails)
      .values({
        schoolId,
        email: email.toLowerCase(),
        role,
      })
      .returning();

    if (!newEmail) {
      throw new Error("Failed to create email record");
    }

    revalidatePath("/dashboard/counselor/settings");
    revalidatePath("/admin");

    return { success: true, email: { id: newEmail.id, email: newEmail.email } };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Failed to create email record"
    ) {
      throw error;
    }
    throw new Error("This email is already in the allowed list for this role");
  }
}

/**
 * Removes an allowed email from the school's whitelist
 */
export async function removeAllowedEmail(emailId: string, schoolId: string) {
  const db = await serverDrizzle();
  const user = await getCurrentUserInfo();

  // Check if user is an counselor at this school
  const isCounselor = await isSchoolCounselor(user.id, schoolId);

  if (!isCounselor) {
    throw new Error("Unauthorized: You must be an counselor at this school");
  }

  await db.admin
    .delete(schoolAllowedEmails)
    .where(
      and(
        eq(schoolAllowedEmails.id, emailId),
        eq(schoolAllowedEmails.schoolId, schoolId),
      ),
    );

  revalidatePath("/dashboard/counselor/settings");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Bulk uploads allowed emails from CSV data
 */
export async function bulkUploadAllowedEmails(
  schoolId: string,
  emails: string[],
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();
  const user = await getCurrentUserInfo();

  // Check if user is an counselor at this school
  const isCounselor = await isSchoolCounselor(user.id, schoolId);

  if (!isCounselor) {
    throw new Error("Unauthorized: You must be an counselor at this school");
  }

  // Get school domain
  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: true,
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Validate and filter emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails: string[] = [];
  const invalidEmails: string[] = [];
  const wrongDomainEmails: string[] = [];

  for (const email of emails) {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) continue;

    if (!emailRegex.test(trimmedEmail)) {
      invalidEmails.push(email);
      continue;
    }

    const emailDomain = trimmedEmail.split("@")[1];
    const isValidDomain = school.domains.some((d) => d.domain === emailDomain);

    if (!isValidDomain) {
      wrongDomainEmails.push(email);
      continue;
    }

    validEmails.push(trimmedEmail);
  }

  // Insert valid emails (ignore duplicates)
  let insertedCount = 0;
  for (const email of validEmails) {
    try {
      await db.admin.insert(schoolAllowedEmails).values({
        schoolId,
        email,
        role,
      });
      insertedCount++;
    } catch {
      // Ignore duplicate errors
    }
  }

  revalidatePath("/dashboard/counselor/settings");
  revalidatePath("/admin");

  return {
    success: true,
    inserted: insertedCount,
    invalid: invalidEmails,
    wrongDomain: wrongDomainEmails,
    total: emails.length,
  };
}

/**
 * Admin-only: Get email filter settings for any school
 */
export async function adminGetEmailFilterSettings(
  schoolId: string,
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();

  const settings = await db.admin.query.schoolEmailFilterSettings.findFirst({
    where: eq(schoolEmailFilterSettings.schoolId, schoolId),
  });

  const allowedEmails = await db.admin.query.schoolAllowedEmails.findMany({
    where: and(
      eq(schoolAllowedEmails.schoolId, schoolId),
      eq(schoolAllowedEmails.role, role),
    ),
    orderBy: (emails, { asc }) => [asc(emails.email)],
  });

  return {
    studentFilteringEnabled: settings?.studentFilteringEnabled ?? false,
    emails: allowedEmails.map((e) => ({ id: e.id, email: e.email })),
  };
}

/**
 * Admin-only: Toggle student email filtering for any school
 */
export async function adminToggleStudentEmailFiltering(
  schoolId: string,
  enabled: boolean,
) {
  const db = await serverDrizzle();

  await db.admin
    .insert(schoolEmailFilterSettings)
    .values({
      schoolId,
      studentFilteringEnabled: enabled,
    })
    .onConflictDoUpdate({
      target: [schoolEmailFilterSettings.schoolId],
      set: {
        studentFilteringEnabled: enabled,
      },
    });

  revalidatePath("/admin");

  return { success: true };
}

/**
 * Admin-only: Add allowed email for any school
 */
export async function adminAddAllowedEmail(
  schoolId: string,
  email: string,
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Get school domain
  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: true,
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Verify email matches one of the school's domains
  const emailDomain = email.split("@")[1];
  const isValidDomain = school.domains.some((d) => d.domain === emailDomain);

  if (!isValidDomain) {
    throw new Error(
      `Email must be from one of the school's domains: ${school.domains.map((d) => d.domain).join(", ")}`,
    );
  }

  try {
    const [newEmail] = await db.admin
      .insert(schoolAllowedEmails)
      .values({
        schoolId,
        email: email.toLowerCase(),
        role,
      })
      .returning();

    if (!newEmail) {
      throw new Error("Failed to create email record");
    }

    revalidatePath("/admin");

    return { success: true, email: { id: newEmail.id, email: newEmail.email } };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Failed to create email record"
    ) {
      throw error;
    }
    throw new Error("This email is already in the allowed list for this role");
  }
}

/**
 * Admin-only: Remove allowed email for any school
 */
export async function adminRemoveAllowedEmail(emailId: string) {
  const db = await serverDrizzle();

  await db.admin
    .delete(schoolAllowedEmails)
    .where(eq(schoolAllowedEmails.id, emailId));

  revalidatePath("/admin");

  return { success: true };
}

/**
 * Admin-only: Bulk upload allowed emails for any school
 */
export async function adminBulkUploadAllowedEmails(
  schoolId: string,
  emails: string[],
  role: "student" | "counselor",
) {
  const db = await serverDrizzle();

  // Get school domain
  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: true,
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Validate and filter emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails: string[] = [];
  const invalidEmails: string[] = [];
  const wrongDomainEmails: string[] = [];

  for (const email of emails) {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) continue;

    if (!emailRegex.test(trimmedEmail)) {
      invalidEmails.push(email);
      continue;
    }

    const emailDomain = trimmedEmail.split("@")[1];
    const isValidDomain = school.domains.some((d) => d.domain === emailDomain);

    if (!isValidDomain) {
      wrongDomainEmails.push(email);
      continue;
    }

    validEmails.push(trimmedEmail);
  }

  // Insert valid emails (ignore duplicates)
  let insertedCount = 0;
  for (const email of validEmails) {
    try {
      await db.admin.insert(schoolAllowedEmails).values({
        schoolId,
        email,
        role,
      });
      insertedCount++;
    } catch {
      // Ignore duplicate errors
    }
  }

  revalidatePath("/admin");

  return {
    success: true,
    inserted: insertedCount,
    invalid: invalidEmails,
    wrongDomain: wrongDomainEmails,
    total: emails.length,
  };
}
