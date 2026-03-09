/**
 * Utility functions to compare checkpoints and identify changes
 * Helps understand what changed between consecutive checkpoints
 */

import type { CheckpointData } from "./checkpoint-storage";

/**
 * LangGraph message structure from checkpoint data
 */
interface LangGraphMessage {
  id?: string[];
  content?: string;
  kwargs?: {
    content?: string;
  };
}

/**
 * Checkpoint metadata structure
 */
interface CheckpointMetadata {
  step?: number;
  source?: string;
  [key: string]: unknown;
}

export interface CheckpointDiff {
  checkpointIndex: number;
  checkpointId: string;
  timestamp: string;
  changes: {
    messagesAdded: Array<{
      type: "human" | "ai";
      content: string;
    }>;
    metadataChanged: boolean;
    metadataDiff?: {
      step?: { old: number | null; new: number | null };
      source?: { old: string | null; new: string | null };
    };
    channelsWritten: string[];
    nodesExecuted: string[];
  };
}

/**
 * Extract node name from branch channel
 */
export function extractNodeFromChannel(channel: string): string | null {
  if (channel.startsWith("branch:to:")) {
    return channel.replace("branch:to:", "");
  }
  return null;
}

/**
 * Group checkpoint writes by checkpoint ID for efficient lookup
 * Returns a Map where keys are checkpoint IDs and values are arrays of writes
 */
export function groupWritesByCheckpoint<T extends { checkpoint_id: string }>(
  writes: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const write of writes) {
    const existing = map.get(write.checkpoint_id) || [];
    existing.push(write);
    map.set(write.checkpoint_id, existing);
  }
  return map;
}

/**
 * Compare two message arrays and find what was added
 */
function findAddedMessages(
  prevMessages: LangGraphMessage[],
  currMessages: LangGraphMessage[],
): Array<{ type: "human" | "ai"; content: string }> {
  const added: Array<{ type: "human" | "ai"; content: string }> = [];

  // Messages that exist in current but not in previous
  const prevLength = prevMessages?.length || 0;
  const currLength = currMessages?.length || 0;

  if (currLength > prevLength) {
    // New messages were added
    for (let i = prevLength; i < currLength; i++) {
      const msg = currMessages[i];
      if (!msg) continue;

      const msgType = msg.id?.[msg.id.length - 1];

      if (msgType === "HumanMessage") {
        added.push({
          type: "human",
          content: msg.kwargs?.content || msg.content || "[No content]",
        });
      } else if (msgType === "AIMessage") {
        added.push({
          type: "ai",
          content: msg.kwargs?.content || msg.content || "[No content]",
        });
      }
    }
  }

  return added;
}

/**
 * Compare metadata between checkpoints
 */
