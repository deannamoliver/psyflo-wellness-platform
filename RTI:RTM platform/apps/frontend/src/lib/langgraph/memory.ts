import type { BaseMessage } from "@langchain/core/messages";
import { getCheckpointer } from "./checkpointer";

export async function getHistory(threadId: string): Promise<BaseMessage[]> {
  const checkpointer = await getCheckpointer();

  const config = { configurable: { thread_id: threadId } };
  const state = await checkpointer.get(config);

  const messages = state?.channel_values?.["messages"];
  return Array.isArray(messages) ? messages : [];
}
