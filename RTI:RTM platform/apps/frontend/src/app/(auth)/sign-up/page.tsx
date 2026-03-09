"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useFormPersist } from "@/lib/extended-ui/form";
import { OTPForm } from "./~lib/otp-form";
import { SignUpForm } from "./~lib/sign-up-form";
import { signUp, verifyOTP } from "./action";
import { OTPSchema, SignUpSchema } from "./schema";

export default function SignUpPage() {
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [email, setEmail] = useState("");

  // Sign up form
  const [signUpResult, signUpAction, isSignUpPending] = useActionState(
    signUp,
    null,
  );
  const [signUpForm, signUpFields] = useForm({
    lastResult: signUpResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: SignUpSchema }),
  });

  useFormPersist(signUpForm);

  // OTP form
  const [otpResult, otpAction, isOtpPending] = useActionState(verifyOTP, null);
  const [otpForm, otpFields] = useForm({
    lastResult: otpResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: OTPSchema }),
  });

  useEffect(() => {
    if (signUpResult?.status === "success") {
      toast.success("Check your email for a verification code!");
      setStep("otp");
    }
    if (signUpResult?.status === "error") {
      toast.error(signUpForm.errors?.join(", ") ?? "Failed to sign up");
    }
  }, [signUpResult, signUpForm.errors]);

  useEffect(() => {
    if (otpResult?.status === "success") {
      toast.success("Email verified! Welcome to feelwell!");
      window.location.href = "/welcome";
    }
    if (otpResult?.status === "error") {
      toast.error(otpForm.errors?.join(", ") ?? "Invalid verification code");
    }
  }, [otpResult, otpForm.errors]);

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
      <main className="relative z-10 flex flex-1 items-center justify-center px-8 py-12">
        <div className="grid w-full max-w-6xl gap-16 lg:grid-cols-2">
          {/* Left Side - Welcome */}
          <div className="relative flex flex-col justify-start pt-8">
            {/* Hello Badge with sparkle */}
            <div className="relative mb-6 inline-flex w-fit items-center">
              <div className="rounded-full border border-gray-900 bg-white px-6 py-2.5">
                <span className="font-medium text-gray-700 text-xl">
                  Hello!
                </span>
              </div>
              {/* Sparkle decoration - using sparkle-1.svg */}
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
              Let&apos;s create your
              <br />
              account
            </h1>

            {/* Subtext */}
            <p className="mb-8 text-gray-400 text-xl">
              Your safe space is waiting for you.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Image
                  src="/images/lock.svg"
                  alt=""
                  width={13}
                  height={14}
                  className="h-4 w-auto"
                />
                Secure & Private
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Image
                  src="/images/shield.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="h-4 w-auto"
                />
                Your data protected
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex items-start justify-center">
            <div className="w-full max-w-5xl rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-xs">
              {step === "signup" ? (
                <SignUpForm
                  form={signUpForm}
                  fields={signUpFields}
                  action={(formData) => {
                    setEmail(formData.get("email") as string);
                    signUpAction(formData);
                  }}
                  isPending={isSignUpPending}
                />
              ) : (
                <OTPForm
                  form={otpForm}
                  fields={otpFields}
                  action={otpAction}
                  email={email}
                  isPending={isOtpPending}
                  onBack={() => setStep("signup")}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mini Soli - Centered between left edge and signup box */}
      <div className="lg:-translate-x-1/2 pointer-events-none absolute bottom-0 left-0 z-0 flex w-full justify-center lg:left-[25%] lg:w-auto lg:justify-start">
        <Image
          src="/images/mini-soli.svg"
          alt="Feelwell mascot"
          width={812}
          height={406}
          className="h-auto w-auto max-w-[400px] object-contain md:max-w-[500px]"
          priority
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-4 text-gray-400 text-xs">
        <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2">
          <div className="hidden lg:block" />
          <div className="flex justify-center">
            <div className="w-full max-w-2xl text-center">
              By continuing you agree to our{" "}
              <Link
                href="/terms-and-conditions"
                className="text-gray-400 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and confirm that you have read our{" "}
              <Link
                href="/privacy-policy"
                className="text-gray-400 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