function compareMetadata(
  prevMetadata: CheckpointMetadata,
  currMetadata: CheckpointMetadata,
) {
  const changes: {
    step?: { old: number | null; new: number | null };
    source?: { old: string | null; new: string | null };
  } = {};

  if (prevMetadata?.step !== currMetadata?.step) {
    changes.step = {
      old: prevMetadata?.step ?? null,
      new: currMetadata?.step ?? null,
    };
  }

  if (prevMetadata?.source !== currMetadata?.source) {
    changes.source = {
      old: prevMetadata?.source ?? null,
      new: currMetadata?.source ?? null,
    };
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Generate diffs for all checkpoints
 * Also stores full checkpoint reference for turn detection
 */
export function generateCheckpointDiffs(
  data: CheckpointData,
): CheckpointDiff[] {
  const diffs: CheckpointDiff[] = [];

  // Group writes by checkpoint
  const writesByCheckpoint = new Map<string, typeof data.checkpoint_writes>();
  for (const write of data.checkpoint_writes) {
    const existing = writesByCheckpoint.get(write.checkpoint_id) || [];
    existing.push(write);
    writesByCheckpoint.set(write.checkpoint_id, existing);
  }

  // Compare each checkpoint with the previous one
  for (let i = 0; i < data.checkpoints.length; i++) {
    const curr = data.checkpoints[i];
    const prev = i > 0 ? data.checkpoints[i - 1] : null;

    if (!curr) continue;

    // Find what changed in messages
    const prevRaw = prev?.channel_values?.["messages"];
    const currRaw = curr.channel_values?.["messages"];
    const prevMessages = Array.isArray(prevRaw) ? prevRaw : [];
    const currMessages = Array.isArray(currRaw) ? currRaw : [];
    const messagesAdded = findAddedMessages(
      prevMessages as LangGraphMessage[],
      currMessages as LangGraphMessage[],
    );

    // Find metadata changes
    const metadataDiff = prev
      ? compareMetadata(
          prev.metadata as CheckpointMetadata,
          curr.metadata as CheckpointMetadata,
        )
      : null;

    // Find channels written
    const writes = writesByCheckpoint.get(curr.checkpoint_id) || [];
    const channelsWritten = writes.map((w) => w.channel);

    // Find nodes executed (from branch channels)
    const nodesExecuted = writes
      .map((w) => extractNodeFromChannel(w.channel))
      .filter((n): n is string => n !== null);

    diffs.push({
      checkpointIndex: i,
      checkpointId: curr.checkpoint_id,
      timestamp: curr.created_at,
      changes: {
        messagesAdded,
        metadataChanged: metadataDiff !== null,
        metadataDiff: metadataDiff || undefined,
        channelsWritten,
        nodesExecuted,
      },
    });
  }

  return diffs;
}

/**
 * Identify turn boundaries based on checkpoint metadata and message counts
 * Returns array of checkpoint indices where new turns start
 *
 * A "turn" represents one complete user-AI exchange:
 * - User sends a message (HumanMessage added)
 * - Graph processes and AI responds (AIMessage added)
 * - Turn completes
 *
 * Challenge: LangGraph creates checkpoints with source='input' for:
 * 1. Actual new user input (what we want)
 * 2. Subgraph invocations (false positives - these have 0 messages)
 *
 * Solution: Look for source='input' AND messages.length > 0
 * Subgraphs have isolated state, so their checkpoints show 0 messages.
 */
export function identifyTurnBoundaries(
  _diffs: CheckpointDiff[],
  checkpoints: CheckpointData["checkpoints"],
): number[] {
  const boundaries: number[] = [];

  for (let i = 0; i < checkpoints.length; i++) {
    const checkpoint = checkpoints[i];
    if (!checkpoint) continue;

    const metadata = checkpoint.metadata as CheckpointMetadata;
    const source = metadata?.source;

    // Count total messages at this checkpoint
    const messagesRaw = checkpoint.channel_values?.["messages"];
    const messages = Array.isArray(messagesRaw) ? messagesRaw : [];
    const hasMessages = messages.length > 0;

    // A new turn starts when:
    // 1. source='input' (graph triggered by input)
    // 2. AND has messages (not a subgraph - subgraphs have isolated state with 0 messages)
    //    OR it's the very first checkpoint (initialization with 0 messages is valid)
    const isInputSource = source === "input";

    if (isInputSource && (hasMessages || boundaries.length === 0)) {
      boundaries.push(i);
    }
  }

  return boundaries;
}

/**
 * Group checkpoint indices into turns
 * Returns array of [startIndex, endIndex] pairs
 */
export function groupCheckpointsIntoTurns(
  diffs: CheckpointDiff[],
  checkpoints: CheckpointData["checkpoints"],
): Array<[number, number]> {
  const boundaries = identifyTurnBoundaries(diffs, checkpoints);
  const turns: Array<[number, number]> = [];

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    if (start === undefined) continue;

    const nextBoundary = boundaries[i + 1];
    const end =
      nextBoundary !== undefined ? nextBoundary - 1 : diffs.length - 1;
    turns.push([start, end]);
  }

  return turns;
}

/**
 * Extract only the NEW messages added in a specific turn
 * Compares the last checkpoint in this turn with the last checkpoint in the previous turn
 */
export function extractTurnMessages(
  currentTurnCheckpoints: CheckpointData["checkpoints"],
  previousTurnCheckpoints: CheckpointData["checkpoints"] | null,
): {
  userMessages: Array<{ type: "human"; content: string }>;
  aiMessages: Array<{ type: "ai"; content: string }>;
} {
  // Get the last checkpoint in current turn (has the complete state)
  const lastCheckpoint =
    currentTurnCheckpoints[currentTurnCheckpoints.length - 1];
  const currentRaw = lastCheckpoint?.channel_values?.["messages"];
  const currentMessages = Array.isArray(currentRaw) ? currentRaw : [];

  // Get the last checkpoint in previous turn
  const prevLastCheckpoint =
    previousTurnCheckpoints?.[previousTurnCheckpoints.length - 1];
  const prevRaw = prevLastCheckpoint?.channel_values?.["messages"];
  const prevMessages = Array.isArray(prevRaw) ? prevRaw : [];

  // Find NEW messages added in this turn (everything after previous turn's messages)
  const newMessages = currentMessages.slice(prevMessages.length);

  // Extract user and AI messages from NEW messages only
  const userMessages: Array<{ type: "human"; content: string }> = [];
  const aiMessages: Array<{ type: "ai"; content: string }> = [];

  for (const msg of newMessages) {
    const msgType = msg?.id?.[msg.id.length - 1];
    const content = msg?.kwargs?.content || msg?.content || "[No content]";

    if (msgType === "HumanMessage") {
      userMessages.push({ type: "human", content });
    } else if (msgType === "AIMessage") {
      aiMessages.push({ type: "ai", content });
    }
  }

  return { userMessages, aiMessages };
}
