import createFetchClient, { type Middleware } from "openapi-fetch";
import { serverSupabase } from "@/lib/database/supabase";
import type { paths } from "./openapi.core";

const backendHost = process.env["NEXT_PUBLIC_BACKEND_HOST"] ?? "localhost:8000";

export const baseAPIUrl =
  process.env["NEXT_PUBLIC_NO_HTTPS"] === "true"
    ? `http://${backendHost}`
    : `https://${backendHost}`;

const middleware: Middleware = {
  async onRequest({ request }) {
    const supabase = await serverSupabase();
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      request.headers.set(
        "Authorization",
        `Bearer ${data.session.access_token}`,
      );
    }

    return request;
  },
};

export const coreFetchClient = createFetchClient<paths>({
  baseUrl: baseAPIUrl,
});

coreFetchClient.use(middleware);
