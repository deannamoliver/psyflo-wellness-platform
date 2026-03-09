"use server";

import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function archiveStudents(studentIds: string[]) {
  if (studentIds.length === 0) return;

  const db = await serverDrizzle();

  await Promise.all(
    studentIds.map((id) =>
      db.admin
        .update(profiles)
        .set({ accountStatus: "archived" })
        .where(eq(profiles.id, id)),
    ),
  );

  revalidatePath("/dashboard/admin/students");
}

export async function unarchiveStudents(studentIds: string[]) {
  if (studentIds.length === 0) return;

  const db = await serverDrizzle();

  await Promise.all(
    studentIds.map((id) =>
      db.admin
        .update(profiles)
        .set({ accountStatus: "active" })
        .where(eq(profiles.id, id)),
    ),
  );

  revalidatePath("/dashboard/admin/students");
}
