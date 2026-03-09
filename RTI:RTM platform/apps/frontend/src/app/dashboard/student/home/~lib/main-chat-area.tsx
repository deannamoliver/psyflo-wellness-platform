"use client";

import { Loader2, Send } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { useHandoffRealtime } from "@/lib/realtime/use-handoff-realtime";
import type { WellnessRealtimeEvent } from "@/lib/realtime/wellness-events";
import { cn } from "@/lib/tailwind-utils";
import { EXPLORE_TOPICS } from "./sidebar-data";

const QUICK_RESPONSES = [
  {
    text: "I'm overwhelmed or stressed",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
  },
  {
    text: "I need advice on friendships",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  },
  {
    text: "Emotions are tough right now",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  },
  {
    text: "I am having a conflict",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  },
];

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

type Session = {
  id: string;
  title: string;
};

import type { WellnessCoachMessage } from "@/lib/chat/types";
import type { ExpertTopic } from "./expert-topic-context";
import { useExpertTopic } from "./expert-topic-context";

type MainChatAreaProps = {
  firstName: string;
  sessionId?: string;
  initialMessages?: Message[];
  initialCoachFirstName?: string | null;
  initialWellnessCoachMessages?: WellnessCoachMessage[];
  initialWellnessHandoffId?: string | null;
  onRealtimeRefresh?: () => Promise<void> | void;
  onSessionCreated?: (session: Session) => void;
  isLoadingChat?: boolean;
  expertTopic?: ExpertTopic;
  subject?: string | null;
};

import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  getSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";
import { TypingIndicator } from "./typing-indicator";

