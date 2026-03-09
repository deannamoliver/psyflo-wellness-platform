import { pronounEnum } from "@feelwell/database";
import { z } from "zod";

export const PronounsSchema = z.object({
  pronouns: z.enum(pronounEnum.enumValues, "Pronouns are required"),
});

export type PronounsSchema = z.infer<typeof PronounsSchema>;
