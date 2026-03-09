"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { serverSupabase } from "@/lib/database/supabase";
import { ForgotPasswordSchema } from "./schema";

export async function requestPasswordReset(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: ForgotPasswordSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const supabase = await serverSupabase();

  const { error } = await supabase.auth.resetPasswordForEmail(
    submission.value.email,
    {
      redirectTo: `${process.env["NEXT_PUBLIC_SITE_URL"]}/reset-password`,
    },
  );

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  return submission.reply();
}
