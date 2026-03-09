"use client";

import { format } from "date-fns";
import { ClockIcon, LinkIcon, MessageSquareIcon, UserIcon } from "lucide-react";
import { getInitials } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import type { ConversationItem } from "./types";

function ConversationAvatar({
  title,
  isClosed,
}: {
  title: string;
  isClosed: boolean;
}) {
  const initials = getInitials(title);
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-dm font-semibold text-sm text-white",
        isClosed ? "bg-gray-400" : "bg-rose-400",
      )}
    >
      {initials}
    </div>
  );
}

function SafetyAlertBadge() {
  return (
    <span className="flex items-center gap-1.5 font-dm text-primary text-xs">
      <LinkIcon className="h-3.5 w-3.5" />
      Safety Alert
    </span>
  );
}

function NotesBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="flex items-center gap-1.5 font-dm text-gray-500 text-xs">
      <MessageSquareIcon className="h-3.5 w-3.5" />
      {count} note{count !== 1 ? "s" : ""}
    </span>
  );
}

export function ConversationCard({
  conversation,
  onView,
}: {
  conversation: ConversationItem;
  onView?: () => void;
}) {
  const isClosed = conversation.status === "closed";
  const dateLabel = isClosed ? "Closed" : "Started";
  const dateValue = isClosed
    ? (conversation.closedAt ?? conversation.updatedAt)
    : conversation.createdAt;
  const formattedDate = format(new Date(dateValue), "M/dd/yyyy");
  const canView = Boolean(conversation.handoffId);

  return (
    <div className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 transition-colors hover:bg-gray-50">
      <ConversationAvatar title={conversation.title} isClosed={isClosed} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-dm font-semibold text-gray-900 text-sm">
          {conversation.title}
        </span>
        <span className="flex items-center gap-1.5 font-dm text-gray-500 text-xs">
          <ClockIcon className="h-3 w-3" />
          {dateLabel}: {formattedDate}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {conversation.hasSafetyAlert && <SafetyAlertBadge />}
        <NotesBadge count={conversation.notesCount} />
        {canView && (
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800"
          >
            View
            <UserIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
