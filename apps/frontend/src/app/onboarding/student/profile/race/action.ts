"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { RaceSchema } from "./schema";

export async function updateRace(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: RaceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      ethnicity: submission.value.ethnicity,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/race");

  return submission.reply();
}
