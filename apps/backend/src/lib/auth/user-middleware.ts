import type { User } from "@supabase/supabase-js";
import { createMiddleware } from "hono/factory";
import { supabase } from "@/lib/database";
import { unauthorized } from "@/lib/error/api-error";

export const authUserMiddleware = createMiddleware<{
  Variables: {
    user: User;
  };
}>(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    unauthorized("Missing authorization token");
  }

  const { data } = await supabase.auth.getUser(token);
  if (!data.user) {
    unauthorized("Invalid authorization token");
  }

  c.set("user", data.user);

  await next();
});
