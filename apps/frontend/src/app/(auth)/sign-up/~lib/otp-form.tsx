"use client";

import type { FieldMetadata, FormMetadata } from "@conform-to/react";
import { ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { Form } from "@/lib/extended-ui/form";
import { resendOTP } from "../action";

interface OTPFormProps {
  form: FormMetadata<{ email: string; token: string }>;
  fields: {
    email: FieldMetadata<string>;
    token: FieldMetadata<string>;
  };
  action: (formData: FormData) => void;
  email: string;
  isPending: boolean;
  onBack: () => void;
}

export function OTPForm({
  form,
  fields,
  action,
  email,
  isPending,
  onBack,
}: OTPFormProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendOTP = async () => {
    if (!email) return;
    setIsResending(true);
    const result = await resendOTP(email);
    if (result.success) {
      toast.success("Verification code resent!");
    } else {
      toast.error(result.error ?? "Failed to resend code");
    }
    setIsResending(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="mb-2 text-center font-medium text-2xl text-gray-800">
        Check your email
      </h2>
      <p className="mb-8 text-center text-gray-500 text-sm">
        We sent a verification code to{" "}
        <span className="font-medium text-gray-700">{email}</span>
      </p>

      <Form form={form} action={action} className="space-y-5">
        {form.errors && form.errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {form.errors.join(", ")}
          </div>
        )}

        {/* Hidden email field */}
        <input type="hidden" name="email" value={email} />

        {/* OTP Field */}
        <div className="space-y-2">
          <Label htmlFor={fields.token.id} className="text-gray-700">
            Verification Code
          </Label>
          <div className="relative">
            <Sparkles className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <Input
              id={fields.token.id}
              name={fields.token.name}
              type="text"
              placeholder="Enter 6-digit code"
              className="h-12 pl-10 text-center tracking-widest"
              maxLength={6}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-primary text-white hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              Verify email <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Resend Link */}
        <p className="text-center text-gray-500 text-sm">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        </p>

        {/* Back Link */}
        <p className="text-center text-gray-400 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-gray-600 hover:underline"
          >
            &larr; Back to sign up
          </button>
        </p>
      </Form>
    </>
  );
}
