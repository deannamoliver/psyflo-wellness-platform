import { profiles, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { PatientReport } from "./~lib/patient-report";

export default async function StudentReportsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const db = await serverDrizzle();

  const studentRecord = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  const patientName = studentRecord ? getUserFullName(studentRecord.user) : undefined;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PatientReport patientName={patientName} />
    </div>
  );
}
