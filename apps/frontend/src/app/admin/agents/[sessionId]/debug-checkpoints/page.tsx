import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Separator } from "@/lib/core-ui/separator";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  extractTurnMessages,
  generateCheckpointDiffs,
  groupCheckpointsIntoTurns,
  groupWritesByCheckpoint,
} from "@/lib/langgraph/checkpoint-diff";
import { fetchCheckpointData } from "@/lib/langgraph/checkpoint-storage";
import { createThreadId } from "@/lib/langgraph/checkpointer";

// LangGraph message type
interface LangGraphMessage {
  id?: string[];
  kwargs?: {
    content?: string;
  };
  content?: string;
}

export default async function DebugCheckpointsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  // Fetch comprehensive checkpoint data with all debugging information
  const db = await serverDrizzle();
  const userId = db.userId();
  const threadId = createThreadId(userId, sessionId);

  const data = await fetchCheckpointData(threadId, {
    includeBlobMetadata: true,
    includeBlobPreviews: true,
  });

  // Generate diffs to show what changed between checkpoints
  const diffs = generateCheckpointDiffs(data);
  const turns = groupCheckpointsIntoTurns(diffs, data.checkpoints);

  // Group writes by checkpoint for easier analysis
  const writesByCheckpoint = groupWritesByCheckpoint(data.checkpoint_writes);

  // Group blobs by checkpoint (checkpoint_blobs is optional, only for debug mode)
  const blobsByCheckpoint = new Map<
    string,
    NonNullable<typeof data.checkpoint_blobs>
  >();
  if (data.checkpoint_blobs) {
    for (const blob of data.checkpoint_blobs) {
      const existing = blobsByCheckpoint.get(blob.checkpoint_id) || [];
      existing.push(blob);
      blobsByCheckpoint.set(blob.checkpoint_id, existing);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="mb-2 font-bold text-3xl">Raw Checkpoint Data Debug</h1>
        <p className="text-muted-foreground">Session ID: {sessionId}</p>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Checkpoints</p>
              <p className="font-bold text-2xl">{data.checkpoints.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Checkpoint Writes</p>
              <p className="font-bold text-2xl">
                {data.checkpoint_writes.length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Channel Blobs</p>
              <p className="font-bold text-2xl">
                {data.checkpoint_blobs?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Unique Channels</p>
              <p className="font-bold text-2xl">
                {new Set(data.checkpoint_writes.map((w) => w.channel)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Types Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(data.checkpoint_writes.map((w) => w.channel)),
            ).map((channel) => (
              <Badge key={channel} variant="outline">
                {channel}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Turn Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Turns ({turns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {turns.map(([start, end], idx) => {
              // Get checkpoints for this turn and previous turn
              const currentTurnCheckpoints = data.checkpoints.slice(
                start,
                end + 1,
              );
              const previousTurnCheckpoints =
                idx > 0
                  ? data.checkpoints.slice(
                      turns[idx - 1]?.[0],
                      (turns[idx - 1]?.[1] ?? -1) + 1,
                    )
                  : null;

              // Extract only NEW messages for this turn
              const { userMessages, aiMessages } = extractTurnMessages(
                currentTurnCheckpoints,
                previousTurnCheckpoints,
              );

              // Get nodes executed in this turn
              const turnDiffs = diffs.slice(start, end + 1);
              const nodesExecuted = Array.from(
                new Set(turnDiffs.flatMap((d) => d.changes.nodesExecuted)),
              );

              return (
                <div
                  key={`turn-${start}-${end}`}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold">Turn {idx + 1}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Checkpoints {start} - {end}
                      </Badge>
                      <Badge variant="secondary">
                        {end - start + 1} checkpoints
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {userMessages.length > 0 && (
                      <div className="rounded bg-blue-50 p-2 dark:bg-blue-950">
                        <p className="mb-1 font-medium text-blue-900 text-xs dark:text-blue-100">
                          User Messages ({userMessages.length}):
                        </p>
                        {userMessages.map((msg, i) => (
                          <p
                            key={`user-msg-${start}-${i}-${msg.content.substring(0, 20)}`}
                            className="text-blue-800 dark:text-blue-200"
                          >
                            {msg.content}
                          </p>
                        ))}
                      </div>
                    )}

                    {aiMessages.length > 0 && (
                      <div className="rounded bg-green-50 p-2 dark:bg-green-950">
                        <p className="mb-1 font-medium text-green-900 text-xs dark:text-green-100">
                          AI Messages ({aiMessages.length}):
                        </p>
                        {aiMessages.map((msg, i) => (
                          <p
                            key={`ai-msg-${start}-${i}-${msg.content.substring(0, 20)}`}
                            className="text-green-800 dark:text-green-200"
                          >
                            {msg.content}
                          </p>
                        ))}
                      </div>
                    )}

                    {nodesExecuted.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground text-xs">
                          Nodes:
                        </span>
                        {nodesExecuted.map((node) => (
                          <Badge
                            key={node}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {node}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Checkpoint-by-Checkpoint Analysis */}
      <div className="space-y-4">
        <h2 className="font-semibold text-2xl">
          Checkpoint Details ({data.checkpoints.length})
        </h2>

        {data.checkpoints.map((checkpoint, idx) => {
          const writes = writesByCheckpoint.get(checkpoint.checkpoint_id) || [];
          const blobs = blobsByCheckpoint.get(checkpoint.checkpoint_id) || [];
          const messages = checkpoint.channel_values?.["messages"];

          // Extract user and AI messages
          let userMessages: LangGraphMessage[] = [];
          let aiMessages: LangGraphMessage[] = [];
          if (messages && Array.isArray(messages)) {
            userMessages = (messages as LangGraphMessage[]).filter(
              (m) => m.id?.[m.id.length - 1] === "HumanMessage",
            );
            aiMessages = (messages as LangGraphMessage[]).filter(
              (m) => m.id?.[m.id.length - 1] === "AIMessage",
            );
          }

          return (
            <Card key={checkpoint.checkpoint_id} className="border-2">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-mono text-sm">
                      Checkpoint #{idx + 1}
                    </CardTitle>
                    <p className="font-mono text-muted-foreground text-xs">
                      ID: {checkpoint.checkpoint_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{writes.length} writes</Badge>
                    <Badge variant="outline">{blobs.length} blobs</Badge>
                    {checkpoint.parent_checkpoint_id && (
                      <Badge variant="secondary">Has Parent</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Timestamp
                    </p>
                    <p className="font-mono text-sm">
                      {(checkpoint.checkpoint as { ts?: string })?.ts ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Parent ID
                    </p>
                    <p className="font-mono text-xs">
                      {checkpoint.parent_checkpoint_id
                        ? checkpoint.parent_checkpoint_id.substring(0, 12) +
                          "..."
                        : "None (Root)"}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h4 className="mb-2 font-semibold text-sm">Metadata</h4>
                  <div className="rounded-lg bg-slate-950 p-4">
                    <pre className="overflow-auto font-mono text-slate-100 text-xs">
                      {JSON.stringify(checkpoint.metadata, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Messages (if available) */}
                {Array.isArray(messages) && messages.length > 0 ? (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">
                      Messages Channel ({messages.length} total)
                    </h4>
                    <div className="space-y-2">
                      {userMessages.length > 0 && (
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                          <p className="mb-2 font-semibold text-blue-900 text-xs dark:text-blue-100">
                            👤 User Messages ({userMessages.length})
                          </p>
                          {userMessages.map((msg, i) => (
                            <div
                              key={msg.id?.join("-") || `user-msg-${i}`}
                              className="mb-2 last:mb-0"
                            >
                              <p className="text-blue-800 text-sm dark:text-blue-200">
                                {msg.kwargs?.content ||
                                  msg.content ||
                                  "[No content]"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiMessages.length > 0 && (
                        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                          <p className="mb-2 font-semibold text-green-900 text-xs dark:text-green-100">
                            🤖 AI Messages ({aiMessages.length})
                          </p>
                          {aiMessages.map((msg, i) => (
                            <div
                              key={msg.id?.join("-") || `ai-msg-${i}`}
                              className="mb-2 last:mb-0"
                            >
                              <p className="text-green-800 text-sm dark:text-green-200">
                                {msg.kwargs?.content ||
                                  msg.content ||
                                  "[No content]"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Checkpoint Writes */}
                {writes.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">
                      Checkpoint Writes ({writes.length})
                    </h4>
                    <div className="overflow-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Task ID</th>
                            <th className="p-2 text-left">Channel</th>
                            <th className="p-2 text-left">Index</th>
                            <th className="p-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {writes.map((write) => (
                            <tr
                              key={`${write.checkpoint_id}-${write.task_id}-${write.channel}-${write.idx}`}
                              className="border-t"
                            >
                              <td className="p-2 font-mono text-xs">
                                {write.task_id}
                              </td>
                              <td className="p-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {write.channel}
                                </Badge>
                              </td>
                              <td className="p-2">{write.idx}</td>
                              <td className="p-2 font-mono text-xs">
                                {write.type || "null"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Channel Values */}
                {checkpoint.channel_values &&
                  Object.keys(checkpoint.channel_values).length > 0 && (
                    <details className="rounded-lg border">
                      <summary className="cursor-pointer bg-muted/50 p-3 font-semibold text-sm hover:bg-muted">
                        Channel Values (
                        {Object.keys(checkpoint.channel_values).length}{" "}
                        channels) - Click to expand
                      </summary>
                      <div className="p-4">
                        <div className="rounded-lg bg-slate-950 p-4">
                          <pre className="max-h-96 overflow-auto font-mono text-slate-100 text-xs">
                            {JSON.stringify(checkpoint.channel_values, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>
                  )}

                {/* Full Checkpoint Data */}
                <details className="rounded-lg border">
                  <summary className="cursor-pointer bg-muted/50 p-3 font-semibold text-sm hover:bg-muted">
                    Full Checkpoint JSON - Click to expand
                  </summary>
                  <div className="p-4">
                    <div className="rounded-lg bg-slate-950 p-4">
                      <pre className="max-h-96 overflow-auto font-mono text-slate-100 text-xs">
                        {JSON.stringify(checkpoint.checkpoint, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
