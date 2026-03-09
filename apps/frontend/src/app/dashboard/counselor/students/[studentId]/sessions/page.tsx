import { users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { CommunicationsClient } from "./~lib/communications-client";

export default async function StudentCommunicationsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const db = await serverDrizzle();

  const studentRecord = await db.admin
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  const studentName = studentRecord ? getUserFullName(studentRecord) : undefined;

  return (
    <div className="flex flex-col gap-4 pt-2 font-dm">
      <CommunicationsClient patientName={studentName} />
    </div>
  );
}
