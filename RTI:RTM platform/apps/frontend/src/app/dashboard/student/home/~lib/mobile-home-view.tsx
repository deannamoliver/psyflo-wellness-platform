"use client";

import {
  addDays,
  endOfWeek,
  format,
  isAfter,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Loader2,
  MessageCircle,
  PenLine,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WellnessCoachMessage } from "@/lib/chat/types";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { Skeleton } from "@/lib/core-ui/skeleton";
import Mood from "@/lib/emotion/mood";
import { getWellnessCheckData } from "@/lib/screener/actions";
import WellnessCheckModal from "@/lib/screener/wellness-check-modal";
import { cn } from "@/lib/tailwind-utils";
import {
  getSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";
import { type ExpertTopic, useExpertTopic } from "./expert-topic-context";
import MobileChat from "./mobile-chat";
import MobileHeader from "./mobile-header";
import {
  type MoodName,
  normalizeEmotionToMoodName,
} from "./sidebar-data";
import { MoodSentimentSummary } from "./journal-entry";

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
  onSessionCreated: _onSessionCreated,
  onRealtimeRefreshSession,
  isLoadingChat = false,
  expertTopic,
  activeSubject,
}: MobileHomeViewProps) {
  useExpertTopic();
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [soliColor, setSoliColor] = useState<string | null>(null);
  const [soliShape, setSoliShape] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessCheckStatus, setWellnessCheckStatus] = useState<"none" | "available" | "completed">("none");
  const [weekOffset, setWeekOffset] = useState(0);
  const [moodByDate, setMoodByDate] = useState<Record<string, MoodName | null>>({});
  const [isMoodHistoryLoading, setIsMoodHistoryLoading] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeFeedback, setActiveFeedback] = useState<"up" | "down" | null>(null);

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
          setSoliImage(getSoliImage(storedColor, storedShape, soliStateData.state));
          setIsLoading(false);
        }
      } else {
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;
          if (settings) {
            setSoliColor(settings.soliColor);
            setSoliShape(settings.soliShape);
            setSoliImage(getSoliImage(settings.soliColor, settings.soliShape, soliStateData.state));
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    checkAndLoad();
    return () => { isMounted = false; };
  }, [soliStateData.state]);

  // Check wellness availability
  useEffect(() => {
    const check = async () => {
      try {
        const data = await getWellnessCheckData();
        if (data.completedToday) setWellnessCheckStatus("completed");
        else if (data.responses.length === 0) setWellnessCheckStatus("none");
        else {
          const allAnswered = data.responses.every((r) => r.answerCode !== null);
          setWellnessCheckStatus(allAnswered ? "completed" : "available");
        }
      } catch { setWellnessCheckStatus("none"); }
    };
    check();
  }, []);


  // Mood history
  const { rangeLabel, daysInRange, todayStart } = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const blockStart = startOfWeek(subWeeks(currentWeekStart, weekOffset), { weekStartsOn: 0 });
    const blockEnd = endOfWeek(subWeeks(currentWeekStart, weekOffset), { weekStartsOn: 0 });
    return {
      rangeLabel: `${format(blockStart, "MMM d")} - ${format(blockEnd, "MMM d")}`,
      daysInRange: Array.from({ length: 7 }, (_, i) => addDays(blockStart, i)),
      todayStart: startOfDay(now),
    };
  }, [weekOffset]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const load = async () => {
      setIsMoodHistoryLoading(true);
      setMoodByDate({});
      try {
        const response = await fetch(`/api/mood-history?weekOffset=${weekOffset}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        if (!isMounted) return;
        const dayMap: Record<string, MoodName | null> = {};
        for (const entry of data.entries) {
          const moodName = normalizeEmotionToMoodName(entry.mood, entry.specificMood);
          if (!moodName) continue;
          dayMap[format(new Date(entry.date), "yyyy-MM-dd")] = moodName;
        }
        setMoodByDate(dayMap);
      } catch (error) {
        if ((error as Error).name !== "AbortError") console.error("Error loading mood history:", error);
      } finally {
        if (isMounted) setIsMoodHistoryLoading(false);
      }
    };
    load();
    return () => { isMounted = false; controller.abort(); };
  }, [weekOffset]);

  // Start Your Day items
  const startYourDayItems = [
    { id: 1, title: "Daily Mood Check-In", icon: soliColor && soliShape ? `/images/start-your-day/soli_mood_checkin_${soliColor}_${soliShape}.svg` : null, done: true },
    ...(wellnessCheckStatus !== "none" ? [{ id: 2, title: "Wellness Check", icon: soliColor && soliShape ? `/images/start-your-day/soli_wellness_check_${soliColor}_${soliShape}.svg` : null, done: wellnessCheckStatus === "completed" }] : []),
  ];

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      setActiveFeedback(isHelpful ? "up" : "down");
      setIsSubmittingFeedback(true);
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isHelpful }) });
      if (!response.ok) throw new Error("Failed");
      setFeedbackStatus("success");
    } catch { setFeedbackStatus("error"); } finally { setIsSubmittingFeedback(false); setActiveFeedback(null); }
  };

  // Show mobile chat view when user taps into a chat
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

  // ─── Clean, minimal home dashboard ───
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:hidden">
      <MobileHeader fullName={fullName} userEmail={userEmail} />
      <WellnessCheckModal
        isOpen={showWellnessModal}
        onClose={() => setShowWellnessModal(false)}
        onComplete={() => setWellnessCheckStatus("completed")}
      />

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 via-[#EDF2F9] to-[#EDF2F9]">
        <div className="mx-auto max-w-lg px-4 py-5 space-y-5">

          {/* ─── Hero Greeting ─── */}
          <div className="flex items-center gap-4">
            {soliImage && !isLoading ? (
              <div className="relative">
                <Image src={soliImage} alt="Soli" width={72} height={72} className="object-contain drop-shadow-md" />
                {soliStateData.streak > 0 && (
                  <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                    {soliStateData.streak}🔥
                  </span>
                )}
              </div>
            ) : (
              <Skeleton className="h-[72px] w-[72px] rounded-full bg-gray-200" />
            )}
            <div>
              <p className="text-gray-500 text-sm">Good to see you,</p>
              <h1 className="font-bold text-2xl text-gray-900">{firstName}</h1>
              <p className="mt-0.5 text-gray-500 text-xs">{soliStateData.statusText}</p>
            </div>
          </div>

          {/* ─── Soli Energy ─── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-800">Soli Energy</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image key={i} src="/soli-heart.svg" alt="" width={16} height={16} className={cn("h-4 w-4", i > soliStateData.heartCount && "opacity-25")} />
                ))}
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(5, soliStateData.heartCount)) * 20}%` }} />
            </div>
          </div>

          {/* ─── Badges ─── */}
          {(() => {
            const totalCompleted = 38;
            const overallProgress = 35;
            const badges = [
              { id: "b1", title: "First Step", icon: <Star className="h-3.5 w-3.5 text-amber-600" />, earned: totalCompleted >= 1, progress: Math.min(totalCompleted, 1), target: 1, color: "bg-amber-100" },
              { id: "b2", title: "Warrior", icon: <Flame className="h-3.5 w-3.5 text-orange-600" />, earned: totalCompleted >= 10, progress: Math.min(totalCompleted, 10), target: 10, color: "bg-orange-100" },
              { id: "b3", title: "Consistent", icon: <Target className="h-3.5 w-3.5 text-blue-600" />, earned: totalCompleted >= 25, progress: Math.min(totalCompleted, 25), target: 25, color: "bg-blue-100" },
              { id: "b4", title: "Halfway", icon: <Award className="h-3.5 w-3.5 text-violet-600" />, earned: overallProgress >= 50, progress: overallProgress, target: 50, color: "bg-violet-100" },
              { id: "b5", title: "Superstar", icon: <Trophy className="h-3.5 w-3.5 text-emerald-600" />, earned: totalCompleted >= 50, progress: Math.min(totalCompleted, 50), target: 50, color: "bg-emerald-100" },
              { id: "b6", title: "Champion", icon: <Sparkles className="h-3.5 w-3.5 text-pink-600" />, earned: overallProgress >= 100, progress: overallProgress, target: 100, color: "bg-pink-100" },
            ];
            const earnedCount = badges.filter((b) => b.earned).length;
            return (
              <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-xs text-gray-800">My Badges</h3>
                  <span className="text-[10px] text-gray-400">{earnedCount}/{badges.length}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {badges.map((b) => (
                    <div key={b.id} className="flex flex-col items-center gap-0.5">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", b.earned ? b.color : "bg-gray-100 opacity-40")}>
                        {b.icon}
                      </div>
                      <span className={cn("text-[8px] font-medium text-center leading-tight", b.earned ? "text-gray-700" : "text-gray-400")}>{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ─── Start Your Day ─── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Start Your Day</h3>
            <div className="space-y-2">
              {startYourDayItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1.5">
                  <div className="flex h-5 w-5 items-center justify-center">
                    {item.done ? (
                      <Image src="/check-home.svg" alt="Done" width={20} height={20} className="h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-300 bg-white" />
                    )}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                    {item.icon && !isLoading ? (
                      <Image src={item.icon} alt={item.title} width={36} height={36} className="h-9 w-9 object-contain" />
                    ) : (
                      <Skeleton className="h-9 w-9 rounded-full bg-gray-100" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">{item.title}</span>
                  {item.id === 2 && !item.done && (
                    <button onClick={() => setShowWellnessModal(true)} className="rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white">
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Quick Navigation Cards ─── */}
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/dashboard/student/chat" className="block">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700 text-[11px]">Chat</span>
              </div>
            </Link>
            <Link href="/dashboard/student/exercises" className="block">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <Dumbbell className="h-5 w-5 text-violet-600" />
                </div>
                <span className="font-medium text-gray-700 text-[11px]">Exercises</span>
              </div>
            </Link>
            <Link href="/dashboard/student/journal" className="block">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <PenLine className="h-5 w-5 text-amber-600" />
                </div>
                <span className="font-medium text-gray-700 text-[11px]">Journal</span>
              </div>
            </Link>
          </div>

          {/* ─── Mood History ─── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Mood History</h3>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setWeekOffset((p) => p + 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-gray-600 text-xs">{rangeLabel}</span>
                <button className={cn("text-gray-400 hover:text-gray-600", weekOffset === 0 && "cursor-not-allowed opacity-40")} onClick={() => setWeekOffset((p) => Math.max(0, p - 1))} disabled={weekOffset === 0}>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {isMoodHistoryLoading && <Loader2 className="ml-1 h-3 w-3 animate-spin text-gray-400" />}
              </div>
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-x-1 gap-y-2">
              {daysInRange.map((date, i) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const mood = moodByDate[dateKey];
                const isFuture = isAfter(startOfDay(date), todayStart);
                return (
                  <div key={i} className="flex flex-col items-center justify-between gap-2">
                    <span className="text-gray-500 text-xs">{format(date, "EEEEE")}</span>
                    {isFuture ? (
                      <div className="h-7 w-7" />
                    ) : mood ? (
                      <Mood mood={mood} withShadow={false} className="h-7 w-7" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
            <MoodSentimentSummary moodByDate={moodByDate} />
          </div>

          {/* ─── Feedback (compact) ─── */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            {feedbackStatus === "success" ? (
              <span className="text-xs text-gray-500">Thanks for your feedback!</span>
            ) : (
              <>
                <span className="text-xs text-gray-500">Is Soli helpful?</span>
                <div className="flex items-center gap-2">
                  <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-emerald-600 disabled:opacity-50" disabled={isSubmittingFeedback} onClick={() => handleFeedback(true)}>
                    {isSubmittingFeedback && activeFeedback === "up" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
                  </button>
                  <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-rose-600 disabled:opacity-50" disabled={isSubmittingFeedback} onClick={() => handleFeedback(false)}>
                    {isSubmittingFeedback && activeFeedback === "down" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsDown className="h-3.5 w-3.5" />}
                  </button>
                  <a href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline">Ideas?</a>
                </div>
              </>
            )}
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
