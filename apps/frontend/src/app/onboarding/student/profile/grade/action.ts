"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { GradeSchema } from "./schema";

export async function updateGrade(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: GradeSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      grade: Number(submission.value.grade),
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/grade");

  return submission.reply();
}
