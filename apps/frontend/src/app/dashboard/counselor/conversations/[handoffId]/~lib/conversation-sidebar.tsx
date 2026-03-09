"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const SIDEBAR_OPEN_KEY = "conversation-sidebar-open";

import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import { getInitials } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import type { ConversationStatus, InboxItem } from "./types";

const STATUS_LABELS: Record<ConversationStatus, string> = {
  needs_coach_reply: "Needs Reply",
  waiting_on_student: "Waiting on Patient",
  closed: "Closed",
  transferred: "Transferred",
};

const STATUS_COLORS: Record<ConversationStatus, string> = {
  needs_coach_reply: "bg-red-100 text-red-700",
  waiting_on_student: "bg-amber-100 text-amber-700",
  closed: "bg-gray-100 text-gray-600",
  transferred: "bg-gray-100 text-gray-600",
};

type StatusTab = "all" | ConversationStatus;

const TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_coach_reply", label: "Needs Reply" },
  { value: "waiting_on_student", label: "Waiting on Patient" },
  { value: "transferred", label: "Transferred" },
  { value: "closed", label: "Closed" },
];

type ConversationSidebarProps = {
  conversations: InboxItem[];
  currentHandoffId: string;
};

export function ConversationSidebar({
  conversations,
  currentHandoffId,
}: ConversationSidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SIDEBAR_OPEN_KEY);
    if (stored === "true") setCollapsed(false);
  }, []);

  function setCollapsedWithStorage(value: boolean) {
    setCollapsed(value);
    sessionStorage.setItem(SIDEBAR_OPEN_KEY, String(!value));
  }
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const counts = useMemo(() => {
    const all = conversations.length;
    const needs = conversations.filter(
      (c) => c.status === "needs_coach_reply",
    ).length;
    const waiting = conversations.filter(
      (c) => c.status === "waiting_on_student",
    ).length;
    const transferred = conversations.filter(
      (c) => c.status === "transferred",
    ).length;
    const closed = conversations.filter((c) => c.status === "closed").length;
    return { all, needs, waiting, transferred, closed };
  }, [conversations]);

  const filtered = useMemo(() => {
    let result = conversations;
    if (activeTab !== "all") {
      result = result.filter((c) => c.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.studentName.toLowerCase().includes(q));
    }
    return result;
  }, [conversations, activeTab, search]);

  if (collapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-gray-200 border-r bg-white py-3">
        <button
          type="button"
          onClick={() => setCollapsedWithStorage(false)}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <ChevronRight className="size-5" />
        </button>
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => setCollapsedWithStorage(false)}
            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
          >
            <MessageCircle className="size-5" />
          </button>
          {counts.all > 0 && (
            <span className="-top-1 -right-1 absolute flex size-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
              {counts.all > 99 ? "99" : counts.all}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 shrink-0 flex-col border-gray-200 border-r bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-gray-200 border-b px-4 py-3">
        <h2 className="font-semibold text-gray-900 text-sm">
          Conversation Inbox
        </h2>
        <button
          type="button"
          onClick={() => setCollapsedWithStorage(true)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Search */}
      <div className="border-gray-100 border-b px-3 py-2">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or school"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs outline-none placeholder:text-gray-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-gray-100 border-b px-3 py-2">
        {TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? counts.all
              : tab.value === "needs_coach_reply"
                ? counts.needs
                : tab.value === "waiting_on_student"
                  ? counts.waiting
                  : tab.value === "transferred"
                    ? counts.transferred
                    : counts.closed;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium text-[11px] transition-colors",
                activeTab === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <Link
            key={conv.id}
            href={`/dashboard/counselor/conversations/${conv.id}`}
            className={cn(
              "flex items-center justify-between border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50",
              conv.id === currentHandoffId && [
                "border-t border-t-blue-600 border-b border-b-blue-600 border-l-4 border-l-blue-600 bg-blue-50",
              ],
              conv.id !== currentHandoffId && "border-gray-50 border-b",
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-green-500 font-semibold text-[10px] text-white">
                  {getInitials(conv.studentName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium text-gray-900 text-xs">
                  {conv.studentName}
                </div>
                <span
                  className={cn(
                    "mt-0.5 inline-block rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                    STATUS_COLORS[conv.status],
                  )}
                >
                  {STATUS_LABELS[conv.status]}
                </span>
              </div>
            </div>
            <span className="shrink-0 text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(conv.lastMessageAt), {
                addSuffix: false,
              })}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 text-xs">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}
