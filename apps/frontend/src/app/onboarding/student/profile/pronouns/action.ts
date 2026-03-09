"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { PronounsSchema } from "./schema";

export async function updatePronouns(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: PronounsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      pronouns: submission.value.pronouns,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/pronouns");

  return submission.reply();
}
