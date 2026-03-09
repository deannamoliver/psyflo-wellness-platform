import { profiles, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { buildRTMPatients } from "@/app/dashboard/counselor/rtm/~lib/mock-data";
import PatientDetail from "@/app/dashboard/counselor/rtm/~lib/patient-detail";

export default async function TreatmentPlanPage({
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

  if (!studentRecord) notFound();

  const realStudent = {
    id: studentRecord.user.id,
    name: getUserFullName(studentRecord.user),
  };

  const [patient] = buildRTMPatients([realStudent]);

  if (!patient) notFound();

  return <PatientDetail patient={patient} showHeader={false} />;
}
