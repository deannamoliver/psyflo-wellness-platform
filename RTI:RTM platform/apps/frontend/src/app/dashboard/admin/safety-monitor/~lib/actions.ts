"use server";

import { getConversationForHandoff } from "../[alertId]/~lib/queries";

export async function fetchConversationAction(handoffId: string) {
  return getConversationForHandoff(handoffId);
}
