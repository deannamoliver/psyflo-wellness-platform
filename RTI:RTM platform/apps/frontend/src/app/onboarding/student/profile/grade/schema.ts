import { z } from "zod";

export const GradeSchema = z.object({
  grade: z.enum(
    Array.from({ length: 12 }, (_, i) => i + 1).map(String),
    "Grade is required",
  ),
});

export type GradeSchema = z.infer<typeof GradeSchema>;
