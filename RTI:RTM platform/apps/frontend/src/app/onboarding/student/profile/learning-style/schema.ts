import z from "zod";

export const LearningStyleSchema = z.object({
  learningStyle: z
    .array(z.string())
    .min(1, "At least one learning style is required"),
});

export type LearningStyleSchema = z.infer<typeof LearningStyleSchema>;
