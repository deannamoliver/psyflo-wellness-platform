"use client";

import { ChevronDown, ChevronRight, SparklesIcon } from "lucide-react";
import { useState } from "react";
import type { ConversationTurn, ExecutionTrace } from "@/lib/chat/types";
import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Separator } from "@/lib/core-ui/separator";
import { isLLMNode } from "@/lib/langgraph/node-prompt-map";
import { NodePromptModal } from "./node-prompt-modal";

interface AgentExecutionTraceProps {
  trace: ExecutionTrace;
}

/**
 * LangSmith-style execution trace visualization
 * Shows which nodes were executed in each conversation turn
 */
export function AgentExecutionTrace({ trace }: AgentExecutionTraceProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = (nodeName: string) => {
    if (isLLMNode(nodeName)) {
      setSelectedNode(nodeName);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Turn-by-turn execution */}
      <div className="space-y-3">
        {trace.turns.map((turn, idx) => (
          <div key={turn.turnNumber}>
            <TurnExecutionCard turn={turn} onNodeClick={handleNodeClick} />
            {idx < trace.turns.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
      </div>

      {/* Prompt modal */}
      <NodePromptModal
        nodeName={selectedNode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

interface TurnExecutionCardProps {
  turn: ConversationTurn;
  onNodeClick: (nodeName: string) => void;
}

function TurnExecutionCard({ turn, onNodeClick }: TurnExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <CardTitle className="text-base">Turn {turn.turnNumber}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {turn.nodes.length} nodes
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-0">
          {/* User message */}
          {turn.userMessage && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
              <p className="mb-1 font-medium text-blue-900 text-xs dark:text-blue-100">
                User Input:
              </p>
              <p className="text-blue-800 text-sm dark:text-blue-200">
                {turn.userMessage}
              </p>
            </div>
          )}

          {/* Assistant response */}
          {turn.assistantMessage && (
            <div className="rounded-md bg-green-50 p-3 dark:bg-green-950">
              <p className="mb-1 font-medium text-green-900 text-xs dark:text-green-100">
                Graph Output:
              </p>
              <p className="text-green-800 text-sm dark:text-green-200">
                {turn.assistantMessage}
              </p>
            </div>
          )}

          {/* Node execution flow */}
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs">
              Execution Flow:
            </p>
            <div className="space-y-2">
              {turn.nodes.map((node, idx) => {
                const isLLM = isLLMNode(node.nodeName);
                return (
                  <div
                    key={node.checkpointId}
                    className="flex items-start gap-3"
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {idx < turn.nodes.length - 1 && (
                        <div
                          className="h-full w-px bg-border"
                          style={{ minHeight: "1.5rem" }}
                        />
                      )}
                    </div>

                    {/* Node info */}
                    <div className="flex flex-1 items-center gap-2 pb-2">
                      <Badge
                        variant={
                          node.source === "input" ? "default" : "secondary"
                        }
                        className={`font-mono text-xs ${
                          isLLM
                            ? "cursor-pointer transition-colors hover:bg-primary/80"
                            : ""
                        }`}
                        onClick={() => isLLM && onNodeClick(node.nodeName)}
                      >
                        {node.nodeName}
                      </Badge>
                      {isLLM && (
                        <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
