"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { serverSupabase } from "@/lib/database/supabase";
import { UpdatePasswordSchema } from "./schema";

export async function updatePassword(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: UpdatePasswordSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const supabase = await serverSupabase();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return submission.reply({
      formErrors: ["User not found"],
    });
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: submission.value.newPassword,
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  return submission.reply();
}
