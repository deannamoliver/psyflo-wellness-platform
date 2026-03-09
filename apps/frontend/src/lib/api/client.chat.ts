import { GoogleAuth } from "google-auth-library";
import createFetchClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./openapi.chat";

const chatAPIBaseUrl = process.env["CHAT_API_HOST"] ?? "http://localhost:5001";

const googleAuthMiddleware: Middleware = {
  async onRequest({ request }) {
    const credsBase64 = process.env["GOOGLE_CREDS_BASE64"];
    if (!credsBase64) {
      throw new Error("GOOGLE_CREDS_BASE64 is not set");
    }
    try {
      const decodedJsonString = Buffer.from(credsBase64, "base64").toString(
        "utf-8",
      );
      const auth = new GoogleAuth({
        credentials: JSON.parse(decodedJsonString),
      });
      const client = await auth.getIdTokenClient(chatAPIBaseUrl);
      const token = await client.idTokenProvider.fetchIdToken(chatAPIBaseUrl);
      request.headers.set("Authorization", `Bearer ${token}`);
    } catch (error) {
      console.error("Failed to fetch Google Auth token:", error);
    }
    return request;
  },
};

export const chatClient = createFetchClient<paths>({
  baseUrl: chatAPIBaseUrl,
});

chatClient.use(googleAuthMiddleware);
