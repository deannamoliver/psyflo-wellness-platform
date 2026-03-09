import { z } from "@hono/zod-openapi";

export const UserDto = z.object({
  id: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
