import z from "zod";

export const PersonalGoalsSchema = z.object({
  personalGoals: z
    .array(z.string())
    .min(1, "At least one personal goal is required"),
});

export type PersonalGoalsSchema = z.infer<typeof PersonalGoalsSchema>;
