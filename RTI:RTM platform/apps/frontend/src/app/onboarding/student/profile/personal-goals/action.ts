"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { PersonalGoalsSchema } from "./schema";

export async function updatePersonalGoals(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: PersonalGoalsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      goals: submission.value.personalGoals,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update personal goals"],
    });
  }

  revalidatePath("/onboarding/student/profile/grade");

  return submission.reply();
}
