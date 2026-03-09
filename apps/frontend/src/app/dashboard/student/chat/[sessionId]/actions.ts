"use server";

import { sendMessage as sendMessageApi } from "@/lib/chat/api";
import type { Message } from "@/lib/chat/types";

/**
 * Non-streaming fallback
 */
export async function sendMessage(
  sessionId: string,
  text: string,
): Promise<Message> {
  const response = await sendMessageApi(sessionId, text);
  return response;
}
