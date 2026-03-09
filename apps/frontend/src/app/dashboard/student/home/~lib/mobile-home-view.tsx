"use client";

import { ChevronDown, ChevronUp, Loader2, Send } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import type { WellnessCoachMessage } from "@/lib/chat/types";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { cn } from "@/lib/tailwind-utils";
import {
  getSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";
import { type ExpertTopic, useExpertTopic } from "./expert-topic-context";
import MobileChat from "./mobile-chat";
import MobileHeader from "./mobile-header";
import { MOBILE_QUICK_RESPONSES } from "./mobile-quick-responses";
import MobileSidebarContent from "./mobile-sidebar-content";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

type Session = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

type MobileHomeViewProps = {
  firstName: string;
  fullName: string;
  userEmail: string;
  sessions: Session[];
  activeSessionId: string | null;
  activeMessages: Message[];
  activeCoachFirstName?: string | null;
  activeWellnessCoachMessages?: WellnessCoachMessage[];
  activeWellnessHandoffId?: string | null;
  pendingFirstMessage?: string | null;
  onPendingFirstMessageSent?: () => void;
  soliStateData: SoliStateData;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onSessionCreated: (session: Session, firstMessage?: string) => void;
  onRealtimeRefreshSession?: (sessionId: string) => Promise<void> | void;
  isLoadingChat?: boolean;
  expertTopic?: ExpertTopic;
  activeSubject?: string | null;
};

export default function MobileHomeView({
  firstName,
  fullName,
  userEmail,
  sessions,
  activeSessionId,
  activeMessages,
  activeCoachFirstName,
  activeWellnessCoachMessages,
  activeWellnessHandoffId,
  pendingFirstMessage,
  onPendingFirstMessageSent,
  soliStateData,
  onNewChat,
  onSelectSession,
  onSessionCreated,
  onRealtimeRefreshSession,
  isLoadingChat = false,
  expertTopic,
  activeSubject,
}: MobileHomeViewProps) {
  const { commitTopic } = useExpertTopic();
  const [message, setMessage] = useState("");
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [soliColor, setSoliColor] = useState<string | null>(null);
  const [soliShape, setSoliShape] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Load Soli settings
  useEffect(() => {
    let isMounted = true;
    const checkAndLoad = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");
      if (storedColor && storedShape) {
        if (isMounted) {
          setSoliColor(storedColor);
          setSoliShape(storedShape);
          setSoliImage(
            getSoliImage(storedColor, storedShape, soliStateData.state),
          );
          setIsLoading(false);
        }
      } else {
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;
          if (settings) {
            setSoliColor(settings.soliColor);
            setSoliShape(settings.soliShape);
            setSoliImage(
              getSoliImage(
                settings.soliColor,
                settings.soliShape,
                soliStateData.state,
              ),
            );
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    checkAndLoad();
    return () => {
      isMounted = false;
    };
  }, [soliStateData.state]);

  const handleStartChat = async (e?: FormEvent, quickResponse?: string) => {
    e?.preventDefault();
    const textToSend = quickResponse || message.trim();
    if (!textToSend) return;

    // Create session and enter chat mode
    setIsCreatingSession(true);
    try {
      const response = await fetch("/api/chat/sessions", { method: "POST" });
      const data = await response.json();
      const title =
        textToSend.length > 30
          ? `${textToSend.substring(0, 30)}...`
          : textToSend;
      const titleBody: { title: string; subject?: string } = { title };
      if (expertTopic) {
        titleBody.subject = expertTopic.title;
      }
      await fetch(`/api/chat/sessions/${data.id}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(titleBody),
      });
      if (expertTopic) {
        commitTopic();
      }
      onSessionCreated({ id: data.id, title }, textToSend);
      setMessage("");
    } catch (_error) {
      toast.error("Failed to create chat session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Show mobile chat view only when user has clicked into a chat (mobile only)
  if (activeSessionId) {
    return (
      <MobileChat
        sessionId={activeSessionId}
        initialMessages={activeMessages}
        initialCoachFirstName={activeCoachFirstName ?? undefined}
        initialWellnessCoachMessages={activeWellnessCoachMessages ?? []}
        initialWellnessHandoffId={activeWellnessHandoffId ?? undefined}
        onRealtimeRefresh={
          onRealtimeRefreshSession
            ? () => onRealtimeRefreshSession(activeSessionId)
            : undefined
        }
        pendingFirstMessage={pendingFirstMessage ?? undefined}
        onPendingFirstMessageSent={onPendingFirstMessageSent}
        sessions={sessions}
        onBack={onNewChat}
        onNewChat={onNewChat}
        onSelectSession={onSelectSession}
        soliImage={soliImage}
        isLoadingChat={isLoadingChat}
        expertTopic={expertTopic}
        subject={activeSubject}
      />
    );
  }

  // Main mobile home view
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:hidden">
      {/* Header */}
      <MobileHeader fullName={fullName} userEmail={userEmail} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-[#EDF2F9]">
        <div className="px-4 py-4">
          {/* Greeting with Soli */}
          <div className="mb-4 flex items-center gap-3">
            {soliImage && !isLoading ? (
              <Image
                src={soliImage}
                alt="Soli mascot"
                width={64}
                height={64}
                className="object-contain"
              />
            ) : (
              <Skeleton className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100" />
            )}
            <h1 className="font-semibold text-2xl text-gray-800">
              Hey {firstName},<br />
              how's it going?
            </h1>
          </div>

          {/* Soli Status Card - Same as Desktop */}
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {soliImage && !isLoading ? (
                <Image
                  src={soliImage}
                  alt="Soli"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              ) : (
                <Skeleton className="h-14 w-14 rounded-full border border-gray-300 bg-gray-100" />
              )}
              <div className="flex flex-col gap-0">
                <h3 className="font-[600] text-base text-gray-900">
                  {soliStateData.statusText}
                </h3>
                <p className="flex items-center gap-1 text-gray-600 text-sm">
                  <span>You're on a {soliStateData.streak}-day streak</span>
                  <span className="text-base text-orange-500">🔥</span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Energy</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const isFilled = i <= soliStateData.heartCount;
                    return (
                      <Image
                        key={i}
                        src="/soli-heart.svg"
                        alt="Energy heart"
                        width={16}
                        height={16}
                        className={`h-4 w-4 ${!isFilled ? "opacity-30" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(5, soliStateData.heartCount)) * 20}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Chat Modal Card */}
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            {/* FYI Privacy Note - full width, text can wrap */}
            <div className="mb-4 flex w-full items-start rounded-2xl bg-blue-50 px-4 py-2">
              <p className="min-w-0 flex-1 text-gray-700 text-xs">
                <span className="font-semibold text-blue-600">FYI</span>
                {" · "}
                Your parents, teachers, and school staff can't see this chat. If
                I'm concerned about safety, I'll bring in a wellness coach.
              </p>
            </div>

            {/* New Chat Section with Collapsible History */}
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white">
              {/* Header */}
              <button
                onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-sm text-white">
                    +
                  </span>
                  <span className="font-semibold text-gray-900">New Chat</span>
                </div>
                {isChatHistoryExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Chat History List */}
              {isChatHistoryExpanded && sessions.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-gray-100 border-t px-4 py-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className="flex w-full items-center justify-between py-2 text-left"
                    >
                      <span
                        className={`text-sm ${session.hasUnread ? "font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {session.title}
                      </span>
                      {session.hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleStartChat} className="mb-4">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me anything..."
                  disabled={isCreatingSession}
                  className="flex-1 bg-transparent text-gray-600 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingSession ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>

            {/* Quick Response Buttons - 2 per row on mobile (plain button so hover uses response.color like chat view) */}
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_QUICK_RESPONSES.map((response) => (
                <button
                  key={response.text}
                  type="button"
                  disabled={isCreatingSession}
                  className={cn(
                    "w-full rounded-full border px-3 py-2 text-center font-medium text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    response.color,
                  )}
                  onClick={() => handleStartChat(undefined, response.text)}
                >
                  {response.text}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Content (Start Your Day, Explore, Trending, Mood History, Feedback) */}
          <MobileSidebarContent
            soliStateData={soliStateData}
            soliColor={soliColor}
            soliShape={soliShape}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
