import { alerts, schools, userSchools } from "@feelwell/database";
import { and, countDistinct, eq, inArray, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { fmtUserName, getInitials } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import TopNav from "./top-nav";

function formatRole(role: string): string {
  switch (role) {
    case "wellness_coach":
      return "Therapist";
    case "counselor":
      return "Therapist";
    default:
      return "Provider";
  }
}

export default async function TopNavWrapper() {
  const db = await serverDrizzle();
  const userId = db.userId();
  const userInfo = await getCurrentUserInfo();

  // Get user's school info and role
  const userSchoolInfo = await db.admin
    .select({
      schoolId: userSchools.schoolId,
      schoolName: schools.name,
      role: userSchools.role,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        eq(userSchools.userId, userId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  const userName = fmtUserName(userInfo);
  const userInitials = getInitials(userName);
  const userEmail = userInfo.email;
  const userRole = formatRole(userSchoolInfo?.role ?? "counselor");

  // Get unresolved safety alert count - join with userSchools to filter by school
  let unreadAlertCount = 0;
  if (userSchoolInfo?.schoolId) {
    const result = await db.admin
      .select({ count: countDistinct(alerts.id) })
      .from(alerts)
      .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
      .where(
        and(
          eq(userSchools.schoolId, userSchoolInfo.schoolId),
          // Match same safety alert definition as home page stats
          or(
            eq(alerts.source, "coach"),
            and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
          ),
          inArray(alerts.status, ["new", "in_progress"]),
        ),
      )
      .then((res) => res[0]);
    unreadAlertCount = result?.count ?? 0;
  }

  return (
    <TopNav
      userName={userName}
      userRole={userRole}
      userInitials={userInitials}
      userEmail={userEmail}
      unreadAlertCount={unreadAlertCount}
    />
  );
}
