"use server";

import { profiles } from "@feelwell/database";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function archivePatients(ids: string[]) {
  if (ids.length === 0) return;
  const db = await serverDrizzle();
  await db.admin
    .update(profiles)
    .set({ accountStatus: "archived" })
    .where(inArray(profiles.id, ids));
  revalidatePath("/dashboard/admin/patients");
}

export async function unarchivePatients(ids: string[]) {
  if (ids.length === 0) return;
  const db = await serverDrizzle();
  await db.admin
    .update(profiles)
    .set({ accountStatus: "active" })
    .where(inArray(profiles.id, ids));
  revalidatePath("/dashboard/admin/patients");
}
