"server-only";

import { userSchools } from "@feelwell/database";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { serverSupabase } from "@/lib/database/supabase";
import { stringOrNull } from "@/lib/string-utils";
import { serverDrizzle } from "../database/drizzle";

type UserInfo = User & {
  firstName: string | null;
  lastName: string | null;
};

export const getCurrentUserInfo = cache(
  async function getCurrentUserInfo(): Promise<UserInfo> {
    const supabase = await serverSupabase();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      notFound();
    }

    return {
      ...user,
      firstName: stringOrNull(user.user_metadata["first_name"]),
      lastName: stringOrNull(user.user_metadata["last_name"]),
    };
  },
);

export const getUserSchoolInfo = cache(async function getUserSchoolInfo(
  userId: string,
) {
  const db = await serverDrizzle();
  const userSchoolInfo = await db.admin.query.userSchools.findFirst({
    where: eq(userSchools.userId, userId),
  });

  return userSchoolInfo;
});

/**
 * Check if the current user has a @demo.com email domain
 * @returns true if user's email ends with @demo.com, false otherwise
 */
export async function isDemoUser(): Promise<boolean> {
  const userInfo = await getCurrentUserInfo();
  const demoEmails = ["deanna@psyflo.com"];
  return (
    demoEmails.includes(userInfo.email ?? "") ||
    (userInfo.email?.endsWith("@demo.com") ?? false)
  );
}
