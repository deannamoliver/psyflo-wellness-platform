import { profiles, userSchools, users } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { getUserFullName } from "@/lib/user/utils";
import BillingDashboard from "./~lib/billing-dashboard";

export default async function RTMPage() {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const counselorSchoolId = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, counselorId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]?.schoolId);

  const studentRows = counselorSchoolId
    ? await db.admin
        .select({ user: users, profile: profiles })
        .from(profiles)
        .innerJoin(userSchools, eq(profiles.id, userSchools.userId))
        .innerJoin(users, eq(profiles.id, users.id))
        .where(
          and(
            eq(userSchools.schoolId, counselorSchoolId),
            eq(userSchools.role, "student"),
          ),
        )
    : [];

  const realStudents = studentRows.map(({ user }) => ({
    id: user.id,
    name: getUserFullName(user),
  }));

  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Billing</PageTitle>
          <PageSubtitle>
            Track remote therapeutic monitoring data collection, clinician time,
            and billing eligibility across all patients.
          </PageSubtitle>
        </div>
        <BillingDashboard realStudents={realStudents} />
      </PageContent>
    </PageContainer>
  );
}
