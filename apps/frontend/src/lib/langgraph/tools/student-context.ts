import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function getStudentBirthday(
  userId: string,
): Promise<string | null> {
  const db = await serverDrizzle();

  const student = await db.admin.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: {
      dateOfBirth: true,
    },
  });

  return student?.dateOfBirth ?? null;
}
