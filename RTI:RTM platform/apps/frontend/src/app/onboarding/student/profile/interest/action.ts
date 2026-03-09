"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { InterestsSchema } from "./schema";

export async function updateInterests(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: InterestsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const selectedInterests = submission.value.interests;

    await updateProfile({
      interests: selectedInterests,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/learning-style");

  return submission.reply();
}
