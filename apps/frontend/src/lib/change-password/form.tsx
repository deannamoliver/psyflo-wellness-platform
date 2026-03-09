"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { CheckIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { H3, Small } from "@/lib/core-ui/typography";
import { Form, FormInput, useFormPersist } from "@/lib/extended-ui/form";
import { updatePassword } from "./action";
import { UpdatePasswordSchema } from "./schema";

export default function ChangePasswordForm({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updatePassword, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: UpdatePasswordSchema }),
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Password updated");
      router.push(redirectTo ?? "/dashboard");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update password");
    }
  }, [lastResult, router, form.errors, redirectTo]);

  return (
    <Form
      form={form}
      action={action}
      className="space-y-6 rounded-2xl bg-white/40 p-6"
    >
      <div className="text-accent">
        <H3>Choose New Password</H3>
        <Small>Enter a strong password to protect your account</Small>
      </div>
      <div className="space-y-4">
        <FormInput
          field={fields.newPassword}
          label="New Password"
          type="password"
          placeholder="Enter your new password"
        />
        <FormInput
          field={fields.confirmPassword}
          label="Confirm Password"
          type="password"
          placeholder="Confirm your new password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        <CheckIcon /> Change Password
      </Button>
    </Form>
  );
}
