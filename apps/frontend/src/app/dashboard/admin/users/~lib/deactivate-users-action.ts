"use server";

import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function deactivateUsers(userIds: string[]) {
  const db = await serverDrizzle();

  await Promise.all(
    userIds.map((id) =>
      db.admin
        .update(profiles)
        .set({ accountStatus: "archived" })
        .where(eq(profiles.id, id)),
    ),
  );

  revalidatePath("/dashboard/admin/users");
}
