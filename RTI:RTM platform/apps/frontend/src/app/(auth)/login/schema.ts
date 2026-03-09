import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string("Email is required").email("Please enter a valid email"),
  password: z.string("Password is required").min(1, "Password is required"),
});
