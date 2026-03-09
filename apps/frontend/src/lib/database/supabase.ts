"server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function serverSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env["SUPABASE_URL"] as string,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // This error can be safely ignored.
            // It happens when the `setAll` method is called from a server component.
            // Next.js does not allow cookies to be set from server components.
          }
        },
      },
    },
  );
}
