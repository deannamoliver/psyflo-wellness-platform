import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import SettingsClient from "../../student/settings/~lib/settings-client";

export default async function SettingsPage() {
  const db = await serverDrizzle();
  const supabase = await serverSupabase();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const profile = await db.rls(async (tx) => {
    return tx.query.profiles.findFirst();
  });

  // Compute age from date of birth
  let age: number | null = null;
  if (profile?.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }

  const userInfo = {
    firstName: user.user.user_metadata["first_name"] ?? "",
    lastName: user.user.user_metadata["last_name"] ?? "",
    email: user.user.email ?? "",
    age: age !== null ? age.toString() : null,
    dateOfBirth: profile?.dateOfBirth ?? null,
  };

  return <SettingsClient userInfo={userInfo} basePath="/dashboard/counselor" />;
}
