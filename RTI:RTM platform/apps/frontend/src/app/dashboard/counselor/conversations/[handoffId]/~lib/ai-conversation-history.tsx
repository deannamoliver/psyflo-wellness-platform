"use client";

import { Bot, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import type { AiMessage } from "./types";

function AiMessageBubble({
  message,
  studentInitials,
}: {
  message: AiMessage;
  studentInitials: string;
}) {
  const isUser = message.role === "user";

  if (!isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[70%]">
          <div className="rounded-2xl rounded-br-sm bg-purple-50 px-4 py-3 text-gray-800 text-sm">
            {message.content}
          </div>
        </div>
        <Avatar className="mt-1 size-8 shrink-0">
          <AvatarFallback className="bg-purple-600 font-semibold text-white text-xs">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarFallback className="bg-green-600 font-semibold text-white text-xs">
          {studentInitials}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%]">
        <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 text-gray-900 text-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function CoachConnectedDivider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-green-200" />
      <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 ring-1 ring-green-200">
        <UserCheck className="size-4 text-green-600" />
        <span className="font-semibold text-green-700 text-xs">
          You are now connected
        </span>
      </div>
      <div className="h-px flex-1 bg-green-200" />
    </div>
  );
}

export function AiConversationHistory({
  aiMessages,
  studentInitials,
}: {
  aiMessages: AiMessage[];
  studentInitials: string;
}) {
  if (aiMessages.length === 0) return null;

  return (
    <>
      {aiMessages.map((msg) => (
        <AiMessageBubble
          key={msg.id}
          message={msg}
          studentInitials={studentInitials}
        />
      ))}
      <CoachConnectedDivider />
    </>
  );
}
