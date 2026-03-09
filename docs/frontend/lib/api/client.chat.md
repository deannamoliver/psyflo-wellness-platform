# client.chat.ts

OpenAPI fetch client for the chat API with Google Cloud authentication. Includes middleware that attaches ID tokens from service account credentials for authenticated API calls. Uses `google-auth-library` for token generation.

**Interacts with:** Chat API endpoints, `openapi.chat.ts` types, requires `GOOGLE_CREDS_BASE64` and `CHAT_API_HOST` env vars
