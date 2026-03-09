"use client";

import { Bug } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AIChat from "@/lib/chat/ai-chat";
import type { ExecutionTrace, Message } from "@/lib/chat/types";
import { Button } from "@/lib/core-ui/button";
import { fetchExecutionTraceAction } from "./actions";
import { AgentExecutionTrace } from "./agent-execution-trace";

interface AgentChatWithTraceProps {
  sessionId: string;
  sessionTitle: string;
  messages: Message[];
}

/**
 * Chat interface with live execution trace panel
 * Shows LangSmith-style node execution visualization that updates after each message
 */
export function AgentChatWithTrace({
  sessionId,
  sessionTitle,
  messages,
}: AgentChatWithTraceProps) {
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [isLoadingTrace, setIsLoadingTrace] = useState(false);
  const [messageCount, setMessageCount] = useState(messages.length);
  const traceContainerRef = useRef<HTMLDivElement>(null);

  // Function to refresh trace
  const refreshTrace = useCallback(async () => {
    setIsLoadingTrace(true);
    try {
      const result = await fetchExecutionTraceAction(sessionId);
      if (result.success && result.trace) {
        setTrace(result.trace);
      }
    } catch (error) {
      console.error("Failed to load trace:", error);
    } finally {
      setIsLoadingTrace(false);
    }
  }, [sessionId]);

  // Callback when messages are updated in the chat component
  const handleMessageUpdate = (updatedMessages: Message[]) => {
    setMessageCount(updatedMessages.length);
  };

  // Load trace on mount only - refreshTrace is stable via sessionId
  useEffect(() => {
    refreshTrace();
  }, [refreshTrace]);

  // Refresh trace when message count changes
  useEffect(() => {
    if (messageCount > messages.length) {
      // Debounce to avoid multiple refreshes
      const timer = setTimeout(() => {
        refreshTrace();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messageCount, messages.length, refreshTrace]);

  // Auto-scroll to bottom when trace updates
  useEffect(() => {
    if (trace && traceContainerRef.current) {
      // Scroll to bottom smoothly after trace loads
      setTimeout(() => {
        traceContainerRef.current?.scrollTo({
          top: traceContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [trace?.turns.length, trace]); // Only scroll when turn count changes

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main chat interface */}
      <div className="w-1/2">
        <AIChat
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          messages={messages}
          statusMessage="Testing mode - Admin view"
          placeholder="Test the agent response..."
          className="h-[calc(100%-3rem)]"
          onMessageUpdate={handleMessageUpdate}
        />
      </div>

      {/* Execution trace panel - always visible */}
      <div
        ref={traceContainerRef}
        className="w-1/2 overflow-y-auto rounded-lg border bg-background p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Execution Trace</h3>
          <div className="flex items-center gap-2">
            <Link href={`/admin/agents/${sessionId}/debug-checkpoints`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Bug className="h-4 w-4" />
                Debug Raw Data
              </Button>
            </Link>
            {isLoadingTrace && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </div>
        </div>

        {trace ? (
          <AgentExecutionTrace trace={trace} />
        ) : (
          <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-4 text-yellow-800">
            <p className="font-medium">No trace data available</p>
            <p className="mt-1 text-sm">
              Trace data will appear after messages are sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
