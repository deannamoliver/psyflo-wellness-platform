import "server-only";

import {
  extractNodeFromChannel,
  extractTurnMessages,
  generateCheckpointDiffs,
  groupWritesByCheckpoint,
  identifyTurnBoundaries,
} from "./checkpoint-diff";
import {
  type Checkpoint,
  type CheckpointWrite,
  fetchCheckpointData,
} from "./checkpoint-storage";

/**
 * Represents a single node execution within a checkpoint
 */
export interface ExecutionNode {
  /**
   * Name of the node that executed
   */
  nodeName: string;

  /**
   * When this node executed (ISO timestamp)
   */
  timestamp: string;

  /**
   * Checkpoint ID where this node executed
   */
  checkpointId: string;

  /**
   * Checkpoint step number
   */
  step: number;

  /**
   * Source of execution (input or loop)
   */
  source: string;
}

/**
 * Represents a conversation turn (grouped checkpoints)
 * A turn starts with a user message and includes all graph execution until END
 */
export interface ConversationTurn {
  /**
   * Turn number (1-indexed)
   */
  turnNumber: number;

  /**
   * The user's message that triggered this turn (if any)
   */
  userMessage: string | null;

  /**
   * The assistant's response for this turn (if available)
   */
  assistantMessage: string | null;

  /**
   * All node executions in this turn
   */
  nodes: ExecutionNode[];

  /**
   * When this turn started
   */
  startTime: string;

  /**
   * When this turn completed
   */
  endTime: string;

  /**
   * Total duration in milliseconds
   */
  durationMs: number;
}

/**
 * Complete execution trace for a conversation session
 */
export interface ExecutionTrace {
  /**
   * Chat session ID
   */
  sessionId: string;

  /**
   * LangGraph thread ID
   */
  threadId: string;

  /**
   * All conversation turns in chronological order
   */
  turns: ConversationTurn[];

  /**
   * Total number of checkpoints across all turns
   */
  totalCheckpoints: number;

  /**
   * Unique nodes that executed across the entire session
   */
  uniqueNodes: string[];
}

/**
 * Extract node executions from checkpoints and writes
 */
function extractNodeExecutions(
  checkpoints: Checkpoint[],
  writes: CheckpointWrite[],
): ExecutionNode[] {
  const nodes: ExecutionNode[] = [];

  // Group writes by checkpoint_id for easy lookup
  const writesByCheckpoint = groupWritesByCheckpoint(writes);

  // Process each checkpoint
  for (const checkpoint of checkpoints) {
    const checkpointWrites =
      writesByCheckpoint.get(checkpoint.checkpoint_id) || [];

    // Skip checkpoints with no writes (internal state transitions, not actual node executions)
    if (checkpointWrites.length === 0) {
      continue;
    }

    const metadata = checkpoint.metadata as { step?: number; source?: string };
    const step = metadata?.step ?? -1;
    const source = metadata?.source ?? "unknown";

    // Extract node names from branch channels
    const nodeNames = new Set<string>();
    for (const write of checkpointWrites) {
      const nodeName = extractNodeFromChannel(write.channel);
      if (nodeName) {
        nodeNames.add(nodeName);
      }
    }

    // Skip if no actual node names found (only state channels like "messages", etc.)
    if (nodeNames.size === 0) {
      continue;
    }

    // Create execution node entries
    for (const nodeName of nodeNames) {
      nodes.push({
        nodeName,
        timestamp: checkpoint.created_at,
        checkpointId: checkpoint.checkpoint_id,
        step,
        source,
      });
    }
  }

  return nodes;
}

/**
 * Group node executions into conversation turns using the shared turn detection logic
 * A turn represents analyze_risk + conversation cycle (user input + agent response)
 *
 * Turn boundaries are identified by checkpoint-diff.ts logic which accounts for:
 * - analyze_risk placement (runs FIRST to determine routing)
 * - Message count increases (new user input)
 */
