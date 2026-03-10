"use server";

import {
  ethnicityEnum,
  genderEnum,
  languageEnum,
  profiles,
  pronounEnum,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, unauthorized } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";

const VALID_GENDERS = genderEnum.enumValues;
const VALID_PRONOUNS = pronounEnum.enumValues;
const VALID_LANGUAGES = languageEnum.enumValues;
const VALID_ETHNICITIES = ethnicityEnum.enumValues;

export type PersonalInfoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  pronouns: string;
  language: string;
  homeAddress: string;
};

export async function updateStudentPersonalInfo(
  studentId: string,
  data: PersonalInfoFormData,
) {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const counselorSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, counselorId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!counselorSchool) notFound();

  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  if (studentSchool?.schoolId !== counselorSchool.schoolId) unauthorized();

  const grade =
    data.grade.trim() === "" ? null : Number.parseInt(data.grade, 10);
  if (grade !== null && (Number.isNaN(grade) || grade < 1 || grade > 12)) {
    return { ok: false, error: "Grade must be between 1 and 12" };
  }

  const dateOfBirth =
    data.dateOfBirth.trim() === "" ? null : data.dateOfBirth.trim();
  const gender =
    data.gender &&
    VALID_GENDERS.includes(data.gender as (typeof VALID_GENDERS)[number])
      ? (data.gender as (typeof VALID_GENDERS)[number])
      : null;
  const pronouns =
    data.pronouns &&
    VALID_PRONOUNS.includes(data.pronouns as (typeof VALID_PRONOUNS)[number])
      ? (data.pronouns as (typeof VALID_PRONOUNS)[number])
      : null;
  const language =
    data.language &&
    VALID_LANGUAGES.includes(data.language as (typeof VALID_LANGUAGES)[number])
      ? (data.language as (typeof VALID_LANGUAGES)[number])
      : null;
  const ethnicity =
    data.ethnicity &&
    VALID_ETHNICITIES.includes(
      data.ethnicity as (typeof VALID_ETHNICITIES)[number],
    )
      ? (data.ethnicity as (typeof VALID_ETHNICITIES)[number])
      : null;

  const homeAddress = data.homeAddress.trim() || null;

  const phone = data.phone.trim() || null;

  await db.admin
    .update(profiles)
    .set({
      grade,
      dateOfBirth,
      gender,
      pronouns,
      language,
      ethnicity,
      homeAddress,
      phone,
    })
    .where(eq(profiles.id, studentId));

  const [currentUser] = await db.admin
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (currentUser) {
    const meta = (currentUser.rawUserMetaData as Record<string, unknown>) ?? {};
    await db.admin
      .update(users)
      .set({
        email: data.email.trim() || null,
        rawUserMetaData: {
          ...meta,
          first_name: data.firstName.trim() || undefined,
          last_name: data.lastName.trim() || undefined,
        },
      })
      .where(eq(users.id, studentId));
  }

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  revalidatePath(`/dashboard/counselor/students/${studentId}/overview`);
  return { ok: true };
}
