"use client";

import { isAfter, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ConversationCard } from "./conversation-card";
import { ConversationsFilters } from "./conversations-filters";
import type { ConversationItem, DateRange, StatusFilter } from "./types";

const INITIAL_VISIBLE = 5;

function getDateRangeStart(range: DateRange): Date | null {
  const now = new Date();
  if (range === "this_week") return startOfWeek(now, { weekStartsOn: 1 });
  if (range === "this_month") return startOfMonth(now);
  if (range === "this_year") return startOfYear(now);
  return null;
}

function filterByDate(
  conversations: ConversationItem[],
  dateRange: DateRange,
): ConversationItem[] {
  const start = getDateRangeStart(dateRange);
  if (!start) return conversations;
  return conversations.filter((c) => isAfter(new Date(c.createdAt), start));
}

function ConversationSection({
  title,
  dotColor,
  conversations,
  onViewConversation,
}: {
  title: string;
  dotColor: string;
  conversations: ConversationItem[];
  onViewConversation: (conversation: ConversationItem) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll
    ? conversations
    : conversations.slice(0, INITIAL_VISIBLE);
  const remaining = conversations.length - INITIAL_VISIBLE;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <h3 className="font-bold font-dm text-gray-900 text-sm uppercase tracking-wide">
            {title}({conversations.length})
          </h3>
        </div>
        {conversations.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="font-dm font-medium text-primary text-sm hover:text-primary/80"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {conversations.length === 0 ? (
          <p className="py-8 text-center font-dm text-gray-400 text-sm">
            No conversations
          </p>
        ) : (
          visible.map((c) => (
            <ConversationCard
              key={c.id}
              conversation={c}
              onView={() => onViewConversation(c)}
            />
          ))
        )}
      </div>

      {!showAll && remaining > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-2 border-gray-100 border-t py-3 font-dm font-medium text-primary text-sm hover:bg-gray-50"
        >
          Show {remaining} more {title.toLowerCase()}
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ConversationsContent({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all_time");

  const dateFiltered = useMemo(
    () => filterByDate(conversations, dateRange),
    [conversations, dateRange],
  );

  const activeConversations = useMemo(
    () => dateFiltered.filter((c) => c.status === "active"),
    [dateFiltered],
  );

  const closedConversations = useMemo(
    () => dateFiltered.filter((c) => c.status === "closed"),
    [dateFiltered],
  );

  const filteredCount =
    statusFilter === "active"
      ? activeConversations.length
      : statusFilter === "closed"
        ? closedConversations.length
        : dateFiltered.length;

  const router = useRouter();

  const handleViewConversation = (conversation: ConversationItem) => {
    if (conversation.handoffId) {
      router.push(
        `/dashboard/counselor/conversations/${conversation.handoffId}`,
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ConversationsFilters
        statusFilter={statusFilter}
        dateRange={dateRange}
        totalCount={dateFiltered.length}
        activeCount={activeConversations.length}
        closedCount={closedConversations.length}
        filteredCount={filteredCount}
        onStatusChange={setStatusFilter}
        onDateRangeChange={setDateRange}
      />

      {(statusFilter === "all" || statusFilter === "active") && (
        <ConversationSection
          title="Active Conversations"
          dotColor="bg-green-500"
          conversations={activeConversations}
          onViewConversation={handleViewConversation}
        />
      )}

      {(statusFilter === "all" || statusFilter === "closed") && (
        <ConversationSection
          title="Closed Conversations"
          dotColor="bg-gray-400"
          conversations={closedConversations}
          onViewConversation={handleViewConversation}
        />
      )}
    </div>
  );
}
