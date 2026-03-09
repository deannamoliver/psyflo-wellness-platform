import "server-only";

import { sql } from "drizzle-orm";
import { serverDrizzle } from "../database/drizzle";

/**
 * Decode a BYTEA blob from PostgreSQL into a JavaScript value
 *
 * @param blob - The BYTEA blob from PostgreSQL (Buffer or similar)
 * @returns Decoded JavaScript value (parsed JSON), or null if decoding fails
 */
function decodeBlobValue(
  blob: Buffer | string | Uint8Array | unknown,
): unknown | null {
  try {
    if (!blob) return null;

    // Convert to Buffer if needed
    let blobBuffer: Buffer;
    if (Buffer.isBuffer(blob)) {
      blobBuffer = blob;
    } else if (blob instanceof ArrayBuffer) {
      blobBuffer = Buffer.from(new Uint8Array(blob));
    } else if (blob instanceof Uint8Array) {
      blobBuffer = Buffer.from(blob);
    } else {
      blobBuffer = Buffer.from(String(blob));
    }

    // Decode UTF-8 string
    const decoded = blobBuffer.toString("utf-8");

    // Parse as JSON
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode blob value:", {
      error: e instanceof Error ? e.message : String(e),
      blobType: typeof blob,
      isBuffer: Buffer.isBuffer(blob),
    });
    return null;
  }
}

/**
 * Options for customizing checkpoint data fetching
 */
export interface CheckpointDataOptions {
  /**
   * Whether to include blob metadata (channel, version, type) from checkpoint_blobs table
   * Default: false
   */
  includeBlobMetadata?: boolean;

  /**
   * Whether to include blob content previews (first 200 chars of decoded data)
   * Requires includeBlobMetadata to be true
   * Default: false
   */
  includeBlobPreviews?: boolean;
}

/**
 * Individual checkpoint record from PostgreSQL checkpoints table
 */
export type Checkpoint = {
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  type: string | null;
  checkpoint: unknown; // JSONB
  metadata: unknown; // JSONB
  created_at: string; // Extracted from checkpoint.ts
  channel_values: Record<string, unknown>; // Decoded from checkpoint_blobs
};

/**
 * Individual checkpoint write record from PostgreSQL checkpoint_writes table
 */
export type CheckpointWrite = {
  checkpoint_id: string;
  task_id: string;
  channel: string;
  idx: number;
  type: string | null;
};

/**
 * Individual checkpoint blob record from PostgreSQL checkpoint_blobs table
 */
export type CheckpointBlob = {
  checkpoint_id: string;
  channel: string;
  version: string;
  type: string;
  blob_preview: string | null; // Only if includeBlobPreviews is true
};

/**
 * Comprehensive checkpoint data from PostgreSQL
 * This is the unified data structure returned by fetchCheckpointData()
 */
export interface CheckpointData {
  /**
   * Checkpoint records from checkpoints table
   * Includes decoded channel_values from checkpoint_blobs
   */
  checkpoints: Checkpoint[];

  /**
   * Writes from checkpoint_writes table
   * Shows which channels were written to at each checkpoint
   */
  checkpoint_writes: CheckpointWrite[];

  /**
   * Blob metadata from checkpoint_blobs table
   * Only included if includeBlobMetadata option is true
   */
  checkpoint_blobs?: CheckpointBlob[];
}

/**
 * @deprecated Use Checkpoint type instead
 * This is kept for backward compatibility
 */
export type RawCheckpointData = Checkpoint;

/**
 * Unified checkpoint data fetcher
 *
 * Fetches checkpoint data from PostgreSQL for a given LangGraph thread.
 * This is the single source of truth for all checkpoint queries.
 *
 * The function always fetches comprehensive data from checkpoints and checkpoint_writes tables.
 * Optional blob metadata can be included for debugging purposes.
 *
 * @param threadId - LangGraph thread ID to fetch data for
 * @param options - Optional configuration for what data to include
 * @returns Complete checkpoint data with decoded channel values
 *
 * @example
 * // Production usage (minimal data)
 * const data = await fetchCheckpointData(threadId);
 *
 * @example
 * // Debug usage (all data including blob previews)
 * const data = await fetchCheckpointData(threadId, {
 *   includeBlobMetadata: true,
 *   includeBlobPreviews: true
 * });
 */