export default function MainChatArea({
  firstName,
  sessionId: initialSessionId,
  initialMessages = [],
  initialCoachFirstName,
  initialWellnessCoachMessages = [],
  initialWellnessHandoffId = null,
  onRealtimeRefresh,
  onSessionCreated,
  isLoadingChat = false,
  expertTopic,
  subject,
}: MainChatAreaProps) {
  const { commitTopic } = useExpertTopic();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || null,
  );
  // Start in loading state, then load from localStorage or sync from database
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage or sync from database
  useEffect(() => {
    let isMounted = true;

    const checkAndLoad = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");

      if (storedColor && storedShape) {
        // Use localStorage values
        if (isMounted) {
          setSoliImage(getSoliImage(storedColor, storedShape));
          setIsLoading(false);
        }
      } else {
        // Sync from database if localStorage is empty
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;

          if (settings) {
            setSoliImage(getSoliImage(settings.soliColor, settings.soliShape));
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    checkAndLoad();

    return () => {
      isMounted = false;
    };
  }, []);
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
    initialWellnessHandoffId,
  );
  const streamRef = useRef<EventSource | null>(null);
  const isStreamingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(initialSessionId || null);
    if (!isStreamingRef.current) {
      setMessages(initialMessages);
    }
    setCoachFirstName(initialCoachFirstName ?? null);
    setWellnessCoachMessages(initialWellnessCoachMessages);
    setWellnessHandoffId(initialWellnessHandoffId);
  }, [
    initialSessionId,
    initialMessages,
    initialCoachFirstName,
    initialWellnessCoachMessages,
    initialWellnessHandoffId,
  ]);

  const hasStartedChat = messages.length > 0 || !!initialSessionId;

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
        // Ignore errors
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

  // Scroll to bottom when messages change (including during streaming)
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

  // Loading skeleton when user selected a chat and we're fetching its data.
  // Same layout as chat view: header and bottom bar visible but disabled; only message area shows light skeletons.
  if (initialSessionId && isLoadingChat) {
    return (
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          <Image
            src="/container-icon.svg"
            alt=""
            width={282}
            height={241}
            className="-right-16 pointer-events-none absolute bottom-0 z-0 select-none"
            aria-hidden="true"
          />
          <Image
            src="/container-icon-2.svg"
            alt=""
            width={40}
            height={39}
            className="pointer-events-none absolute top-6 right-1/4 z-0 select-none"
            aria-hidden="true"
          />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Header: real Online badge + Switch to Wellness Coach, disabled */}
            <div
              className="pointer-events-none flex items-center justify-between px-6 pt-6 opacity-60"
              aria-hidden
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span className="font-medium text-green-600 text-sm">
                  Online
                </span>
              </div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                Switch to Wellness Coach
              </button>
            </div>
            {/* Messages area: light skeletons — right (user), then left (assistant), 4 boxes total */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="mx-auto max-w-5xl space-y-4">
                <div className="flex justify-end">
                  <Skeleton className="h-12 w-1/2 max-w-[80%] rounded-2xl bg-gray-200" />
                </div>
                <div className="flex justify-start">
                  <Skeleton className="h-12 w-3/4 max-w-[80%] rounded-2xl bg-gray-200" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-12 w-1/3 max-w-[80%] rounded-2xl bg-gray-200" />
                </div>
                <div className="flex justify-start">
                  <Skeleton className="h-16 w-2/3 max-w-[80%] rounded-2xl bg-gray-200" />
                </div>
              </div>
            </div>
            {/* Bottom: real chatbar + pills + FYI, disabled */}
            <div
              className="pointer-events-none border-t bg-white/50 px-6 py-4 opacity-60"
              aria-hidden
            >
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <span className="flex-1 text-base text-gray-400">
                  Tell me anything...
                </span>
                <Send className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-3 flex flex-nowrap justify-evenly gap-2 overflow-x-auto overflow-y-hidden pb-1">
                {QUICK_RESPONSES.map((response) => (
                  <button
                    key={response.text}
                    type="button"
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 font-medium text-gray-800 text-sm",
                      response.color,
                    )}
                  >
                    {response.text}
                  </button>
                ))}
              </div>
              <div className="mt-4 w-full">
                <div className="flex w-full items-center justify-center rounded-2xl bg-blue-50 px-6 py-3">
                  <p className="text-center text-gray-700 text-sm">
                    <span className="font-semibold text-blue-600">FYI</span>
                    <span className="mx-1 text-blue-600">·</span>
                    Your parents, teachers, and school staff can&apos;t see this
                    chat. If I&apos;m concerned about safety, I&apos;ll bring in
                    a wellness coach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e?: FormEvent, quickResponse?: string) => {
    e?.preventDefault();
    if (isStreaming || isWaitingForCoach) return;
    const textToSend = quickResponse || message.trim();
    if (!textToSend) return;

    // If coach is connected, send message to wellness coach (no AI)
    if (wellnessCoachMessages.length > 0 && sessionId) {
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

    // Create session if needed (first message) — show spinner until we show the typing indicator
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      setIsCreatingSession(true);
      try {
        const response = await fetch("/api/chat/sessions", { method: "POST" });
        const data = await response.json();
        currentSessionId = data.id;
        setSessionId(currentSessionId);

        // Update session title in database with first message
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

        // Mark expert topic as committed now that a session has been created
        if (expertTopic) {
          commitTopic();
        }

        // Prevent the sync effect from overwriting the optimistic user message
        // when the parent echoes back the new session id. Ref is set synchronously
        // BEFORE the parent state change so it's always visible to the effect.
        isStreamingRef.current = true;

        // Notify parent about new session with first message as title
        if (onSessionCreated) {
          onSessionCreated({ id: data.id, title });
        }
      } catch (_error) {
        setIsCreatingSession(false);
        toast.error("Failed to create chat session");
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsStreaming(true);
    setIsCreatingSession(false);

    // Close any existing stream
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }

    // Ensure we have a session ID (should always be set by this point)
    if (!currentSessionId) {
      toast.error("Failed to initialize chat session");
      return;
    }

    const params = new URLSearchParams({
      sessionId: currentSessionId,
      message: textToSend,
    });

    // Send expert topic context on first message only
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
      if (currentSessionId) {
        fetch(`/api/wellness-coach/status?sessionId=${currentSessionId}`)
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
      }
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
      streamRef.current = null;
      isStreamingRef.current = false;
      setIsStreaming(false);
      toast.error("Connection error. Please try again.");
    });
  };

  // Welcome view (before chat starts)
  if (!hasStartedChat) {
    return (
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          {/* Background accents */}
          <Image
            src="/container-icon.svg"
            alt=""
            width={282}
            height={241}
            className="-right-16 pointer-events-none absolute bottom-0 z-0 select-none"
            aria-hidden="true"
          />
          <Image
            src="/container-icon-2.svg"
            alt=""
            width={40}
            height={39}
            className="pointer-events-none absolute top-6 right-1/4 z-0 select-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Header with Welcome Badge */}
            <div className="flex flex-wrap items-center gap-2 px-6 pt-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="font-medium text-blue-600 text-sm">
                  Welcome Back
                </span>
              </div>
              {expertTopic && (
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
              )}
            </div>

            {/* Main Content - Centered */}
            <div className="flex flex-1 flex-col items-center justify-center px-8">
              {/* Mascot */}
              <div className="mb-6 drop-shadow-lg">
                {soliImage && !isLoading ? (
                  <Image
                    key={soliImage}
                    src={soliImage}
                    alt="Soli mascot"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                ) : (
                  <Skeleton className="h-[120px] w-[120px] rounded-full border border-gray-300 bg-gray-100" />
                )}
              </div>

              {/* Greeting */}
              <h1 className="mb-8 text-center font-semibold text-4xl text-gray-800">
                Hey {firstName}, how's it going?
              </h1>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="mb-6 w-full">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-4 shadow-sm">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me anything..."
                    disabled={isCreatingSession}
                    className="flex-1 bg-transparent text-base text-gray-600 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
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

              {/* Quick Response Buttons (plain button so hover uses response.color like chat view) */}
              <div className="flex flex-wrap justify-center gap-3">
                {QUICK_RESPONSES.map((response) => (
                  <button
                    key={response.text}
                    type="button"
                    disabled={isCreatingSession}
                    className={cn(
                      "rounded-full border px-5 py-3 font-medium text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                      response.color,
                    )}
                    onClick={() => handleSubmit(undefined, response.text)}
                  >
                    {response.text}
                  </button>
                ))}
              </div>
            </div>

            {/* FYI Banner - full width, same as chat view */}
            <div className="mb-6 w-full px-10">
              <div className="flex w-full items-center justify-center rounded-2xl bg-blue-50 px-6 py-3">
                <p className="text-center text-gray-700 text-sm">
                  <span className="font-semibold text-blue-600">FYI</span>
                  <span className="mx-1 text-blue-600">·</span>
                  Your parents, teachers, and school staff can&apos;t see this
                  chat. If I&apos;m concerned about safety, I&apos;ll bring in a
                  wellness coach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Chat view (after chat starts)
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
        {/* Background accents */}
        <Image
          src="/container-icon.svg"
          alt=""
          width={282}
          height={241}
          className="-right-16 pointer-events-none absolute bottom-0 z-0 select-none"
          aria-hidden="true"
        />
        <Image
          src="/container-icon-2.svg"
          alt=""
          width={40}
          height={39}
          className="pointer-events-none absolute top-6 right-1/4 z-0 select-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header with Online Badge and Switch button */}
          <div className="flex flex-col gap-2 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span className="font-medium text-green-600 text-sm">
                    Online
                  </span>
                </div>
                {!expertTopic &&
                  subject &&
                  (() => {
                    const subtopic = EXPLORE_TOPICS.flatMap(
                      (t) => t.subcategories ?? [],
                    ).find((s) => s.title === subject);
                    return (
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2">
                        {subtopic ? (
                          <Image
                            src={subtopic.icon}
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                        )}
                        <span className="font-medium text-gray-600 text-sm">
                          Expert Chat: {subject}
                        </span>
                      </div>
                    );
                  })()}
              </div>
              {!isWaitingForCoach && wellnessCoachMessages.length === 0 && (
                <button
                  onClick={() => setShowWellnessCoachModal(true)}
                  className="text-primary text-sm hover:underline"
                >
                  Switch to Wellness Coach
                </button>
              )}
            </div>
            {expertTopic && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2">
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
            )}
          </div>

          {/* Messages Area */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="mx-auto max-w-5xl space-y-4">
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
                        "max-w-[80%] rounded-2xl px-4 py-3",
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
                <div className="w-full rounded-lg border border-primary/20 bg-primary/5 py-2 text-center font-regular text-black text-sm">
                  {coachFirstName ? (
                    <>
                      You&apos;re now connected with{" "}
                      <span className="font-bold">{coachFirstName}</span>
                    </>
                  ) : (
                    <>
                      You&apos;re now connected to a{" "}
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
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      msg.author === "student"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isStreaming &&
                messages[messages.length - 1]?.role !== "model" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-gray-100 px-4 py-3 text-gray-500 text-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              {/* Waiting for Wellness Coach - centered Soli + message + countdown */}
              {isWaitingForCoach && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-6 drop-shadow-lg">
                    {soliImage && !isLoading ? (
                      <Image
                        src={soliImage}
                        alt="Soli mascot"
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    ) : (
                      <Skeleton className="h-[120px] w-[120px] rounded-full border border-gray-300 bg-gray-100" />
                    )}
                  </div>
                  <p className="mb-2 text-center font-medium text-gray-700 text-lg">
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

          {/* Chat Input and Suggested Prompts at Bottom */}
          <div className="border-t bg-white/50 px-6 py-4">
            <form onSubmit={handleSubmit} className="w-full">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border bg-white px-4 py-3 shadow-sm",
                  isWaitingForCoach
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                    : "border-gray-200",
                )}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me anything..."
                  className="flex-1 bg-transparent text-gray-600 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isWaitingForCoach}
                />
                <button
                  type="submit"
                  disabled={
                    isStreaming ||
                    isWaitingForCoach ||
                    isCreatingSession ||
                    !message.trim()
                  }
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
            {/* Suggested prompt pills - disabled when waiting for coach */}
            <div className="mt-3 flex min-w-0 flex-nowrap justify-evenly gap-2 overflow-x-auto overflow-y-hidden pb-1">
              {QUICK_RESPONSES.map((response) => (
                <button
                  key={response.text}
                  type="button"
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 font-medium text-gray-800 text-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
                    response.color,
                  )}
                  onClick={() => handleSubmit(undefined, response.text)}
                  disabled={isStreaming || isWaitingForCoach}
                >
                  {response.text}
                </button>
              ))}
            </div>
            {/* FYI Banner - same styling as first screen */}
            <div className="mt-4 w-full">
              <div className="flex w-full items-center justify-center rounded-2xl bg-blue-50 px-6 py-3">
                <p className="text-center text-gray-700 text-sm">
                  <span className="font-semibold text-blue-600">FYI</span>
                  <span className="mx-1 text-blue-600">·</span>
                  Your parents, teachers, and school staff can&apos;t see this
                  chat. If I&apos;m concerned about safety, I&apos;ll bring in a
                  wellness coach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Wellness Coach Modal */}
      {showWellnessCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
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
                  What's making you want to talk to a person?
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
                      onClick={() => setWellnessCoachReason(reason)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        wellnessCoachReason === reason
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          wellnessCoachReason === reason
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {wellnessCoachReason === reason && (
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
                      </div>
                      <span className="text-gray-700">{reason}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
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
                  What's it about?
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
                      onClick={() => setWellnessCoachTopic(topic)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        wellnessCoachTopic === topic
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          wellnessCoachTopic === topic
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {wellnessCoachTopic === topic && (
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
                      </div>
                      <span className="text-gray-700">{topic}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <button
                      type="button"
                      onClick={() => setWellnessCoachTopic("Something else")}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        wellnessCoachTopic === "Something else"
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
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
                    onClick={async () => {
                      if (!sessionId) {
                        toast.error("Please start a chat first");
                        return;
                      }
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
    </main>
  );
}
