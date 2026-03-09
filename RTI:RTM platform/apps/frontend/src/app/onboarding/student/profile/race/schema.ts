import { z } from "zod";

export const RaceSchema = z.object({
  ethnicity: z.enum(
    [
      "american_indian_or_alaska_native",
      "asian",
      "black_or_african_american",
      "hispanic_or_latino",
      "middle_eastern_or_north_african",
      "native_hawaiian_or_pacific_islander",
      "white",
      "prefer_not_to_answer",
    ],
    "Ethnicity is required",
  ),
});

export type RaceSchema = z.infer<typeof RaceSchema>;