export async function fetchCheckpointData(
  threadId: string,
  options: CheckpointDataOptions = {},
): Promise<CheckpointData> {
  const db = await serverDrizzle();

  const { includeBlobMetadata = false, includeBlobPreviews = false } = options;

  // ============================================================
  // QUERY 1: Fetch checkpoints with decoded channel values
  // ============================================================
  // This query joins checkpoints with checkpoint_blobs to get the actual
  // channel data (messages, state, etc.) rather than just references.
  // Based on LangGraph's PostgresSaver SELECT_SQL pattern.

  const checkpointsResult = await db.admin.execute<{
    checkpoint_id: string;
    parent_checkpoint_id: string | null;
    type: string | null;
    checkpoint: unknown;
    metadata: unknown;
    created_at: string;
    channel_values: unknown;
  }>(sql`
    SELECT 
      c.checkpoint_id::text,
      c.parent_checkpoint_id::text,
      c.type,
      c.checkpoint,
      c.metadata,
      c.checkpoint->>'ts' as created_at,
      (
        SELECT array_agg(array[bl.channel::bytea, bl.type::bytea, bl.blob])
        FROM jsonb_each_text(c.checkpoint -> 'channel_versions')
        INNER JOIN checkpoint_blobs bl
          ON bl.thread_id = c.thread_id
          AND bl.checkpoint_ns = c.checkpoint_ns
          AND bl.channel = jsonb_each_text.key
          AND bl.version = jsonb_each_text.value
      ) as channel_values
    FROM checkpoints c
    WHERE c.thread_id = ${threadId}
    ORDER BY c.checkpoint->>'ts' ASC
  `);

  // ============================================================
  // Decode channel_values from PostgreSQL array format
  // ============================================================
  // PostgreSQL returns: array[channel::bytea, type::bytea, blob::bytea]
  // We need to:
  // 1. Convert BYTEA to strings
  // 2. Parse the blob as JSON
  // 3. Build a channel_name -> data map

  const checkpoints = Array.from(checkpointsResult).map((row) => {
    const channelValues: Record<string, unknown> = {};

    if (row.channel_values && Array.isArray(row.channel_values)) {
      for (const item of row.channel_values) {
        if (Array.isArray(item) && item.length >= 3) {
          try {
            // PostgreSQL returns BYTEA as Buffer objects
            const channel = item[0]
              ? Buffer.isBuffer(item[0])
                ? item[0].toString("utf-8")
                : String(item[0])
              : null;
            const type = item[1]
              ? Buffer.isBuffer(item[1])
                ? item[1].toString("utf-8")
                : String(item[1])
              : null;
            const blob = item[2]; // BYTEA data

            // Skip empty channels (LangGraph control channels like __start__, branch:to:*)
            if (type === "empty") {
              continue;
            }

            if (channel && blob) {
              // Decode the blob using helper function
              const decodedValue = decodeBlobValue(blob);
              if (decodedValue !== null) {
                channelValues[channel] = decodedValue;
              }
            }
          } catch (e) {
            // Log the actual error for debugging
            console.error("Failed to decode channel blob:", {
              error: e instanceof Error ? e.message : String(e),
              itemLength: item.length,
              channelRaw: item[0],
              typeRaw: item[1],
              blobRaw: item[2],
              blobType: typeof item[2],
              isBuffer: Buffer.isBuffer(item[2]),
            });
          }
        }
      }
    }

    return {
      checkpoint_id: row.checkpoint_id,
      parent_checkpoint_id: row.parent_checkpoint_id,
      type: row.type,
      checkpoint: row.checkpoint,
      metadata: row.metadata,
      created_at: row.created_at,
      channel_values: channelValues,
    };
  });

  // ============================================================
  // QUERY 2: Fetch checkpoint writes
  // ============================================================
  // Shows which channels were written to at each checkpoint
  // Useful for understanding node execution flow

  const writesResult = await db.admin.execute<{
    checkpoint_id: string;
    task_id: string;
    channel: string;
    idx: number;
    type: string | null;
  }>(sql`
    SELECT 
      checkpoint_id::text,
      task_id::text,
      channel,
      idx,
      type
    FROM checkpoint_writes
    WHERE thread_id = ${threadId}
    ORDER BY checkpoint_id::text ASC, idx ASC
  `);

  const checkpoint_writes = Array.from(writesResult);

  // ============================================================
  // QUERY 3 (OPTIONAL): Fetch checkpoint blobs metadata
  // ============================================================
  // Only fetch if explicitly requested (debugging purposes)
  // Provides detailed view of what's in checkpoint_blobs table

  let checkpoint_blobs: CheckpointData["checkpoint_blobs"];

  if (includeBlobMetadata) {
    const blobsResult = await db.admin.execute<{
      checkpoint_id: string;
      channel: string;
      version: string;
      type: string;
      blob: unknown;
    }>(sql`
      SELECT 
        c.checkpoint_id::text,
        bl.channel,
        bl.version,
        bl.type,
        bl.blob
      FROM checkpoint_blobs bl
      INNER JOIN checkpoints c
        ON bl.thread_id = c.thread_id
        AND bl.checkpoint_ns = c.checkpoint_ns
      WHERE bl.thread_id = ${threadId}
      ORDER BY c.checkpoint->>'ts' ASC, bl.channel
    `);

    // Process blobs to create previews if requested
    checkpoint_blobs = Array.from(blobsResult).map((blob) => {
      let preview: string | null = null;

      if (includeBlobPreviews && blob.blob && blob.type !== "empty") {
        try {
          // Decode blob and convert to preview string
          const decoded = decodeBlobValue(blob.blob);
          if (decoded !== null) {
            const str =
              typeof decoded === "string" ? decoded : JSON.stringify(decoded);
            preview = str.length > 200 ? `${str.substring(0, 200)}...` : str;
          } else {
            preview = "[Failed to decode]";
          }
        } catch (_e) {
          preview = "[Failed to decode]";
        }
      }

      return {
        checkpoint_id: blob.checkpoint_id,
        channel: blob.channel,
        version: blob.version,
        type: blob.type,
        blob_preview: preview,
      };
    });
  }

  return {
    checkpoints,
    checkpoint_writes,
    checkpoint_blobs,
  };
}
