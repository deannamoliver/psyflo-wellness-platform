import { profiles, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  PageContainer,
  PageContent,
} from "@/lib/extended-ui/page";
import { getUserFullName } from "@/lib/user/utils";
import { buildRTMPatients } from "../~lib/mock-data";
import PatientDetail from "../~lib/patient-detail";

export default async function PatientRTMPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const db = await serverDrizzle();

  const studentRecord = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, patientId))
    .limit(1)
    .then((res) => res[0]);

  if (!studentRecord) notFound();

  const realStudent = {
    id: studentRecord.user.id,
    name: getUserFullName(studentRecord.user),
  };

  const [patient] = buildRTMPatients([realStudent]);

  if (!patient) notFound();

  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <PatientDetail patient={patient} />
      </PageContent>
    </PageContainer>
  );
}
