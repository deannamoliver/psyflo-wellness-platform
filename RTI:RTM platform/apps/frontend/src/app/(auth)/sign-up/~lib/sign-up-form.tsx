"use client";

import type { FieldMetadata, FormMetadata } from "@conform-to/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { Form } from "@/lib/extended-ui/form";

interface SignUpFormProps {
  form: FormMetadata<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  fields: {
    firstName: FieldMetadata<string>;
    lastName: FieldMetadata<string>;
    email: FieldMetadata<string>;
    password: FieldMetadata<string>;
    confirmPassword: FieldMetadata<string>;
  };
  action: (formData: FormData) => void;
  isPending: boolean;
}

export function SignUpForm({
  form,
  fields,
  action,
  isPending,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <h2 className="mb-8 text-center font-medium text-2xl text-gray-800">
        Sign up with feelwell
      </h2>

      <Form form={form} action={action} className="space-y-4">
        {form.errors && form.errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {form.errors.join(", ")}
          </div>
        )}

        {/* First Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor={fields.firstName.id}
            className="text-base text-gray-700"
          >
            First Name
          </Label>
          <div className="relative">
            <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <Input
              id={fields.firstName.id}
              name={fields.firstName.name}
              type="text"
              placeholder="Enter your first name"
              className="h-12 border-gray-100 pl-10 text-base shadow-none md:text-base"
            />
          </div>
        </div>

        {/* Last Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor={fields.lastName.id}
            className="text-base text-gray-700"
          >
            Last Name
          </Label>
          <div className="relative">
            <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <Input
              id={fields.lastName.id}
              name={fields.lastName.name}
              type="text"
              placeholder="Enter your last name"
              className="h-12 border-gray-100 pl-10 text-base shadow-none md:text-base"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor={fields.email.id} className="text-base text-gray-700">
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
          <p className="text-gray-400 text-xs">
            This allows us to add you to the right school
          </p>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor={fields.password.id}
            className="text-base text-gray-700"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <Input
              id={fields.password.id}
              name={fields.password.name}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 border-gray-100 pr-10 pl-10 text-base shadow-none md:text-base"
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

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor={fields.confirmPassword.id}
            className="text-base text-gray-700"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <Input
              id={fields.confirmPassword.id}
              name={fields.confirmPassword.name}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password again"
              className="h-12 border-gray-100 pr-10 pl-10 text-base shadow-none md:text-base"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="flex h-14 min-w-[140px] items-center justify-center rounded-full bg-[#53B1FD] px-10 text-sm text-white shadow-lg hover:bg-[#53B1FD]/90"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign up <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in.
          </Link>
        </p>

        {/* Help Text */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <HelpCircle className="h-4 w-4" />
          If you're having trouble logging in, please ask your teacher or
          counselor for assistance.
        </div>
      </Form>
    </>
  );
}
