"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { ArrowRight, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { Form } from "@/lib/extended-ui/form";
import { requestPasswordReset } from "./action";
import { ForgotPasswordSchema } from "./schema";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const [result, action, isPending] = useActionState(
    requestPasswordReset,
    null,
  );

  const [form, fields] = useForm({
    lastResult: result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: ForgotPasswordSchema }),
  });

  useEffect(() => {
    if (result?.status === "success") {
      toast.success("Check your email for reset instructions!");
      setEmailSent(true);
    }
    if (result?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to send reset email");
    }
  }, [result, form.errors]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-50 px-8 py-4">
        <span className="font-semibold text-primary text-xl">feelwell</span>
        <Link
          href="/contact"
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-primary"
        >
          Need help? <span className="text-primary">Contact us</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-8 pt-[12vh] pb-12">
        <div className="grid w-full max-w-6xl gap-16 lg:grid-cols-2">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-start">
            {/* Uh Oh Badge with sparkle */}
            <div className="relative mb-6 inline-flex w-fit items-center">
              <div className="rounded-full border border-gray-900 bg-white px-6 py-2.5">
                <span className="font-medium text-gray-700 text-xl">Uh Oh</span>
              </div>
              {/* Sparkle decoration */}
              <Image
                src="/images/sparkle-1.svg"
                alt=""
                width={24}
                height={24}
                className="-top-4 -right-5 absolute"
              />
            </div>

            {/* Heading */}
            <h1 className="mb-4 font-regular text-5xl text-gray-900 leading-tight tracking-tight md:text-6xl">
              Forgot Password?
            </h1>

            {/* Subtext */}
            <p className="mb-8 text-gray-400 text-xl">
              No worries, we&apos;ll send you reset instructions.
            </p>

            {emailSent ? (
              <div className="space-y-6">
                <div className="w-fit whitespace-nowrap rounded-md bg-green-50 p-4 text-green-700">
                  We&apos;ve sent password reset instructions to your email.
                  Please check your inbox.
                </div>
                <p className="text-gray-500 text-sm">
                  Didn&apos;t receive the email?{" "}
                  <button
                    type="button"
                    onClick={() => setEmailSent(false)}
                    className="text-primary hover:underline"
                  >
                    Try again
                  </button>
                </p>
                <p className="text-gray-500 text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </p>
              </div>
            ) : (
              <Form form={form} action={action} className="space-y-6">
                {form.errors && form.errors.length > 0 && (
                  <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                    {form.errors.join(", ")}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor={fields.email.id}
                    className="text-base text-gray-700"
                  >
                    Email or username
                  </Label>
                  <div className="relative">
                    <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                    <Input
                      id={fields.email.id}
                      name={fields.email.name}
                      type="email"
                      placeholder="Enter your school email address"
                      className="h-12 border-gray-100 pl-10 text-base shadow-none md:text-base"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-start">
                  <Button
                    type="submit"
                    className="flex h-14 min-w-[180px] items-center justify-center rounded-full bg-[#53B1FD] px-10 text-sm text-white shadow-lg hover:bg-[#53B1FD]/90"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Reset Password <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Back to Login Link */}
                <p className="text-gray-500 text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </Form>
            )}
          </div>

          {/* Right Side - Empty (for grid alignment) */}
          <div className="hidden lg:block" />
        </div>
      </main>

      {/* Footer - Same structure as signup for consistent spacing */}
      <footer className="relative z-10 px-8 py-4 text-gray-400 text-xs">
        <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2">
          <div className="hidden lg:block" />
          <div className="flex justify-center">
            <div className="w-full max-w-2xl text-center">&nbsp;</div>
          </div>
        </div>
      </footer>

      {/* Disgust Icon - Left edge at center of page */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-0">
        <Image
          src="/images/disgust-icon.svg"
          alt="Feelwell mascot"
          width={392}
          height={218}
          className="h-auto w-[300px] object-contain md:w-[392px]"
          priority
        />
      </div>
    </div>
  );
}
