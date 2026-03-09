"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { LanguageSchema } from "./schema";

export async function updateLanguage(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: LanguageSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      preferredLanguage: submission.value.language,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/language");

  return submission.reply();
}
