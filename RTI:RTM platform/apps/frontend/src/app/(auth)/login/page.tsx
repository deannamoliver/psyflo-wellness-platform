"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import {
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { Form, useFormPersist } from "@/lib/extended-ui/form";
import { login } from "./action";
import { LoginSchema } from "./schema";

export default function LoginPage() {
  const [lastResult, action, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, fields] = useForm({
    lastResult: lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: LoginSchema }),
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Welcome back!");
      const redirectTo =
        (lastResult as { redirectTo?: string }).redirectTo ?? "/welcome";
      window.location.href = redirectTo;
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to sign in");
    }
  }, [lastResult, form.errors]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
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
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="grid w-full max-w-6xl gap-16 lg:grid-cols-2">
          {/* Left Side - Welcome */}
          <div className="flex flex-col justify-start">
            {/* Welcome Badge */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-gray-700 text-sm">Welcome Back</span>
              <span className="text-lg text-primary">✨</span>
            </div>

            {/* Heading */}
            <h1 className="mb-6 font-semibold text-4xl text-gray-800 leading-tight md:text-5xl">
              Good to see
              <br />
              you again!
            </h1>

            {/* Subtext */}
            <p className="mb-8 text-gray-500 text-lg">
              Log in to continue your journey.
              <br />
              Your safe space is waiting for you.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Lock className="h-4 w-4 text-primary" />
                Your data protected
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-start justify-center">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <h2 className="mb-8 text-center font-medium text-2xl text-gray-800">
                Sign in to feelwell
              </h2>

              <Form form={form} action={action} className="space-y-5">
                {form.errors && form.errors.length > 0 && (
                  <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                    {form.errors.join(", ")}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor={fields.email.id} className="text-gray-700">
                    Email or username
                  </Label>
                  <div className="relative">
                    <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                    <Input
                      id={fields.email.id}
                      name={fields.email.name}
                      type="email"
                      placeholder="Enter your school email address"
                      className="h-12 pl-10"
                    />
                  </div>
                  <p className="text-gray-400 text-xs">
                    This allows us to add you to the right school
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={fields.password.id}
                      className="text-gray-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-primary text-sm hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                    <Input
                      id={fields.password.id}
                      name={fields.password.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-12 pr-10 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-gray-600 text-sm">
                    Remember me
                  </Label>
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
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-gray-500 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:underline"
                  >
                    Sign up here.
                  </Link>
                </p>

                {/* Help Text */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <HelpCircle className="h-4 w-4" />
                  If you&apos;re having trouble logging in, please ask your
                  teacher or counselor for assistance.
                </div>
              </Form>
            </div>
          </div>
        </div>
      </main>

      {/* Mascot - Fixed at bottom left, bottom half cut off */}
      <div className="-bottom-64 pointer-events-none fixed left-8 z-10">
        <Image
          src="/images/mascot-happy.png"
          alt="Feelwell mascot"
          width={512}
          height={512}
          className="object-contain"
        />
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-gray-400 text-xs">
        By continuing you agree to our
        <Link
          href="/terms-and-conditions"
          className="text-primary hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and confirm that you have read our&apos;s{" "}
        <Link href="/privacy-policy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}
