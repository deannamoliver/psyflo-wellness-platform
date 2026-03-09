import z from "zod";

export const InterestsSchema = z.object({
  interests: z.array(z.string()).min(1, "At least one interest is required"),
});

export type InterestsSchema = z.infer<typeof InterestsSchema>;
