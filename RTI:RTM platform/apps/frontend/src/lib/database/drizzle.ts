"server-only";

import * as schema from "@feelwell/database";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { jwtDecode } from "jwt-decode";
import { unauthorized } from "next/navigation";
import postgres from "postgres";
import { cache } from "react";
import { serverSupabase } from "./supabase";

const globalForPostgres = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

// In serverless environments (like Vercel), we must be very conservative
// with the number of connections per lambda instance to avoid exhausting
// the Supabase connection pool (MaxClientsInSessionMode errors).
const isServerless = !!process.env["VERCEL"];

const client =
  globalForPostgres.postgresClient ??
  postgres(process.env["POSTGRES_URL"] as string, {
    // Limit to a single connection per lambda in serverless to play nicely
    // with Supabase's pooler; allow more only in non-serverless environments.
    max: isServerless ? 1 : 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    // Disable prepared statements for compatibility with Supabase's connection
    // pooler (PgBouncer), which doesn't support them across connections.
    prepare: false,
  });

// Always cache the client on the global object so that we reuse the same
// underlying connection(s) across hot reloads and requests on the same worker.
if (!globalForPostgres.postgresClient) {
  globalForPostgres.postgresClient = client;
}

const baseDrizzle = drizzle({
  client,
  casing: "snake_case",
  schema: schema,
});

type SupabaseToken = {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  role?: string;
};

const anonToken: SupabaseToken = {
  role: "anon",
};

const getSupabaseToken = cache(
  async function getSupabaseToken(): Promise<SupabaseToken> {
    const supabase = await serverSupabase();
    const result = await supabase.auth.getSession();

    const token = result.data.session?.access_token;
    if (!token) {
      return anonToken;
    }

    try {
      return jwtDecode<SupabaseToken>(token);
    } catch {
      return anonToken;
    }
  },
);

// This is based on: https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
export async function serverDrizzle() {
  const token = await getSupabaseToken();

  return {
    admin: baseDrizzle,
    userId: (): string => (!token.sub ? unauthorized() : token.sub),
    rls: (async (transaction, ...rest) =>
      await baseDrizzle.transaction(
        async (tx) => {
          try {
            await tx.execute(sql`
              -- auth.jwt()
              select set_config('request.jwt.claims', '${sql.raw(
                JSON.stringify(token),
              )}', TRUE);
              -- auth.uid()
              select set_config('request.jwt.claim.sub', '${sql.raw(
                token.sub ?? "",
              )}', TRUE);												
              -- set local role
              set local role ${sql.raw(token.role ?? "anon")};
            `);

            return await transaction(tx);
          } finally {
            await tx.execute(sql`
              -- reset
              select set_config('request.jwt.claims', NULL, TRUE);
              select set_config('request.jwt.claim.sub', NULL, TRUE);
              reset role;
            `);
          }
        },
        ...rest,
      )) as typeof baseDrizzle.transaction,
  };
}
