"server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the service_role key.
 * Required for auth.admin operations (creating users, etc).
 * Only use in server-side admin actions.
 */
export function supabaseAdmin() {
  return createClient(
    process.env["SUPABASE_URL"] as string,
    process.env["SUPABASE_SERVICE_ROLE_KEY"] as string,
  );
}
