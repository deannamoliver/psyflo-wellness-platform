"use client";

import {
  ArrowLeft,
  Check,
  Loader2,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/tailwind-utils";

// ─── Exercise Data (mirrors parent page) ─────────────────────────────

type ExerciseInfo = {
  id: string;
  name: string;
  modality: "cbt" | "dbt";
  domainLabel: string;
  description: string;
  totalSteps: number;
};

const EXERCISE_MAP: Record<string, ExerciseInfo> = {
  "cbt-thought-record": {
    id: "cbt-thought-record",
    name: "Thought Record",
    modality: "cbt",
    domainLabel: "Cognitive Restructuring",
    description: "Identify and challenge automatic negative thoughts using a structured thought record.",
    totalSteps: 7,
  },
  "cbt-cognitive-distortion": {
    id: "cbt-cognitive-distortion",
    name: "Cognitive Distortion Identification",
    modality: "cbt",
    domainLabel: "Cognitive Restructuring",
    description: "Learn to recognize common cognitive distortions in your daily thinking patterns.",
    totalSteps: 5,
  },
  "cbt-behavioral-activation": {
    id: "cbt-behavioral-activation",
    name: "Behavioral Activation",
    modality: "cbt",
    domainLabel: "Behavioral Techniques",
    description: "Schedule and engage in positive activities to counteract withdrawal and low mood.",
    totalSteps: 5,
  },
  "cbt-worry-time": {
    id: "cbt-worry-time",
    name: "Structured Worry Time",
    modality: "cbt",
    domainLabel: "Anxiety Management",
    description: "Contain anxiety by scheduling a specific time to process worries.",
    totalSteps: 5,
  },
  "cbt-urge-surfing": {
    id: "cbt-urge-surfing",
    name: "Urge Surfing",
    modality: "cbt",
    domainLabel: "Craving Management",
    description: "Ride out cravings without acting on them using mindful observation.",
    totalSteps: 6,
  },
  "cbt-trigger-mapping": {
    id: "cbt-trigger-mapping",
    name: "Trigger Mapping",
    modality: "cbt",
    domainLabel: "Self-Awareness",
    description: "Identify personal triggers and create a proactive response plan.",
    totalSteps: 5,
  },
  "dbt-distress-tolerance": {
    id: "dbt-distress-tolerance",
    name: "TIPP Skills",
    modality: "dbt",
    domainLabel: "Distress Tolerance",
    description: "Temperature, Intense exercise, Paced breathing, Paired muscle relaxation for crisis moments.",
    totalSteps: 5,
  },
  "dbt-wise-mind": {
    id: "dbt-wise-mind",
    name: "Wise Mind Meditation",
    modality: "dbt",
    domainLabel: "Mindfulness",
    description: "Access your Wise Mind — the integration of Emotion Mind and Reasonable Mind.",
    totalSteps: 8,
  },
  "dbt-emotion-surfing": {
    id: "dbt-emotion-surfing",
    name: "Emotion Surfing",
    modality: "dbt",
    domainLabel: "Mindfulness",
    description: "Observe emotions as waves that rise, peak, and fall — without acting on them.",
    totalSteps: 8,
  },
  "dbt-opposite-action": {
    id: "dbt-opposite-action",
    name: "Opposite Action",
    modality: "dbt",
    domainLabel: "Emotion Regulation",
    description: "When an emotion is unjustified, act opposite to the emotional urge to change how you feel.",
    totalSteps: 6,
  },
};

const MODALITY_COLORS = {
  cbt: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  dbt: { bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

// ─── Chat Message Type ───────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ─── Main Page ───────────────────────────────────────────────────────

export default function InteractiveExercisePage() {
  const params = useParams();
  const exerciseId = (params["exerciseId"] as string) ?? "";
  const exercise = EXERCISE_MAP[exerciseId] ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Parse step number from assistant messages
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      const stepMatch = lastAssistant.content.match(/Step\s+(\d+)\s+of\s+(\d+)/i);
      if (stepMatch?.[1]) {
        setCurrentStep(parseInt(stepMatch[1], 10));
      }
      // Check for completion indicators
      if (
        lastAssistant.content.toLowerCase().includes("great job completing") ||
        lastAssistant.content.toLowerCase().includes("you've completed") ||
        lastAssistant.content.toLowerCase().includes("exercise complete") ||
        lastAssistant.content.toLowerCase().includes("well done") && lastAssistant.content.toLowerCase().includes("finish")
      ) {
        setIsComplete(true);
      }
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (userMessage?: string) => {
      if (!exercise) return;

      const messageToSend = userMessage ?? input.trim();
      if (!messageToSend && isStarted) return;

      const newUserMessage: ChatMessage | null = isStarted
        ? { id: `user-${Date.now()}`, role: "user", content: messageToSend }
        : null;

      const updatedMessages = newUserMessage
        ? [...messages, newUserMessage]
        : messages;

      if (newUserMessage) {
        setMessages(updatedMessages);
      }
      setInput("");
      setIsLoading(true);

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/exercises/guided", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            exerciseDescription: exercise.description,
            exerciseModality: exercise.modality,
            messages: apiMessages,
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");

        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I had trouble processing that. Could you try again?",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [exercise, input, isStarted, messages],
  );

  const handleStart = useCallback(() => {
    setIsStarted(true);
    sendMessage("I'm ready to start this exercise.");
  }, [sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  if (!exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center space-y-3">
          <p className="text-gray-500">Exercise not found</p>
          <Link href="/dashboard/student/exercises" className="text-blue-600 text-sm font-medium hover:underline">
            Back to exercises
          </Link>
        </div>
      </div>
    );
  }

  const colors = MODALITY_COLORS[exercise.modality];
  const progressPercent = exercise.totalSteps > 0 ? Math.min((currentStep / exercise.totalSteps) * 100, 100) : 0;

  // ─── Pre-start screen ───
  if (!isStarted) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
          {/* Back */}
          <Link href="/dashboard/student/exercises" className="mb-6 flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back to exercises
          </Link>

          <div className="flex flex-1 flex-col items-center justify-center text-center space-y-6">
            {/* Exercise icon */}
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-3xl", colors.light)}>
              <Sparkles className={cn("h-10 w-10", colors.text)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", colors.light, colors.text)}>
                  {exercise.modality}
                </span>
                <span className="text-xs text-gray-400">{exercise.domainLabel}</span>
              </div>
              <h1 className="font-bold text-2xl text-gray-900">{exercise.name}</h1>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{exercise.description}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{exercise.totalSteps} steps</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>AI-guided</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>Interactive</span>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl",
                colors.bg,
              )}
            >
              <Sparkles className="h-5 w-5" />
              Begin Exercise
            </button>

            <p className="text-[11px] text-gray-400 max-w-xs">
              You'll be guided through this exercise step-by-step with AI support. You can stop at any time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Interactive exercise session ───
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link href="/dashboard/student/exercises" className="shrink-0 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-sm text-gray-900">{exercise.name}</p>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase", colors.light, colors.text)}>
                {exercise.modality}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", colors.bg)}
                  style={{ width: `${isComplete ? 100 : progressPercent}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-medium text-gray-400">
                {isComplete ? "Done!" : `${currentStep}/${exercise.totalSteps}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", colors.light)}>
                      <Sparkles className={cn("h-3 w-3", colors.text)} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">AI Guide</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 rounded-bl-md">
                <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", colors.light)}>
                  <Sparkles className={cn("h-3 w-3", colors.text)} />
                </div>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── Completion Banner ─── */}
      {isComplete && (
        <div className="border-t border-emerald-100 bg-emerald-50 px-4 py-4">
          <div className="mx-auto max-w-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Exercise Complete!</p>
                <p className="text-emerald-600 text-[11px]">Great work on this session</p>
              </div>
            </div>
            <Link
              href="/dashboard/student/exercises"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5" />
              Done
            </Link>
          </div>
        </div>
      )}

      {/* ─── Input Area ─── */}
      {!isComplete && (
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-lg items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                input.trim() && !isLoading
                  ? `${colors.bg} text-white hover:opacity-90`
                  : "bg-gray-100 text-gray-400",
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mx-auto max-w-lg mt-1.5 text-center text-[10px] text-gray-400">
            AI-guided session · Your responses are private
          </p>
        </div>
      )}
    </div>
  );
}
