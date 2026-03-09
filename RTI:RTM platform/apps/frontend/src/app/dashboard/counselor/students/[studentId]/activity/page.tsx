import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { isSchoolStudent } from "@/lib/access-control/school";
import { H4 } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserSchoolInfo } from "@/lib/user/info";
import { ActivityCards } from "./~lib/activity/cards";
import { Stats } from "./~lib/stats";

async function checkAccess(studentId: string) {
  const db = await serverDrizzle();
  const counselorSchool = await getUserSchoolInfo(db.userId());
  if (!counselorSchool) {
    return false;
  }
  return await isSchoolStudent(studentId, counselorSchool.schoolId);
}

export default async function StudentOverviewPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const hasAccess = await checkAccess(studentId);
  if (!hasAccess) {
    unauthorized();
  }

  return (
    <div>
      <Stats studentId={studentId} />
      <div className="flex gap-6">
        <div className="flex-1">
          <H4 className="mt-8 mb-4 font-normal text-lg">Recent Activities</H4>
          <Suspense>
            <ActivityCards studentId={studentId} />
          </Suspense>
        </div>

        {/* Hidden for now - may be useful later */}
        {/* <div className="flex-1">
          <H4 className="mt-8 mb-4 font-normal text-lg">Alert History</H4>
          <Suspense>
            <AlertCards studentId={studentId} />
          </Suspense>
        </div> */}
      </div>
    </div>
  );
}
