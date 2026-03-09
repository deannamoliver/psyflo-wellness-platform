"use server";

import { profiles } from "@feelwell/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function completeOnboarding() {
  const db = await serverDrizzle();

  await db.rls(async (tx) =>
    tx
      .insert(profiles)
      .values({
        id: db.userId(),
        onboardingCompletedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [profiles.id],
        set: {
          onboardingCompletedAt: new Date(),
        },
      }),
  );

  revalidatePath("/dashboard");
  redirect("/check-in");
}
