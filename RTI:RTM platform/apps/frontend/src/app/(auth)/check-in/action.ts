"use server";

import { moodCheckIns } from "@feelwell/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SpecificEmotion, UniversalEmotion } from "@/lib/check-in/utils";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function submitCheckIn({
  universalEmotion,
  specificEmotion,
}: {
  universalEmotion: string;
  specificEmotion: string;
}) {
  const db = await serverDrizzle();

  await db.admin.insert(moodCheckIns).values({
    userId: db.userId(),
    universalEmotion: universalEmotion as UniversalEmotion,
    specificEmotion: specificEmotion as SpecificEmotion,
  });

  // Revalidate paths that depend on check-in status
  revalidatePath("/dashboard/student/home");
  revalidatePath("/check-in");

  // Redirect to home page - this happens after the database write is complete
  redirect("/dashboard/student/home");
}
