import { profiles, userSchools } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";

export default async function DashboardPage() {
  const db = await serverDrizzle();
  const userId = db.userId();

  const [userSchoolInfo, profile] = await Promise.all([
    db.admin.query.userSchools.findFirst({
      where: eq(userSchools.userId, userId),
    }),
    db.admin.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    }),
  ]);

  // Platform admin → admin dashboard (check first, admin may also have a school role)
  if (profile?.platformRole === "admin") {
    redirect("/dashboard/admin");
  }

  // Counselor / wellness coach → counselor dashboard
  if (
    userSchoolInfo?.role === "counselor" ||
    userSchoolInfo?.role === "wellness_coach"
  ) {
    redirect("/dashboard/counselor");
  }

  // Student: onboarding guard
  if (!profile?.onboardingCompletedAt) {
    redirect("/welcome");
  }

  redirect("/dashboard/student");
}
