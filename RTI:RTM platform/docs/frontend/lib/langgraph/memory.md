# memory.ts

Retrieves conversation history from LangGraph checkpoints. Exports `getHistory(threadId)` which returns an array of `BaseMessage` objects for the given thread.

**Interacts with:** `checkpointer.ts` for checkpoint access
