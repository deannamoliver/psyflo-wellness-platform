"use server";

import { moodCheckIns } from "@feelwell/database";
import { revalidatePath } from "next/cache";
import { canCheckIn } from "@/lib/check-in/server-utils";
import type { SpecificEmotion, UniversalEmotion } from "@/lib/check-in/utils";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function submitCheckIn({
  universalEmotion,
  specificEmotion,
}: {
  universalEmotion: UniversalEmotion;
  specificEmotion: SpecificEmotion;
}) {
  const db = await serverDrizzle();

  const { value, nextAvailableTime } = await canCheckIn();

  if (!value && nextAvailableTime) {
    throw new Error(
      `You've already checked in today. Please check back tomorrow at 6 AM.`,
    );
  }

  await db.admin.insert(moodCheckIns).values({
    userId: db.userId(),
    universalEmotion: universalEmotion,
    specificEmotion: specificEmotion,
  });

  revalidatePath("/dashboard/student/check-in");
}
