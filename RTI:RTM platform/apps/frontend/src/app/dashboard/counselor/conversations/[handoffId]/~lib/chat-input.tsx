"use client";

import {
  ArrowRightLeft,
  FolderOpen,
  Loader2,
  Lock,
  Send,
  XCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import { sendCoachMessage } from "./actions";
import { CloseConversationModal } from "./close-conversation-modal";
import { ReopenConversationModal } from "./reopen-conversation-modal";
import { TransferConversationModal } from "./transfer-conversation-modal";
import type { ConversationDetail, TransferCoach } from "./types";

type ChatInputProps = {
  handoffId?: string;
  isClosed?: boolean;
  safetyModeActive?: boolean;
  onStartSafetyWorkflow?: () => void;
  onOptimisticSend?: (content: string) => void;
  conversation: ConversationDetail;
  coaches: TransferCoach[];
};

export function ChatInput({
  safetyModeActive,
  onStartSafetyWorkflow,
  onOptimisticSend,
  conversation,
  coaches,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showClose, setShowClose] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showReopen, setShowReopen] = useState(false);

  const { handoffId, status } = conversation;
  const isClosed = status === "closed";
  const isTransferred = status === "transferred";

  function handleSend() {
    if (!message.trim() || isPending) return;
    const text = message;
    setMessage("");
    onOptimisticSend?.(text);
    startTransition(async () => {
      await sendCoachMessage(handoffId, text);
    });
  }

  if (isTransferred) {
    return (
      <>
        <TransferredBanner conversation={conversation} />
        <CloseConversationModal
          open={showClose}
          onOpenChange={setShowClose}
          conversation={conversation}
        />
        <TransferConversationModal
          open={showTransfer}
          onOpenChange={setShowTransfer}
          conversation={conversation}
          coaches={coaches}
        />
      </>
    );
  }

  if (isClosed) {
    return (
      <>
        <ClosedBanner onReopen={() => setShowReopen(true)} />
        <ReopenConversationModal
          open={showReopen}
          onOpenChange={setShowReopen}
          conversation={conversation}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "border-t bg-white",
          safetyModeActive ? "border-red-200 border-t-2" : "border-gray-200",
        )}
      >
        {/* Safety mode banner */}
        {safetyModeActive && (
          <div className="mx-6 mt-3 rounded-lg bg-red-600 px-6 py-4 text-center">
            <p className="font-bold text-sm text-white">
              SAFETY MODE: Stay engaged with student
            </p>
            <p className="mt-0.5 text-red-100 text-xs">
              Continue providing support and document all interactions in the
              right panel.
            </p>
          </div>
        )}

        {/* Message input */}
        <div className="px-6 py-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-white px-3 py-2",
              safetyModeActive ? "border-red-300" : "border-gray-200",
            )}
          >
            <input
              type="text"
              placeholder="Type your message to the student..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isPending}
              className="flex-1 border-none bg-transparent text-gray-900 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between border-gray-100 border-t px-6 py-3">
          <div className="flex gap-2">
            {!safetyModeActive && (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 border-red-200 bg-red-600 text-white",
                  "hover:bg-red-700 hover:text-white",
                )}
                onClick={onStartSafetyWorkflow}
                disabled={isPending}
              >
                Start Safety Workflow
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setShowTransfer(true)}
              disabled={isPending}
            >
              <ArrowRightLeft className="size-3.5" />
              Transfer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setShowClose(true)}
              disabled={isPending}
            >
              <XCircle className="size-3.5" />
              End Chat
            </Button>
          </div>
          <Button
            size="sm"
            className={cn(
              "gap-1.5 text-white",
              safetyModeActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700",
            )}
            onClick={handleSend}
            disabled={!message.trim() || isPending}
          >
            Send Message
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </div>

        <CloseConversationModal
          open={showClose}
          onOpenChange={setShowClose}
          conversation={conversation}
        />
        <TransferConversationModal
          open={showTransfer}
          onOpenChange={setShowTransfer}
          conversation={conversation}
          coaches={coaches}
        />
      </div>
    </>
  );
}

function ClosedBanner({ onReopen }: { onReopen: () => void }) {
  return (
    <div className="border-gray-200 border-t bg-blue-50/60 px-6 py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Lock className="size-6 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">
            This conversation has been closed
          </p>
          <p className="text-blue-600 text-xs">
            You can view the conversation history, but cannot send new messages.
          </p>
        </div>
        <Button
          size="sm"
          className="mt-1 gap-1.5 bg-green-600 text-white hover:bg-green-700"
          onClick={onReopen}
        >
          <FolderOpen className="size-3.5" />
          Re-open
        </Button>
      </div>
    </div>
  );
}

function TransferredBanner({
  conversation,
}: {
  conversation: ConversationDetail;
}) {
  return (
    <div className="border-gray-200 border-t bg-blue-50/60 px-6 py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Lock className="size-6 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">
            This conversation has been transferred
          </p>
          <p className="text-blue-600 text-xs">
            You can view the conversation history, but only{" "}
            {conversation.transferredToCoachName ?? "the new coach"} can send
            new messages.
          </p>
        </div>
        {conversation.transferredToCoachName && (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
              {conversation.transferredToCoachInitials}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">
                {conversation.transferredToCoachName}
              </p>
              <p className="text-gray-500 text-xs">Current Coach</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
