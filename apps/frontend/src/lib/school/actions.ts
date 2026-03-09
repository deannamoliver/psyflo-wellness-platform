"use server";

import { schoolDomains, schools } from "@feelwell/database";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isSchoolCounselor } from "../access-control/school";
import { serverDrizzle } from "../database/drizzle";
import { getCurrentUserInfo } from "../user/info";

/**
 * Gets school information for a given school ID
 */
export async function getSchoolInfo(schoolId: string) {
  const db = await serverDrizzle();

  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: {
        where: isNull(schoolDomains.deletedAt),
      },
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  return {
    id: school.id,
    name: school.name,
    address: school.address || "",
    email: school.email || "",
    domains: school.domains.map((d) => d.domain),
  };
}

/**
 * Updates school information (counselors only)
 */
export async function updateSchoolInfo(
  schoolId: string,
  data: {
    name: string;
    address: string;
    email: string;
  },
) {
  const user = await getCurrentUserInfo();

  // Check if user is an counselor at this school
  const isCounselor = await isSchoolCounselor(user.id, schoolId);

  if (!isCounselor) {
    throw new Error("Unauthorized: You must be an counselor at this school");
  }

  // Validate required fields
  if (!data.name.trim() || !data.address.trim() || !data.email.trim()) {
    throw new Error("All fields are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Invalid email format");
  }

  const db = await serverDrizzle();

  // Get school with domains to validate email
  const school = await db.admin.query.schools.findFirst({
    where: eq(schools.id, schoolId),
    with: {
      domains: true,
    },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Validate that contact email domain matches one of the school's domains
  const contactDomain = data.email.split("@")[1]?.toLowerCase();
  if (!contactDomain) {
    throw new Error("Invalid email format");
  }

  const activeDomains = school.domains
    .filter((d) => !d.deletedAt)
    .map((d) => d.domain.toLowerCase());

  if (!activeDomains.includes(contactDomain)) {
    throw new Error(
      `Contact email must be from one of the school's domains: ${activeDomains.join(", ")}`,
    );
  }

  const [updatedSchool] = await db.admin
    .update(schools)
    .set({
      name: data.name.trim(),
      address: data.address.trim(),
      email: data.email.toLowerCase().trim(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  revalidatePath("/dashboard/counselor/settings");

  return updatedSchool;
}
