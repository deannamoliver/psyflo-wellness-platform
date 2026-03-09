import * as schema from "@feelwell/database";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const db = drizzle({
  client: postgres(process.env["SUPABASE_PG_URL"] as string, {
    max: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  }),
  casing: "snake_case",
  schema: schema,
});

export const supabase = createClient(
  process.env["SUPABASE_API_URL"] as string,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] as string,
);
