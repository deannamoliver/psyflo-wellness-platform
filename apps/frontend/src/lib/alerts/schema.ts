import { z } from "zod";

export const AddNoteSchema = z.object({
  alertId: z.string(),
  note: z.string().min(1, "The note cannot be empty"),
});

export type AddNoteSchema = z.infer<typeof AddNoteSchema>;
