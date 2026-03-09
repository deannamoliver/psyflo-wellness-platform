import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool, type PoolConfig } from "pg";

const isProduction =
  process.env["NODE_ENV"] === "production" || !!process.env["VERCEL"];
// TODO: Securely enfore SSL in production
// const caCert = process.env["POSTGRES_CA"] || "";

let sslConfig: PoolConfig["ssl"];

// // building the sslConfig based on environment
// if (isProduction && caCert) {
//   sslConfig = {
//     ca: Buffer.from(caCert).toString(),
//     rejectUnauthorized: true,
//   };
// } else if (isProduction && !caCert) {
//   sslConfig = true;
// } else {
//   sslConfig = false;
// }

// Building the sslConfig based on environment
// Disabled SSL verification for now for simplicity
if (isProduction) {
  sslConfig = { rejectUnauthorized: false };
} else {
  sslConfig = false;
}

const globalForCheckpointer = globalThis as unknown as {
  checkpointerInstance: PostgresSaver | undefined;
};

export async function getCheckpointer(): Promise<PostgresSaver> {
  if (globalForCheckpointer.checkpointerInstance)
    return globalForCheckpointer.checkpointerInstance;

  const pool = new Pool({
    connectionString: process.env["POSTGRES_URL"] as string,
    ssl: sslConfig,
    max: 2,
    idleTimeoutMillis: 20_000,
  });

  const checkpointer = new PostgresSaver(pool);

  // Creates checkpoint tables: checkpoints, checkpoint_blobs, checkpoint_writes
  await checkpointer.setup();

  globalForCheckpointer.checkpointerInstance = checkpointer;
  return checkpointer;
}

// Helper to create user-scoped thread IDs for security
export function createThreadId(userId: string, sessionId: string): string {
  return `user_${userId}_${sessionId}`;
}

// Helper to extract session ID from thread ID
export function extractSessionId(threadId: string): string | null {
  const parts = threadId.split("_");
  return parts.length === 3 && parts[2] !== undefined ? parts[2] : null;
}
