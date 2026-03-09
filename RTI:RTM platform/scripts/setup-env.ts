import "bun";

const shouldContinue = confirm(
  "This will overwrite the existing .env files. Are you sure you want to continue?",
);

if (!shouldContinue) {
  console.log("Aborting...");
  process.exit(1);
}

function formattedPrompt(message: string, defaultValue?: string): string {
  if (defaultValue == null) {
    const input = prompt(message);
    return input?.trim() ?? "";
  }

  const input = prompt(message, defaultValue);
  return input?.trim() ?? "";
}

const supabasePgUrl = formattedPrompt("Supabase Postgres URL:");
const supabaseApiUrl = formattedPrompt("Supabase API URL:");
const supabaseServiceRoleKey = formattedPrompt("Supabase service role key:");
const supabaseAnonKey = formattedPrompt("Supabase anon key:");
const backendHost = formattedPrompt(
  "[frontend] Backend host:",
  "localhost:8000",
);
const frontendNoHttps = formattedPrompt("[frontend] No HTTPS:", "true");
const chatAPIHost = formattedPrompt("Chat API host:", "localhost:5001");
const googleCredsBase64 = formattedPrompt("Google creds base64:");
const googleAIApiKey = formattedPrompt("Google AI API key:");

await Bun.file("./apps/frontend/.env").write(
  `
POSTGRES_URL=${supabasePgUrl}
SUPABASE_URL=${supabaseApiUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
NEXT_PUBLIC_BACKEND_HOST=${backendHost}
NEXT_PUBLIC_NO_HTTPS=${frontendNoHttps}
CHAT_API_HOST=${chatAPIHost}
GOOGLE_CREDS_BASE64=${googleCredsBase64}
GOOGLE_API_KEY=${googleAIApiKey}
  `.trim(),
);

await Bun.file("./apps/backend/.env").write(
  `
SUPABASE_PG_URL=${supabasePgUrl}
SUPABASE_API_URL=${supabaseApiUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}
  `.trim(),
);

await Bun.file("./packages/database/.env").write(
  `
SUPABASE_PG_URL=${supabasePgUrl}
SUPABASE_API_URL=${supabaseApiUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}
  `.trim(),
);
