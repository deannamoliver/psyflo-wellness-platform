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
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Flame,
  Loader2,
  MessageCircle,
  PenLine,
  Settings,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { Skeleton } from "@/lib/core-ui/skeleton";
import Mood from "@/lib/emotion/mood";
import { getWellnessCheckData } from "@/lib/screener/actions";
import WellnessCheckModal from "@/lib/screener/wellness-check-modal";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { getInitials } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import {
  getSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";
import {
  type MoodName,
  normalizeEmotionToMoodName,
} from "./sidebar-data";
import { MoodSentimentSummary } from "./journal-entry";
import type {
  StoredAssessment,
  StoredExercise,
} from "@/app/dashboard/~lib/provider-data-actions";

type Session = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

type DesktopHomeViewProps = {
  firstName: string;
  fullName: string;
  userEmail: string;
  sessions: Session[];
  soliStateData: SoliStateData;
  onSelectSession: (sessionId: string) => void;
  todoExercises?: StoredExercise[];
  todoAssessments?: StoredAssessment[];
};

export default function DesktopHomeView({
  firstName,
  fullName,
  userEmail,
  sessions,
  soliStateData,
  onSelectSession,
  todoExercises = [],
  todoAssessments = [],
}: DesktopHomeViewProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(fullName, 2);

  useEffect(() => {
    if (showProfileMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setShowProfileMenu(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);
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

  const unreadCount = sessions.filter((s) => s.hasUnread).length;

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


  const { rangeLabel, daysInRange, todayStart } = useMemo(() => {
    const now = new Date();
    const cws = startOfWeek(now, { weekStartsOn: 0 });
    const bs = startOfWeek(subWeeks(cws, weekOffset), { weekStartsOn: 0 });
    const be = endOfWeek(subWeeks(cws, weekOffset), { weekStartsOn: 0 });
    return {
      rangeLabel: `${format(bs, "MMM d")} - ${format(be, "MMM d")}`,
      daysInRange: Array.from({ length: 7 }, (_, i) => addDays(bs, i)),
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
        if ((error as Error).name !== "AbortError") console.error("Error:", error);
      } finally {
        if (isMounted) setIsMoodHistoryLoading(false);
      }
    };
    load();
    return () => { isMounted = false; controller.abort(); };
  }, [weekOffset]);

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

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <WellnessCheckModal isOpen={showWellnessModal} onClose={() => setShowWellnessModal(false)} onComplete={() => setWellnessCheckStatus("completed")} />
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ─── Hero + Profile ─── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            {soliImage && !isLoading ? (
              <div className="relative">
                <Image src={soliImage} alt="Soli" width={80} height={80} className="object-contain drop-shadow-lg" />
                {soliStateData.streak > 0 && (
                  <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow">{soliStateData.streak}🔥</span>
                )}
              </div>
            ) : (
              <Skeleton className="h-20 w-20 rounded-full bg-gray-200" />
            )}
            <div>
              <p className="text-gray-500 text-sm">Welcome back,</p>
              <h1 className="font-bold text-3xl text-gray-900">{firstName}</h1>
              <p className="mt-1 text-gray-500 text-sm">{soliStateData.statusText}</p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white">
                {initials}
              </div>
              <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", showProfileMenu && "rotate-90")} />
            </button>

            {showProfileMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-white py-2 shadow-lg border border-gray-100"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-sm text-gray-900">{fullName}</div>
                  {userEmail && <div className="text-xs text-gray-500">{userEmail}</div>}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); router.push("/dashboard/student/settings?tab=account"); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 text-gray-400" /> Settings
                  </button>
                  <a
                    href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl"
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MessageCircle className="h-4 w-4 text-gray-400" /> Send Feedback
                  </a>
                  <Link
                    href="/dashboard/student/settings?tab=resources"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    Emergency Resources
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); setIsLogoutModalOpen(true); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-4 w-4 text-gray-400" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <LogoutModal open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen} />

        {/* ─── To Do (daily tasks + provider-assigned exercises & assessments) ─── */}
        {(() => {
          const activeExercises = todoExercises.filter((e) => e.status === "active");
          const completedExercises = todoExercises.filter((e) => e.status === "completed");
          const activeAssessments = todoAssessments.filter((a) => a.status === "active" || a.status === "paused");
          const completedAssessments = todoAssessments.filter((a) => a.status === "completed");
          const pendingDailyCount = startYourDayItems.filter((i) => !i.done).length;
          const doneDailyCount = startYourDayItems.filter((i) => i.done).length;
          const pendingCount = pendingDailyCount + activeExercises.length + activeAssessments.length;
          const doneCount = doneDailyCount + completedExercises.length + completedAssessments.length;

          return (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">To Do</h3>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {pendingCount} pending
                    </span>
                  )}
                </div>
                {doneCount > 0 && (
                  <span className="text-[11px] text-gray-400">{doneCount} completed</span>
                )}
              </div>

              <div className="space-y-2">
                {/* Start Your Day items */}
                {startYourDayItems.map((item) => (
                  <div
                    key={`daily-${item.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all",
                      item.done
                        ? "border-gray-50 bg-gray-50/50"
                        : "border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20",
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.done ? "bg-emerald-50" : "bg-emerald-50",
                    )}>
                      {item.done
                        ? <Check className="h-4 w-4 text-emerald-600" />
                        : item.icon && !isLoading
                          ? <Image src={item.icon} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                          : <Skeleton className="h-5 w-5 rounded-full bg-gray-100" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium", item.done ? "text-gray-400 line-through" : "text-gray-900")}>{item.title}</p>
                      <p className="text-[10px] text-gray-400">Daily</p>
                    </div>
                    {item.done ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Done</span>
                    ) : (
                      <>
                        {item.id === 2 && (
                          <button onClick={() => setShowWellnessModal(true)} className="shrink-0 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-semibold text-white hover:bg-blue-600 transition-colors">Start</button>
                        )}
                        {item.id !== 2 && (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">To Do</span>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Active exercises */}
                {activeExercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    href="/dashboard/student/exercises"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-2.5 transition-all hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{exercise.topicName}</p>
                      <p className="text-[10px] text-gray-400">{exercise.categoryName} · {exercise.frequency}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      To Do
                    </span>
                  </Link>
                ))}

                {/* Active assessments */}
                {activeAssessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href="/dashboard/student/exercises"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-2.5 transition-all hover:border-violet-200 hover:bg-violet-50/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                      <ClipboardList className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{assessment.title}</p>
                      <p className="text-[10px] text-gray-400">{assessment.frequency} · Due {assessment.nextDue}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                      To Do
                    </span>
                  </Link>
                ))}

                {/* Completed exercises */}
                {completedExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-50 bg-gray-50/50 px-3.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-400 line-through">{exercise.topicName}</p>
                      <p className="text-[10px] text-gray-300">{exercise.categoryName}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Done
                    </span>
                  </div>
                ))}

                {/* Completed assessments */}
                {completedAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-50 bg-gray-50/50 px-3.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-400 line-through">{assessment.title}</p>
                      <p className="text-[10px] text-gray-300">{assessment.frequency}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ─── Badges (compact) ─── */}
        {(() => {
          const totalCompleted = 38;
          const overallProgress = 35;
          const badges = [
            { id: "b1", title: "First Step", icon: <Star className="h-3 w-3 text-amber-600" />, earned: totalCompleted >= 1, color: "bg-amber-100" },
            { id: "b2", title: "Warrior", icon: <Flame className="h-3 w-3 text-orange-600" />, earned: totalCompleted >= 10, color: "bg-orange-100" },
            { id: "b3", title: "Consistent", icon: <Target className="h-3 w-3 text-blue-600" />, earned: totalCompleted >= 25, color: "bg-blue-100" },
            { id: "b4", title: "Halfway", icon: <Award className="h-3 w-3 text-violet-600" />, earned: overallProgress >= 50, color: "bg-violet-100" },
            { id: "b5", title: "Superstar", icon: <Trophy className="h-3 w-3 text-emerald-600" />, earned: totalCompleted >= 50, color: "bg-emerald-100" },
            { id: "b6", title: "Champion", icon: <Sparkles className="h-3 w-3 text-pink-600" />, earned: overallProgress >= 100, color: "bg-pink-100" },
          ];
          const earnedCount = badges.filter((b) => b.earned).length;
          return (
            <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-3">
                <h3 className="shrink-0 text-xs font-semibold text-gray-800">Badges</h3>
                <div className="flex items-center gap-2 flex-1">
                  {badges.map((b) => (
                    <div key={b.id} className={cn("flex h-6 w-6 items-center justify-center rounded-md", b.earned ? b.color : "bg-gray-100 opacity-40")} title={b.title}>
                      {b.icon}
                    </div>
                  ))}
                </div>
                <span className="shrink-0 text-[10px] text-gray-400">{earnedCount}/{badges.length}</span>
              </div>
            </div>
          );
        })()}

        {/* ─── Quick Nav ─── */}
        <div className="grid grid-cols-4 gap-3">
          <Link href="/dashboard/student/chat" className="block group">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
              </div>
              <span className="font-medium text-gray-700 text-xs">Chat</span>
            </div>
          </Link>
          <Link href="/dashboard/student/exercises" className="block group">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <Dumbbell className="h-6 w-6 text-violet-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs">Exercises</span>
            </div>
          </Link>
          <Link href="/dashboard/student/journal" className="block group">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <PenLine className="h-6 w-6 text-amber-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs">Journal</span>
            </div>
          </Link>
          <Link href="/dashboard/student/settings?tab=resources" className="block group">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </div>
              <span className="font-medium text-gray-700 text-xs">Get Help</span>
            </div>
          </Link>
        </div>

        {/* ─── Two-column: Mood History + Recent Chats ─── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Mood History</h3>
            <div className="mb-3 flex items-center gap-1">
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setWeekOffset((p) => p + 1)}><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-gray-600 text-xs">{rangeLabel}</span>
              <button className={cn("text-gray-400 hover:text-gray-600", weekOffset === 0 && "cursor-not-allowed opacity-40")} onClick={() => setWeekOffset((p) => Math.max(0, p - 1))} disabled={weekOffset === 0}><ChevronRight className="h-4 w-4" /></button>
              {isMoodHistoryLoading && <Loader2 className="ml-1 h-3 w-3 animate-spin text-gray-400" />}
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-x-1 gap-y-2">
              {daysInRange.map((date, i) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const mood = moodByDate[dateKey];
                const isFuture = isAfter(startOfDay(date), todayStart);
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-gray-500 text-xs">{format(date, "EEEEE")}</span>
                    {isFuture ? <div className="h-7 w-7" /> : mood ? <Mood mood={mood} withShadow={false} className="h-7 w-7" /> : <div className="h-7 w-7 rounded-full bg-gray-200" />}
                  </div>
                );
              })}
            </div>
            <MoodSentimentSummary moodByDate={moodByDate} />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Recent Chats</h3>
              <Link href="/dashboard/student/chat" className="text-blue-600 text-xs font-medium hover:underline">View all</Link>
            </div>
            {sessions.length > 0 ? (
              <div className="space-y-1">
                {sessions.slice(0, 5).map((session) => (
                  <button key={session.id} onClick={() => onSelectSession(session.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-gray-50">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", session.hasUnread ? "bg-blue-100" : "bg-gray-100")}>
                      <MessageCircle className={cn("h-4 w-4", session.hasUnread ? "text-blue-600" : "text-gray-400")} />
                    </div>
                    <span className={cn("flex-1 truncate text-sm", session.hasUnread ? "font-semibold text-gray-900" : "text-gray-600")}>{session.title}</span>
                    {session.hasUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No conversations yet. Start a chat with Soli!</p>
            )}
          </div>
        </div>

        {/* ─── Feedback (compact) ─── */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
          {feedbackStatus === "success" ? (
            <span className="text-sm text-gray-500">Thanks for your feedback!</span>
          ) : (
            <>
              <span className="text-sm text-gray-500">Is Soli helpful?</span>
              <div className="flex items-center gap-3">
                <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-emerald-600 disabled:opacity-50" disabled={isSubmittingFeedback} onClick={() => handleFeedback(true)}>
                  {isSubmittingFeedback && activeFeedback === "up" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                </button>
                <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-rose-600 disabled:opacity-50" disabled={isSubmittingFeedback} onClick={() => handleFeedback(false)}>
                  {isSubmittingFeedback && activeFeedback === "down" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                </button>
                <a href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Ideas?</a>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