function groupNodesIntoTurns(
  nodes: ExecutionNode[],
  checkpoints: Checkpoint[],
  writes: CheckpointWrite[],
): ConversationTurn[] {
  if (nodes.length === 0 || checkpoints.length === 0) {
    return [];
  }

  // Generate diffs (needed for turn detection)
  const diffs = generateCheckpointDiffs({
    checkpoints,
    checkpoint_writes: writes,
    checkpoint_blobs: [], // Not needed for turn detection
  });

  // Use shared turn detection logic from checkpoint-diff.ts
  const turnBoundaries = identifyTurnBoundaries(diffs, checkpoints);

  // Build checkpoint index -> checkpoint map for quick lookup
  const checkpointMap = new Map<string, Checkpoint>();
  for (const checkpoint of checkpoints) {
    checkpointMap.set(checkpoint.checkpoint_id, checkpoint);
  }

  const turns: ConversationTurn[] = [];

  // Process each turn boundary
  for (let turnIdx = 0; turnIdx < turnBoundaries.length; turnIdx++) {
    const turnStart = turnBoundaries[turnIdx];
    if (turnStart === undefined) continue;

    const turnEnd =
      turnBoundaries[turnIdx + 1] !== undefined
        ? turnBoundaries[turnIdx + 1]! - 1
        : checkpoints.length - 1;

    // Get all nodes in this turn's checkpoint range
    const turnNodes = nodes.filter((node) => {
      const nodeCheckpoint = checkpointMap.get(node.checkpointId);
      if (!nodeCheckpoint) return false;

      const nodeIndex = checkpoints.indexOf(nodeCheckpoint);
      return nodeIndex >= turnStart && nodeIndex <= turnEnd;
    });

    if (turnNodes.length === 0) continue;

    // Get checkpoints for this turn
    const turnCheckpoints = checkpoints.slice(turnStart, turnEnd + 1);

    const previousTurnCheckpoints =
      turnIdx > 0
        ? checkpoints.slice(turnBoundaries[turnIdx - 1]!, turnStart - 1)
        : null;

    // Extract messages for this turn using shared function
    const { userMessages, aiMessages } = extractTurnMessages(
      turnCheckpoints,
      previousTurnCheckpoints,
    );

    // Get the first user and AI message (for backward compatibility with existing UI)
    const userMessage = userMessages[0]?.content || null;
    const assistantMessage = aiMessages[0]?.content || null;

    // Calculate timing
    const firstNode = turnNodes[0];
    const lastNode = turnNodes[turnNodes.length - 1];

    if (firstNode && lastNode) {
      const startMs = new Date(firstNode.timestamp).getTime();
      const endMs = new Date(lastNode.timestamp).getTime();

      turns.push({
        turnNumber: turnIdx + 1,
        userMessage,
        assistantMessage,
        nodes: turnNodes,
        startTime: firstNode.timestamp,
        endTime: lastNode.timestamp,
        durationMs: endMs - startMs,
      });
    }
  }

  return turns;
}

/**
 * Build complete execution trace from database
 * This is the main function to call for getting trace data
 */
export async function buildExecutionTrace(
  threadId: string,
  sessionId: string,
): Promise<ExecutionTrace> {
  // Fetch raw data from database (no blob metadata needed for trace history)
  const { checkpoints, checkpoint_writes: writes } =
    await fetchCheckpointData(threadId);

  // Extract node executions
  const nodes = extractNodeExecutions(checkpoints, writes);

  // Group into turns (pass writes for turn detection)
  const turns = groupNodesIntoTurns(nodes, checkpoints, writes);

  // Extract unique node names
  const uniqueNodesSet = new Set<string>();
  for (const node of nodes) {
    uniqueNodesSet.add(node.nodeName);
  }

  return {
    sessionId,
    threadId,
    turns,
    totalCheckpoints: checkpoints.length,
    uniqueNodes: Array.from(uniqueNodesSet).sort(),
  };
}
