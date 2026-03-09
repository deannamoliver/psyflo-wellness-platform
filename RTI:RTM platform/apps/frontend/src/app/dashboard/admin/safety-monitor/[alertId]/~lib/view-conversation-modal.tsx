"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRightLeft,
  Info,
  Lock,
  MessageCircle,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import type { ConversationData } from "./queries";

type Props = {
  open: boolean;
  onClose: () => void;
  conversation: ConversationData;
};

function AIContextBanner({ reason, topic }: { reason: string; topic: string }) {
  return (
    <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-gray-100 border-b px-4 py-2.5">
        <Info className="size-3.5 text-blue-500" />
        <span className="font-medium text-gray-700 text-xs">
          AI Conversation Context
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 px-4 py-3">
        <div className="pr-4">
          <div className="mb-1 font-medium text-[10px] text-gray-400 uppercase tracking-wider">
            Reason
          </div>
          <p className="text-gray-800 text-sm">{reason}</p>
        </div>
        <div className="pl-4">
          <div className="mb-1 flex items-center gap-1 font-medium text-[10px] text-gray-400 uppercase tracking-wider">
            <MessageCircle className="size-3" />
            Topic
          </div>
          <p className="text-gray-800 text-sm">{topic}</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
}: {
  message: ConversationData["messages"][number];
}) {
  const isCoach = message.author === "coach";
  const time = format(new Date(message.createdAt), "h:mm a");

  if (isCoach) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[70%]">
          <div className="rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white">
            {message.content}
          </div>
          <div className="mt-1 text-right text-gray-400 text-xs">{time}</div>
        </div>
        <Avatar className="mt-1 size-8 shrink-0">
          <AvatarFallback className="bg-blue-600 font-semibold text-white text-xs">
            {message.senderInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarFallback className="bg-green-600 font-semibold text-white text-xs">
          {message.senderInitials}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%]">
        <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 text-gray-900 text-sm">
          {message.content}
        </div>
        <div className="mt-1 text-gray-400 text-xs">{time}</div>
      </div>
    </div>
  );
}

function SafetyWorkflowBanner({ initiatedBy }: { initiatedBy: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-red-500 border-l-4 bg-red-50 px-4 py-3">
      <AlertTriangle className="size-5 shrink-0 text-red-500" />
      <span className="font-semibold text-red-700 text-sm">
        {initiatedBy ?? "Therapist"} initiated safety workflow.
      </span>
    </div>
  );
}

function findSafetyBannerIndex(
  messages: ConversationData["messages"],
  activatedAt: string | null,
): number {
  if (!activatedAt) return -1;
  const activatedTime = new Date(activatedAt).getTime();
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg && new Date(msg.createdAt).getTime() <= activatedTime) {
      return i;
    }
  }
  return -2;
}

function TransferBanner({
  event,
}: {
  event: ConversationData["transferEvents"][number];
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-blue-500 border-l-4 bg-blue-50 px-4 py-3">
      <ArrowRightLeft className="size-5 shrink-0 text-blue-500" />
      <span className="text-blue-700 text-sm">
        {event.eventType === "takeover" ? (
          <>
            <span className="font-semibold">{event.performedByName}</span> took
            over this conversation
            {event.transferToName && (
              <>
                {" "}
                from{" "}
                <span className="font-semibold">{event.transferToName}</span>
              </>
            )}
            .
          </>
        ) : (
          <>
            Conversation transferred from{" "}
            <span className="font-semibold">{event.performedByName}</span> to{" "}
            <span className="font-semibold">
              {event.transferToName ?? "another coach"}
            </span>
            .
          </>
        )}
      </span>
    </div>
  );
}

function findEventBannerPositions(
  messages: ConversationData["messages"],
  events: ConversationData["transferEvents"],
): Map<number, ConversationData["transferEvents"]> {
  const map = new Map<number, ConversationData["transferEvents"]>();
  for (const event of events) {
    const eventTime = new Date(event.createdAt).getTime();
    let position = -2;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && new Date(msg.createdAt).getTime() <= eventTime) {
        position = i;
        break;
      }
    }
    const existing = map.get(position) ?? [];
    existing.push(event);
    map.set(position, existing);
  }
  return map;
}

function SessionStatusBar({
  conversation,
}: {
  conversation: ConversationData;
}) {
  if (conversation.status === "closed") {
    return (
      <div className="flex items-center justify-between border-gray-200 border-t bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Lock className="size-4 text-gray-400" />
          <span className="font-medium text-gray-600">Session Closed</span>
        </div>
        {conversation.closedByName && (
          <span className="text-gray-500 text-sm">
            Counselor: {conversation.closedByName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-gray-200 border-t bg-white px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="size-2.5 rounded-full bg-green-500" />
        <span className="font-medium text-gray-900">Session Active</span>
      </div>
      <span className="text-gray-500 text-sm">
        Coach: {conversation.coachName}
      </span>
    </div>
  );
}

export function ViewConversationModal({ open, onClose, conversation }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 font-dm"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-gray-200 border-b px-6 py-4">
          <DialogTitle className="font-bold text-gray-900 text-lg">
            Conversation - {conversation.topic}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
          <AIContextBanner
            reason={conversation.reason}
            topic={conversation.topic}
          />
          {(() => {
            const bannerAfterIndex = findSafetyBannerIndex(
              conversation.messages,
              conversation.safetyWorkflowActivatedAt,
            );
            const transferPositions = findEventBannerPositions(
              conversation.messages,
              conversation.transferEvents,
            );
            return (
              <div className="mx-auto max-w-3xl space-y-4">
                {bannerAfterIndex === -2 && (
                  <SafetyWorkflowBanner
                    initiatedBy={conversation.safetyWorkflowInitiatedBy}
                  />
                )}
                {transferPositions.get(-2)?.map((evt) => (
                  <TransferBanner key={evt.id} event={evt} />
                ))}
                {conversation.messages.map((msg, i) => (
                  <div key={msg.id} className="space-y-4">
                    <MessageBubble message={msg} />
                    {i === bannerAfterIndex && (
                      <SafetyWorkflowBanner
                        initiatedBy={conversation.safetyWorkflowInitiatedBy}
                      />
                    )}
                    {transferPositions.get(i)?.map((evt) => (
                      <TransferBanner key={evt.id} event={evt} />
                    ))}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            );
          })()}
        </div>

        <SessionStatusBar conversation={conversation} />
      </DialogContent>
    </Dialog>
  );
}
