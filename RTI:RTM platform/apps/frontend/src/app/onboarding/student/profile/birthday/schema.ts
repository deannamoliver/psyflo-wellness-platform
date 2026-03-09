import z from "zod";

export const BirthdaySchema = z.object({
  birthday: z.iso.datetime("Enter a valid birthday"),
});

export type BirthdaySchema = z.infer<typeof BirthdaySchema>;
