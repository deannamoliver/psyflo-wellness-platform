"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { LearningStyleSchema } from "./schema";

export async function updateLearningStyle(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: LearningStyleSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      learningStyles: submission.value.learningStyle,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update learning style"],
    });
  }

  revalidatePath("/onboarding/student/profile/personal-goals");

  return submission.reply();
}
