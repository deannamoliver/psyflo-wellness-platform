import { z } from "zod";

export const SignUpSchema = z
  .object({
    firstName: z
      .string("First name is required")
      .min(1, "First name is required"),
    lastName: z.string("Last name is required").min(1, "Last name is required"),
    email: z.string("Email is required").email("Please enter a valid email"),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const OTPSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, "Please enter the 6-digit code"),
});
