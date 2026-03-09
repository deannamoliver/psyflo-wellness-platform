"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../~lib/update";
import { BirthdaySchema } from "./schema";

export async function updateBirthday(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: BirthdaySchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await updateProfile({
      dateOfBirth: submission.value.birthday,
    });
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Failed to update account information"],
    });
  }

  revalidatePath("/onboarding/student/profile/birthday");

  return submission.reply();
}
