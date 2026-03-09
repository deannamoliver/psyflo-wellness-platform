"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { serverSupabase } from "@/lib/database/supabase";
import { OTPSchema, SignUpSchema } from "./schema";

export async function signUp(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: SignUpSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const supabase = await serverSupabase();

  const { error } = await supabase.auth.signUp({
    email: submission.value.email,
    password: submission.value.password,
    options: {
      data: {
        first_name: submission.value.firstName,
        last_name: submission.value.lastName,
      },
    },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  return submission.reply();
}

export async function verifyOTP(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: OTPSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const supabase = await serverSupabase();

  const { error } = await supabase.auth.verifyOtp({
    email: submission.value.email,
    token: submission.value.token,
    type: "email",
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  return submission.reply();
}

export async function resendOTP(email: string) {
  const supabase = await serverSupabase();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
