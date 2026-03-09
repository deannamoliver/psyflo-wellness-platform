import { userSchools } from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { serverDrizzle } from "../database/drizzle";

/**
 * Checks if a user is a student at a specific school.
 *
 * @param userId - The ID of the user to check
 * @param schoolId - The ID of the school to verify membership for
 * @returns Promise<boolean> - True if the user is a student at the specified school, false otherwise
 */
export const isSchoolStudent = cache(async function isSchoolStudent(
  userId: string,
  schoolId: string,
) {
  const db = await serverDrizzle();
  const userSchoolInfo = await db.admin.query.userSchools.findFirst({
    where: and(
      eq(userSchools.userId, userId),
      eq(userSchools.schoolId, schoolId),
      eq(userSchools.role, "student"),
    ),
  });

  return !!userSchoolInfo;
});

/**
 * Checks if a user is an counselor at a specific school.
 *
 * @param userId - The ID of the user to check
 * @param schoolId - The ID of the school to verify membership for
 * @returns Promise<boolean> - True if the user is an counselor at the specified school, false otherwise
 */
export const isSchoolCounselor = cache(async function isSchoolCounselor(
  userId: string,
  schoolId: string,
) {
  const db = await serverDrizzle();
  const userSchoolInfo = await db.admin.query.userSchools.findFirst({
    where: and(
      eq(userSchools.userId, userId),
      eq(userSchools.schoolId, schoolId),
      eq(userSchools.role, "counselor"),
    ),
  });

  return !!userSchoolInfo;
});
