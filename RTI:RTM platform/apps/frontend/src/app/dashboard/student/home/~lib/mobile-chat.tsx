"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Send } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { WellnessCoachMessage } from "@/lib/chat/types";
import { Button } from "@/lib/core-ui/button";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { useHandoffRealtime } from "@/lib/realtime/use-handoff-realtime";
import type { WellnessRealtimeEvent } from "@/lib/realtime/wellness-events";
import { cn } from "@/lib/tailwind-utils";
import type { ExpertTopic } from "./expert-topic-context";
import { MOBILE_QUICK_RESPONSES } from "./mobile-quick-responses";
import { EXPLORE_TOPICS } from "./sidebar-data";
import { TypingIndicator } from "./typing-indicator";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

type Session = {
  id: string;
  title: string;
};

type MobileChatProps = {
  sessionId: string;
  initialMessages: Message[];
  initialCoachFirstName?: string;
  initialWellnessCoachMessages?: WellnessCoachMessage[];
  initialWellnessHandoffId?: string;
  onRealtimeRefresh?: () => Promise<void> | void;
  pendingFirstMessage?: string;
  onPendingFirstMessageSent?: () => void;
  sessions: Session[];
  onBack: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  soliImage?: string | null;
  isLoadingChat?: boolean;
  expertTopic?: ExpertTopic;
  subject?: string | null;
};

