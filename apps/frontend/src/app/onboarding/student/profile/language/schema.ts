import { z } from "zod";

export const LanguageSchema = z.object({
  language: z.enum(
    [
      "english",
      "spanish",
      "french",
      "chinese_simplified",
      "arabic",
      "haitian_creole",
      "bengali",
      "russian",
      "urdu",
      "vietnamese",
      "portuguese",
    ],
    "Language is required",
  ),
});

export type LanguageSchema = z.infer<typeof LanguageSchema>;
