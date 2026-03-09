import { userSchools } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import BottomTabNav from "./~lib/bottom-tab-nav";

/**
 * Student dashboard (including mood check-in) is only for students.
 * Counselors and wellness coaches must not see it—redirect to counselor dashboard.
 */
export default async function StudentLayout({
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <div className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</div>
      <BottomTabNav />
    </div>
  );
}
