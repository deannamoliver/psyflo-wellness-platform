"use server";

import { getExecutionTrace } from "@/lib/chat/api";

/**
 * Server action to fetch execution trace for a session
 * Wraps the API function so it can be called from client components
 */
export async function fetchExecutionTraceAction(sessionId: string) {
  try {
    const trace = await getExecutionTrace(sessionId);
    return { success: true, trace };
  } catch (error) {
    console.error("Failed to fetch execution trace:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
