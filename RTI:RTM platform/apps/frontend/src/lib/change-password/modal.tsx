"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { updatePassword } from "./action";
import { LockIcon } from "./lock-icon";
import {
  getPasswordStrength,
  getStrengthLevel,
  UpdatePasswordSchema,
} from "./schema";

type ChangePasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [lastResult, action, isPending] = useActionState(updatePassword, null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: UpdatePasswordSchema }),
  });

  const strength = getPasswordStrength(newPasswordValue);
  const strengthLevel = getStrengthLevel(strength);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Password updated successfully");
      onOpenChange(false);
      setNewPasswordValue("");
    }
    if (lastResult?.status === "error" && form.errors?.length) {
      toast.error(form.errors.join(", "));
    }
  }, [lastResult, form.errors, onOpenChange]);

  const getStrengthLabel = () => {
    if (!newPasswordValue) return "Not entered";
    if (strengthLevel === 4) return "Strong";
    if (strengthLevel >= 2) return "Medium";
    return "Weak";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="flex-row items-start justify-between gap-4 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <LockIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="font-semibold text-xl">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Update your account password
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form
          id={form.id}
          onSubmit={form.onSubmit}
          action={action}
          noValidate
          className="flex flex-col"
        >
          <div className="space-y-5 px-6 pb-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="font-medium text-gray-900 text-sm">
                New password
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  name={fields.newPassword.name}
                  placeholder="Enter new password"
                  className="h-12 border-gray-200 pr-10"
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Bars */}
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strengthLevel ? "bg-blue-500" : "bg-gray-200",
                    )}
                  />
                ))}
              </div>

              <p className="text-gray-500 text-sm">
                Password strength: {getStrengthLabel()}
              </p>

              {/* Password Requirements */}
              <ul className="space-y-1">
                <PasswordRequirement met={strength.hasMinLength}>
                  At least 8 characters
                </PasswordRequirement>
                <PasswordRequirement met={strength.hasLetters}>
                  Contains letters
                </PasswordRequirement>
                <PasswordRequirement met={strength.hasNumbers}>
                  Contains numbers
                </PasswordRequirement>
                <PasswordRequirement met={strength.hasSpecialChar}>
                  Contains special character
                </PasswordRequirement>
              </ul>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="font-medium text-gray-900 text-sm">
                Confirm new password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name={fields.confirmPassword.name}
                  placeholder="Re-enter new password"
                  className="h-12 border-gray-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fields.confirmPassword.errors && (
                <p className="text-red-500 text-sm">
                  {fields.confirmPassword.errors[0]}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordRequirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-gray-600 text-sm">
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full",
          met ? "bg-blue-500" : "bg-gray-300",
        )}
      >
        {met && (
          <svg
            className="h-2.5 w-2.5 text-white"
            viewBox="0 0 10 8"
            fill="none"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {children}
    </li>
  );
}
