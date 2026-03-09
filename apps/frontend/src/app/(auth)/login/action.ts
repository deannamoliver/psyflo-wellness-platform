"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { profiles, userSchools } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import { LoginSchema } from "./schema";

export async function login(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: LoginSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const supabase = await serverSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: submission.value.email,
    password: submission.value.password,
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  // Determine redirect based on roles stored in the database:
  //   - userSchools.role  → counselor | wellness_coach | student
  //   - profiles.platformRole → admin | clinical_supervisor | user
  let redirectTo = "/check-in";
  if (data.user) {
    const db = await serverDrizzle();

    const [userSchoolInfo, profile] = await Promise.all([
      db.admin.query.userSchools.findFirst({
        where: eq(userSchools.userId, data.user.id),
      }),
      db.admin.query.profiles.findFirst({
        where: eq(profiles.id, data.user.id),
      }),
    ]);

    if (profile?.platformRole === "admin") {
      redirectTo = "/dashboard/admin";
    } else if (
      userSchoolInfo?.role === "counselor" ||
      userSchoolInfo?.role === "wellness_coach"
    ) {
      redirectTo = "/dashboard/counselor";
    } else {
      // Student: ensure onboarding done, then /check-in (mood check-in gate)
      if (!profile?.onboardingCompletedAt) {
        redirectTo = "/welcome";
      }
      // If onboarding is complete, redirectTo stays as "/check-in"
    }
  }

  return { ...submission.reply(), redirectTo };
}