export default function MobileChat({
  sessionId,
  initialMessages,
  initialCoachFirstName,
  initialWellnessCoachMessages = [],
  initialWellnessHandoffId,
  onRealtimeRefresh,
  pendingFirstMessage,
  onPendingFirstMessageSent,
  sessions,
  onBack,
  onNewChat: _onNewChat,
  onSelectSession,
  soliImage,
  isLoadingChat = false,
  expertTopic,
  subject,
}: MobileChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(false);
  const [showWellnessCoachModal, setShowWellnessCoachModal] = useState(false);
  const [wellnessCoachStep, setWellnessCoachStep] = useState(1);
  const [wellnessCoachReason, setWellnessCoachReason] = useState("");
  const [wellnessCoachTopic, setWellnessCoachTopic] = useState("");
  const [wellnessCoachOther, setWellnessCoachOther] = useState("");
  const [wellnessCoachTopicOther, setWellnessCoachTopicOther] = useState("");
  const [isWaitingForCoach, setIsWaitingForCoach] = useState(false);
  const [coachFirstName, setCoachFirstName] = useState<string | null>(
    initialCoachFirstName ?? null,
  );
  const [wellnessCoachMessages, setWellnessCoachMessages] = useState<
    WellnessCoachMessage[]
  >(initialWellnessCoachMessages);
  const [wellnessHandoffId, setWellnessHandoffId] = useState<string | null>(
    initialWellnessHandoffId ?? null,
  );
  const streamRef = useRef<EventSource | null>(null);
  const isStreamingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentPendingRef = useRef(false);

  // One-shot status check on mount/session change (no polling).
  // Coach assignment now happens automatically in the escalate/handoff request.
  // biome-ignore lint/correctness/useExhaustiveDependencies: one-shot check per session; onRealtimeRefresh is intentionally excluded because it changes every render
  useEffect(() => {
    if (!sessionId) {
      setIsWaitingForCoach(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/wellness-coach/status?sessionId=${sessionId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "waiting") {
          setIsWaitingForCoach(true);
        } else if (data.status === "with_coach") {
          setIsWaitingForCoach(false);
          setCoachFirstName(data.coachFirstName ?? null);
          setWellnessHandoffId(data.handoffId ?? null);
          // Refresh session data so coach messages are loaded
          onRealtimeRefresh?.();
        } else {
          setIsWaitingForCoach(false);
        }
      } catch {
        // Ignore
      }
    };
    checkStatus();
  }, [sessionId]);

  // --- Old polling logic (commented out — replaced by auto-assign) ---
  // useEffect(() => {
  //   if (!sessionId) { setIsWaitingForCoach(false); return; }
  //   let interval: ReturnType<typeof setInterval> | null = null;
  //   const checkStatus = async () => {
  //     try {
  //       const res = await fetch(`/api/wellness-coach/status?sessionId=${sessionId}`);
  //       if (!res.ok) return;
  //       const data = await res.json();
  //       if (data.status === "waiting") {
  //         setIsWaitingForCoach(true);
  //         if (!interval) { interval = setInterval(checkStatus, 3000); }
  //       } else {
  //         if (interval) { clearInterval(interval); interval = null; }
  //         setIsWaitingForCoach(false);
  //       }
  //     } catch { /* Ignore */ }
  //   };
  //   checkStatus();
  //   return () => { if (interval) clearInterval(interval); };
  // }, [sessionId]);

  // Load messages from database when session or initialMessages change (conversation from DB)
  useEffect(() => {
    if (!isStreamingRef.current) {
      setMessages(initialMessages);
    }
  }, [sessionId, initialMessages]);

  useEffect(() => {
    setCoachFirstName(initialCoachFirstName ?? null);
  }, [initialCoachFirstName]);

  useEffect(() => {
    setWellnessCoachMessages(initialWellnessCoachMessages);
  }, [initialWellnessCoachMessages]);

  useEffect(() => {
    setWellnessHandoffId(initialWellnessHandoffId ?? null);
  }, [initialWellnessHandoffId]);

  // Send pending first message when opening chat from dashboard quick response (same as desktop)
  useEffect(() => {
    if (sessionId) hasSentPendingRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (
      !pendingFirstMessage ||
      messages.length > 0 ||
      hasSentPendingRef.current
    ) {
      return;
    }
    hasSentPendingRef.current = true;
    handleSubmit(undefined, pendingFirstMessage);
    onPendingFirstMessageSent?.();
  }, [pendingFirstMessage, messages.length]);

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: state arrays used as scroll triggers
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, wellnessCoachMessages]);

  useHandoffRealtime({
    handoffId: wellnessHandoffId,
    enabled: Boolean(wellnessHandoffId),
    onEvent: (event: WellnessRealtimeEvent) => {
      if (event.type === "message.created") {
        const { content } = event;
        if (event.author === "coach" && content) {
          // Display coach message directly from WebSocket — no DB round-trip
          setWellnessCoachMessages((prev) => [
            ...prev,
            {
              id: event.messageId ?? crypto.randomUUID(),
              content,
              author: "coach",
            },
          ]);
          return;
        }
        // Student's own echo — already added optimistically, ignore
        if (event.author === "student") return;
      }
      onRealtimeRefresh?.();
    },
    onOpen: () => {
      // Refresh data on connect/reconnect to catch messages sent before the socket was ready
      onRealtimeRefresh?.();
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (e?: FormEvent, quickResponse?: string) => {
    e?.preventDefault();
    if (isStreaming || isWaitingForCoach) return;
    const textToSend = quickResponse ?? message.trim();
    if (!textToSend) return;

    // If coach is connected, send message to wellness coach (no AI)
    if (wellnessCoachMessages.length > 0) {
      const tempMessageId = crypto.randomUUID();
      const coachMessage: WellnessCoachMessage = {
        id: tempMessageId,
        content: textToSend,
        author: "student",
      };
      setWellnessCoachMessages((prev) => [...prev, coachMessage]);
      setMessage("");
      // Publish via WebSocket + persist to DB
      fetch("/api/wellness-coach/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatSessionId: sessionId,
          content: textToSend,
          handoffId: wellnessHandoffId,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Failed to persist wellness coach message");
          }
        })
        .catch(() => {
          setWellnessCoachMessages((prev) =>
            prev.filter((m) => m.id !== tempMessageId),
          );
          toast.error("Failed to send message. Please try again.");
        });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    isStreamingRef.current = true;
    setIsStreaming(true);

    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }

    const params = new URLSearchParams({
      sessionId,
      message: textToSend,
    });

    if (expertTopic && messages.length === 0) {
      params.set("expertTopic", expertTopic.title);
      params.set("expertTopicParent", expertTopic.parentTitle);
    }

    const eventSource = new EventSource(`/api/chat/stream?${params}`);
    streamRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          setMessages((prev) => {
            const existingMessage = prev.find((msg) => msg.id === data.id);
            if (existingMessage) {
              return prev.map((msg) =>
                msg.id === data.id ? { ...msg, content: data.content } : msg,
              );
            }
            return [
              ...prev,
              {
                id: data.id || crypto.randomUUID(),
                role: "model",
                content: data.content,
              },
            ];
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.addEventListener("done", () => {
      eventSource.close();
      streamRef.current = null;
      isStreamingRef.current = false;
      setIsStreaming(false);
      // One-shot status check — the risk protocol's handover_to_coach node
      // may have created + auto-assigned a handoff during this stream.
      fetch(`/api/wellness-coach/status?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "with_coach") {
            // Coach was auto-assigned during the stream — refresh from DB-backed session payload.
            setCoachFirstName(data.coachFirstName ?? null);
            setWellnessHandoffId(data.handoffId ?? null);
            onRealtimeRefresh?.();
            setIsWaitingForCoach(false);
          } else if (data.status === "waiting") {
            // No coach available — show waiting state (no polling)
            setIsWaitingForCoach(true);
          }
        })
        .catch(() => {});
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
      streamRef.current = null;
      isStreamingRef.current = false;
      setIsStreaming(false);
      toast.error("Connection error. Please try again.");
    });
  };

  // Loading skeleton when fetching chat data
  if (isLoadingChat) {
    return (
      <div className="flex h-full w-full flex-col bg-white lg:hidden">
        {/* Header - same structure but disabled */}
        <header className="flex flex-col border-b bg-white">
          <div className="px-4 pt-3 pb-5">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Back to Dashboard</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-3">
              {soliImage ? (
                <Image
                  src={soliImage}
                  alt="Soli"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20" />
              )}
              <span className="font-semibold text-gray-900">Soli</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 font-medium text-green-600 text-xs">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Online
              </span>
            </div>
            <span className="pointer-events-none font-medium text-primary text-sm opacity-60">
              Switch to Wellness Coach
            </span>
          </div>

          {/* New Chat bar - disabled */}
          <div className="pointer-events-none px-4 py-2 opacity-60" aria-hidden>
            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-sm text-white">
                  +
                </span>
                <span className="font-semibold text-gray-900">New Chat</span>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* FYI banner */}
          <div className="px-4 pb-3">
            <div className="flex w-full items-start rounded-2xl bg-blue-50 px-4 py-2">
              <p className="min-w-0 flex-1 text-gray-700 text-xs">
                <span className="font-semibold text-blue-600">FYI</span>
                {" · "}
                Your parents, teachers, and school staff can&apos;t see this
                chat. If I&apos;m concerned about safety, I&apos;ll bring in a
                wellness coach.
              </p>
            </div>
          </div>
        </header>

        {/* Messages Area - skeleton placeholders */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            <div className="flex justify-end">
              <Skeleton className="h-10 w-2/3 rounded-2xl bg-gray-200" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-10 w-3/4 rounded-2xl bg-gray-200" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-1/2 rounded-2xl bg-gray-200" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-14 w-2/3 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Bottom input - disabled */}
        <div
          className="pointer-events-none border-t bg-white/50 px-4 py-3 opacity-60"
          aria-hidden
        >
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="flex-1 text-gray-400 text-sm">
              Tell me anything...
            </span>
            <Send className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MOBILE_QUICK_RESPONSES.map((response) => (
              <div
                key={response.text}
                className={cn(
                  "w-full rounded-full border px-3 py-2 text-center font-medium text-xs",
                  response.color,
                )}
              >
                {response.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-white lg:hidden">
      {/* Top left: Back, Soli, New Chat, FYI. Top right: Switch to Wellness Coach */}
      <header className="flex flex-col border-b bg-white">
        <div className="px-4 pt-3 pb-5">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-3">
            {soliImage ? (
              <Image
                src={soliImage}
                alt="Soli"
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20" />
            )}
            <span className="font-semibold text-gray-900">Soli</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 font-medium text-green-600 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Online
            </span>
            {!expertTopic &&
              subject &&
              (() => {
                const subtopic = EXPLORE_TOPICS.flatMap(
                  (t) => t.subcategories ?? [],
                ).find((s) => s.title === subject);
                return (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 text-xs">
                    {subtopic ? (
                      <Image
                        src={subtopic.icon}
                        alt=""
                        width={12}
                        height={12}
                        className="h-3 w-3"
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-500" />
                    )}
                    Expert Chat: {subject}
                  </span>
                );
              })()}
          </div>
          {!isWaitingForCoach && wellnessCoachMessages.length === 0 && (
            <button
              onClick={() => setShowWellnessCoachModal(true)}
              className="font-medium text-primary text-sm hover:underline"
            >
              Switch to Wellness Coach
            </button>
          )}
        </div>

        {expertTopic && (
          <div className="px-4 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2">
              <Image
                src={expertTopic.icon}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span className="font-medium text-gray-600 text-sm">
                Expert Chat: {expertTopic.title}
              </span>
            </div>
          </div>
        )}

        {/* New Chat bar - user's chats only (customized for this user) */}
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
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
          {isChatHistoryExpanded && sessions.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-white px-2 py-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                    s.id === sessionId
                      ? "bg-primary/10 font-semibold text-gray-900"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {s.title}
                  {s.id === sessionId && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FYI banner - top left area, same as design */}
        <div className="px-4 pb-3">
          <div className="flex w-full items-start rounded-2xl bg-blue-50 px-4 py-2">
            <p className="min-w-0 flex-1 text-gray-700 text-xs">
              <span className="font-semibold text-blue-600">FYI</span>
              {" · "}
              Your parents, teachers, and school staff can&apos;t see this chat.
              If I&apos;m concerned about safety, I&apos;ll bring in a wellness
              coach.
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area - loaded from database via initialMessages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isStreamingThisMessage =
              isStreaming &&
              msg.role === "model" &&
              msg.id === messages[messages.length - 1]?.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800",
                  )}
                >
                  {msg.content}
                  {isStreamingThisMessage && (
                    <span
                      className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-500"
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            );
          })}
          {/* Connection bar: shown after last AI chat message when transferred to coach */}
          {wellnessCoachMessages.length > 0 && (
            <div className="w-full rounded-lg border border-primary/20 bg-primary/5 py-2 text-center font-medium text-black text-sm">
              {coachFirstName ? (
                <>
                  You are now connected with{" "}
                  <span className="font-bold">{coachFirstName}</span>
                </>
              ) : (
                <>
                  You are now connected to a{" "}
                  <span className="font-bold">Wellness Coach</span>
                </>
              )}
            </div>
          )}
          {/* Wellness coach messages - coach on left, student on right */}
          {wellnessCoachMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.author === "student" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  msg.author === "student"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800",
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "model" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-gray-500 text-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          {isWaitingForCoach && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 drop-shadow-lg">
                {soliImage ? (
                  <Image
                    src={soliImage}
                    alt="Soli mascot"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                ) : (
                  <div className="h-[80px] w-[80px] rounded-full border border-gray-300 bg-gray-100" />
                )}
              </div>
              <p className="mb-2 text-center font-medium text-gray-700 text-sm">
                Hang on while we find you a wellness coach to speak with.
              </p>
              <p className="text-center font-semibold text-black text-sm">
                Estimated time: 2 minutes
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom: input + four pills - disabled when waiting for coach */}
      <div className="border-t bg-white/50 px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 shadow-sm",
              isWaitingForCoach &&
                "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60",
            )}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me anything..."
              className="flex-1 bg-transparent text-gray-600 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isWaitingForCoach}
            />
            <button
              type="submit"
              disabled={isStreaming || isWaitingForCoach || !message.trim()}
              className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MOBILE_QUICK_RESPONSES.map((response) => (
            <Button
              key={response.text}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "w-full rounded-full px-3 py-2 text-center font-medium text-xs disabled:cursor-not-allowed disabled:opacity-60",
                response.color,
              )}
              onClick={() => handleSubmit(undefined, response.text)}
              disabled={isStreaming || isWaitingForCoach}
            >
              {response.text}
            </Button>
          ))}
        </div>
      </div>

      {/* Wellness Coach Modal - same flow as desktop */}
      {showWellnessCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setShowWellnessCoachModal(false);
                setWellnessCoachStep(1);
                setWellnessCoachReason("");
                setWellnessCoachTopic("");
                setWellnessCoachOther("");
                setWellnessCoachTopicOther("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {wellnessCoachStep === 1 ? (
              <>
                <h2 className="mb-2 text-center font-bold text-gray-800 text-xl">
                  Talking to a Wellness Coach
                </h2>
                <p className="mb-6 text-center text-gray-500 text-sm">
                  What&apos;s making you want to talk to a person?
                </p>
                <div className="space-y-3">
                  {[
                    "AI suggestions aren't helping",
                    "This feels too personal for AI",
                    "I want to talk through something complicated",
                    "I just prefer talking to a real person",
                    "Other",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setWellnessCoachReason(reason)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        wellnessCoachReason === reason
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <span className="text-gray-700">{reason}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    onClick={() => setWellnessCoachStep(2)}
                    disabled={!wellnessCoachReason}
                    className="rounded-full px-8"
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-2 text-center font-bold text-gray-800 text-xl">
                  What&apos;s it about?
                </h2>
                <p className="mb-6 text-center text-gray-500 text-sm">
                  This helps us connect you with the right person
                </p>
                <div className="space-y-3">
                  {[
                    "Home or family",
                    "How I've been feeling",
                    "Friends or relationships",
                    "Safety concerns",
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setWellnessCoachTopic(topic)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        wellnessCoachTopic === topic
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <span className="text-gray-700">{topic}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <button
                      type="button"
                      onClick={() => setWellnessCoachTopic("Something else")}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        wellnessCoachTopic === "Something else"
                          ? "border-primary bg-primary"
                          : "border-gray-300",
                      )}
                    >
                      {wellnessCoachTopic === "Something else" && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <span className="text-gray-700">Something else</span>
                    <input
                      type="text"
                      value={wellnessCoachTopicOther}
                      onChange={(e) => {
                        setWellnessCoachTopicOther(e.target.value);
                        setWellnessCoachTopic("Something else");
                      }}
                      className="flex-1 border-gray-300 border-b bg-transparent outline-none focus:border-primary"
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          "/api/wellness-coach/escalate",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              chatSessionId: sessionId,
                              reason:
                                wellnessCoachReason === "Other"
                                  ? wellnessCoachOther || "Other"
                                  : wellnessCoachReason,
                              topic: wellnessCoachTopic,
                              otherDetail:
                                wellnessCoachTopic === "Something else"
                                  ? wellnessCoachTopicOther?.trim() || null
                                  : wellnessCoachReason === "Other"
                                    ? wellnessCoachOther?.trim() || null
                                    : null,
                            }),
                          },
                        );
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(
                            err.error || "Failed to send request",
                          );
                        }
                        const data = await res.json();
                        setShowWellnessCoachModal(false);
                        setWellnessCoachStep(1);
                        setWellnessCoachReason("");
                        setWellnessCoachTopic("");
                        setWellnessCoachOther("");
                        setWellnessCoachTopicOther("");

                        // Use the escalate response directly (auto-assign result)
                        if (data.status === "with_coach") {
                          toast.success("Connected to a wellness coach!");
                          setCoachFirstName(data.coachFirstName ?? null);
                          setWellnessHandoffId(data.escalationId ?? null);
                          onRealtimeRefresh?.();
                          setIsWaitingForCoach(false);
                        } else {
                          // No coach available — show waiting (no polling)
                          setIsWaitingForCoach(true);
                          toast.success(
                            "Request sent! A wellness coach will reach out soon.",
                          );
                        }

                        // --- Old polling trigger (commented out — replaced by auto-assign) ---
                        // const statusRes = await fetch(
                        //   `/api/wellness-coach/status?sessionId=${sessionId}`,
                        // );
                        // const statusData = await statusRes.json();
                        // if (statusData.status === "waiting") {
                        //   setIsWaitingForCoach(true);
                        // }
                        // toast.success(
                        //   "Request sent! A wellness coach will reach out soon.",
                        // );
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Failed to send request",
                        );
                      }
                    }}
                    disabled={!wellnessCoachTopic}
                    className="rounded-full px-8"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
