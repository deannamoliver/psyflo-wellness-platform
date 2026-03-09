import { users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { H3 } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { SessionsClient } from "../../../sessions/~lib/sessions-client";

export default async function StudentSessionsPage({
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
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <H3 className="font-semibold text-lg">Session Records</H3>
      <SessionsClient patientName={studentName} />
    </div>
  );
}
