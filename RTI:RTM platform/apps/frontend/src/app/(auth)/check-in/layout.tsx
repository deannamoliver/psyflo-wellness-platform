import { userSchools } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { canCheckIn } from "@/lib/check-in/server-utils";
import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Mood check-in is only for students. Counselors and wellness coaches
 * should never see this page—redirect them to the counselor dashboard.
 * Students who have already checked in today skip straight to the dashboard.
 */
export default async function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await serverDrizzle();
  const userSchoolInfo = await db.admin.query.userSchools.findFirst({
    where: eq(userSchools.userId, db.userId()),
  });

  if (
    userSchoolInfo?.role === "counselor" ||
    userSchoolInfo?.role === "wellness_coach"
  ) {
    redirect("/dashboard/counselor");
  }

  const checkInStatus = await canCheckIn();
  if (!checkInStatus.value) {
    redirect("/dashboard/student/home");
  }

  return <>{children}</>;
}
