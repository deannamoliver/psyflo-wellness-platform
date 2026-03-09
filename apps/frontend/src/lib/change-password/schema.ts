import { z } from "zod";

export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain letters")
      .regex(/[0-9]/, "Password must contain numbers")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordStrength = {
  hasMinLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
};

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };
}

export function getStrengthLevel(strength: PasswordStrength): number {
  return Object.values(strength).filter(Boolean).length;
}
