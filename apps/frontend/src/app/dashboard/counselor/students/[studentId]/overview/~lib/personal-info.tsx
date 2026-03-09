import { profiles, users } from "@feelwell/database";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { PersonalInfoClient } from "./personal-info-client";

export async function PersonalInformation({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  const record = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  if (!record) return null;

  const { user, profile } = record;
  const meta = user.rawUserMetaData as Record<string, string> | null;
  const fullName = getUserFullName(user);
  const firstName = meta?.["first_name"] ?? "";
  const lastName = meta?.["last_name"] ?? "";
  const email = user.email ?? "";
  const grade = profile.grade != null ? String(profile.grade) : "";
  const dateOfBirth = profile.dateOfBirth
    ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
    : "";
  const gender = profile.gender ?? "";
  const ethnicity = profile.ethnicity ?? "";
  const pronouns = profile.pronouns ?? "";
  const language = profile.language ?? "";
  const homeAddress = profile.homeAddress ?? "";

  return (
    <PersonalInfoClient
      studentId={studentId}
      initialData={{
        fullName,
        firstName,
        lastName,
        email,
        grade,
        dateOfBirth,
        gender,
        ethnicity,
        pronouns,
        language,
        homeAddress,
      }}
    />
  );
}
