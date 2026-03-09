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
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { Skeleton } from "@/lib/core-ui/skeleton";
import Mood from "@/lib/emotion/mood";
import { getWellnessCheckData } from "@/lib/screener/actions";
import WellnessCheckModal from "@/lib/screener/wellness-check-modal";
import { cn } from "@/lib/tailwind-utils";
import { useExpertTopic } from "./expert-topic-context";
import { JournalSection, MoodSentimentSummary } from "./journal-entry";
import {
  EXPLORE_TOPICS,
  generateTrendingTopics,
  getDeterministicTrendingTopics,
  getFireIconCount,
  isTopicFullyComingSoon,
  MOOD_NAMES,
  type MoodName,
  normalizeEmotionToMoodName,
  type TrendingTopic,
} from "./sidebar-data";

type MobileSidebarContentProps = {
  soliStateData: SoliStateData;
  soliColor: string | null;
  soliShape: string | null;
  isLoading: boolean;
};

function getStartYourDayItems(
  color: string,
  shape: string,
  exploredToday: boolean,
) {
  return [
    {
      id: 1,
      title: "Daily Mood Check-In",
      subtitle: "Check out a topic below",
      icon: `/images/start-your-day/soli_mood_checkin_${color}_${shape}.svg`,
      hasCheckmark: true,
    },
    {
      id: 2,
      title: "Wellness Check",
      subtitle: "Let's check in on your wellness",
      icon: `/images/start-your-day/soli_wellness_check_${color}_${shape}.svg`,
      hasButton: true,
    },
    {
      id: 3,
      title: "Explore",
      subtitle: "Check out a topic below",
      icon: `/images/start-your-day/soli_explorer_${color}_${shape}.svg`,
      hasCheckmark: exploredToday,
    },
  ];
}

export default function MobileSidebarContent({
  soliStateData: _soliStateData,
  soliColor,
  soliShape,
  isLoading,
}: MobileSidebarContentProps) {
  const router = useRouter();
  const { setExpertTopic, clearExpertTopic, isTopicCommitted } =
    useExpertTopic();
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessCheckStatus, setWellnessCheckStatus] = useState<
    "none" | "available" | "completed"
  >("none");
  const [showAllExploreTopics, setShowAllExploreTopics] = useState(false);
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");
  const [selectedExploreTopicId, setSelectedExploreTopicId] = useState<
    number | null
  >(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(() =>
    getDeterministicTrendingTopics(),
  );
  const [hasExploredToday, setHasExploredToday] = useState(false);

  useEffect(() => {
    setTrendingTopics(generateTrendingTopics());
  }, []);

  // Check if user has explored a topic today
  useEffect(() => {
    const checkExplored = async () => {
      try {
        const response = await fetch("/api/chat/explored-today");
        if (response.ok) {
          const data = await response.json();
          setHasExploredToday(data.explored);
        }
      } catch {
        // Ignore errors
      }
    };
    checkExplored();
  }, [isTopicCommitted]);

  // Search functionality
  const trimmedExploreSearch = exploreSearchQuery.toLowerCase().trim();
  const isExploreSearching = trimmedExploreSearch.length > 0;

  type ExploreSearchResult =
    | { type: "topic"; id: number; title: string; icon: string }
    | {
        type: "subtopic";
        id: number;
        title: string;
        icon: string;
        parentId: number;
      };

  const exploreSearchResults: ExploreSearchResult[] = isExploreSearching
    ? [
        ...EXPLORE_TOPICS.filter((topic) =>
          topic.title.toLowerCase().includes(trimmedExploreSearch),
        ).map<ExploreSearchResult>((topic) => ({
          type: "topic",
          id: topic.id,
          title: topic.title,
          icon: topic.icon,
        })),
        ...EXPLORE_TOPICS.flatMap<ExploreSearchResult>((topic) =>
          (topic.subcategories ?? [])
            .filter(
              (subtopic) =>
                subtopic.title.toLowerCase().includes(trimmedExploreSearch) ||
                subtopic.description
                  .toLowerCase()
                  .includes(trimmedExploreSearch),
            )
            .map<ExploreSearchResult>((subtopic) => ({
              type: "subtopic",
              id: subtopic.id,
              title: subtopic.title,
              icon: subtopic.icon,
              parentId: topic.id,
            })),
        ),
      ]
    : [];
  const [weekOffset, setWeekOffset] = useState(0);
  const [moodByDate, setMoodByDate] = useState<Record<string, MoodName | null>>(
    {},
  );
  const [isMoodHistoryLoading, setIsMoodHistoryLoading] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [activeFeedback, setActiveFeedback] = useState<"up" | "down" | null>(
    null,
  );

  // Check wellness availability
  useEffect(() => {
    const check = async () => {
      try {
        const data = await getWellnessCheckData();
        if (data.completedToday) {
          setWellnessCheckStatus("completed");
        } else if (data.responses.length === 0) {
          setWellnessCheckStatus("none");
        } else {
          const allAnswered = data.responses.every(
            (r) => r.answerCode !== null,
          );
          setWellnessCheckStatus(allAnswered ? "completed" : "available");
        }
      } catch {
        setWellnessCheckStatus("none");
      }
    };
    check();
  }, []);

  const { rangeLabel, daysInRange, todayStart } = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const blockStart = startOfWeek(subWeeks(currentWeekStart, weekOffset), {
      weekStartsOn: 0,
    });
    const blockEnd = endOfWeek(subWeeks(currentWeekStart, weekOffset), {
      weekStartsOn: 0,
    });
    const label = `${format(blockStart, "MMM d")} - ${format(
      blockEnd,
      "MMM d",
    )}`;
    const days = Array.from({ length: 7 }, (_, i) => addDays(blockStart, i));

    return {
      rangeLabel: label,
      daysInRange: days,
      todayStart: startOfDay(now),
    };
  }, [weekOffset]);

  // Load mood history
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const loadMoodHistory = async () => {
      setIsMoodHistoryLoading(true);
      setMoodByDate({});
      try {
        const response = await fetch(
          `/api/mood-history?weekOffset=${weekOffset}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Failed to fetch mood history");
        const data = await response.json();
        if (!isMounted) return;
        const dayMap: Record<string, MoodName | null> = {};
        for (const entry of data.entries) {
          const moodName = normalizeEmotionToMoodName(
            entry.mood,
            entry.specificMood,
          );
          if (!moodName) continue;
          const date = new Date(entry.date);
          const dateKey = format(date, "yyyy-MM-dd");
          dayMap[dateKey] = moodName;
        }
        setMoodByDate(dayMap);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error loading mood history:", error);
        }
      } finally {
        if (isMounted) setIsMoodHistoryLoading(false);
      }
    };
    loadMoodHistory();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [weekOffset]);

  const startYourDayItems = getStartYourDayItems(
    soliColor ?? "blue",
    soliShape ?? "round",
    hasExploredToday,
  )
    .filter((item) => !(item.id === 2 && wellnessCheckStatus === "none"))
    .map((item) => {
      if (item.id === 2 && wellnessCheckStatus === "completed") {
        return { ...item, hasCheckmark: true, hasButton: false };
      }
      return item;
    });

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      setActiveFeedback(isHelpful ? "up" : "down");
      setIsSubmittingFeedback(true);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful }),
      });
      if (!response.ok) throw new Error("Failed to submit feedback");
      setFeedbackStatus("success");
    } catch {
      setFeedbackStatus("error");
    } finally {
      setIsSubmittingFeedback(false);
      setActiveFeedback(null);
    }
  };

  return (
    <>
      <WellnessCheckModal
        isOpen={showWellnessModal}
        onClose={() => setShowWellnessModal(false)}
        onComplete={() => {
          setWellnessCheckStatus("completed");
          router.refresh();
        }}
      />

      {/* Start Your Day - same as desktop: no counter for Daily Mood Check-In / Wellness Check */}
      <h2 className="mt-6 mb-3 font-semibold text-gray-800 text-lg">
        Start Your Day
      </h2>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="space-y-2.5">
          {startYourDayItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center">
                  {item.hasCheckmark ? (
                    <Image
                      src="/check-home.svg"
                      alt="Completed"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-[#D0D5DD] bg-white" />
                  )}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  {soliColor && soliShape && !isLoading ? (
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <Skeleton className="h-10 w-10 rounded-full border border-gray-300 bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-[600] text-gray-900 text-sm">
                    {item.title}
                  </p>
                  {item.id === 3 && (
                    <p className="text-gray-500 text-xs">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.hasButton && (
                  <button
                    onClick={() => setShowWellnessModal(true)}
                    className="rounded-full bg-primary px-4 py-1.5 font-[600] text-white text-xs"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore */}
      <h2 className="mt-6 mb-3 font-bold text-gray-800 text-lg">Explore</h2>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for topics"
            value={exploreSearchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setExploreSearchQuery(value);
              setShowAllExploreTopics(true);
              if (value.trim().length > 0) {
                setSelectedExploreTopicId(null);
              }
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {isExploreSearching && (
          <>
            {/* Search results grid */}
            <div className="mb-4 grid grid-cols-3 gap-x-3 gap-y-4">
              {exploreSearchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="flex flex-col items-center text-center"
                  type="button"
                  onClick={() => {
                    if (result.type === "topic") {
                      const topic = EXPLORE_TOPICS.find(
                        (t) => t.id === result.id,
                      );
                      if (topic?.subcategories?.length) {
                        setSelectedExploreTopicId(topic.id);
                      }
                    } else {
                      setSelectedExploreTopicId(result.parentId);
                    }
                    setExploreSearchQuery("");
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl">
                    <Image
                      src={result.icon}
                      alt={result.title}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="mt-1 line-clamp-2 w-full text-gray-900 text-xs leading-tight">
                    {result.title}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="mb-2 w-full text-center text-primary text-sm"
              type="button"
              onClick={() => {
                setExploreSearchQuery("");
                setShowAllExploreTopics(false);
              }}
            >
              Clear search
            </button>
          </>
        )}

        {!isExploreSearching && selectedExploreTopicId === null && (
          <>
            {/* Topics Grid */}
            <div className="mb-4 grid grid-cols-3 gap-x-3 gap-y-4">
              {EXPLORE_TOPICS.slice(
                0,
                showAllExploreTopics ? EXPLORE_TOPICS.length : 6,
              ).map((topic) => {
                const disabled = isTopicFullyComingSoon(topic);
                return (
                <button
                  key={topic.id}
                  className={cn(
                    "flex flex-col items-center text-center",
                    disabled && "cursor-default opacity-40",
                  )}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    if (topic.subcategories && topic.subcategories.length) {
                      setSelectedExploreTopicId(topic.id);
                      setExploreSearchQuery("");
                    }
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl">
                    <Image
                      src={topic.icon}
                      alt={topic.title}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="mt-1 line-clamp-2 w-full text-gray-900 text-xs leading-tight">
                    {topic.title}
                  </span>
                </button>
                );
              })}
            </div>
            <button
              className="mb-2 w-full text-center text-primary text-sm"
              onClick={() => setShowAllExploreTopics((prev) => !prev)}
            >
              {showAllExploreTopics ? "View Less" : "View More"}
            </button>
          </>
        )}

        {!isExploreSearching && selectedExploreTopicId !== null && (
          <div className="space-y-4">
            {(() => {
              const topic = EXPLORE_TOPICS.find(
                (t) => t.id === selectedExploreTopicId,
              );
              if (!topic || !topic.subcategories) return null;
              return (
                <>
                  {/* Back to Explore */}
                  <button
                    type="button"
                    className="flex items-center gap-1 font-medium text-gray-500 text-xs"
                    onClick={() => {
                      setSelectedExploreTopicId(null);
                      setExploreSearchQuery("");
                      if (!isTopicCommitted) {
                        clearExpertTopic();
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back to Explore</span>
                  </button>

                  {/* Topic heading */}
                  <h3 className="font-semibold text-base text-gray-900">
                    {topic.title}
                  </h3>

                  {/* Subtopics list */}
                  <div className="space-y-4">
                    {topic.subcategories.map((subtopic) => (
                      <button
                        key={subtopic.id}
                        type="button"
                        disabled={subtopic.comingSoon}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 text-left transition",
                          subtopic.comingSoon
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-blue-200 hover:bg-blue-50",
                        )}
                        onClick={() => {
                          if (subtopic.comingSoon) return;
                          setExpertTopic({
                            id: subtopic.id,
                            title: subtopic.title,
                            icon: subtopic.icon,
                            parentTitle: topic.title,
                          });
                        }}
                      >
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-sm">
                          <Image
                            src={subtopic.icon}
                            alt={subtopic.title}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {subtopic.title}
                          </span>
                          <span className={cn(
                            "text-xs leading-snug",
                            subtopic.comingSoon ? "italic text-gray-400" : "text-gray-600",
                          )}>
                            {subtopic.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Trending Now */}
      <div className="mt-6 mb-3 flex items-center gap-2">
        <h2 className="font-bold text-gray-800 text-lg">Trending Now</h2>
        <div className="flex items-center">
          {MOOD_NAMES.map((mood, index) => (
            <div
              key={mood}
              className={cn(
                "flex h-7 w-7 items-center justify-center",
                index > 0 && "-ml-3",
              )}
            >
              <Mood mood={mood} withShadow={false} className="h-6 w-6" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white shadow-sm">
        <div>
          {trendingTopics.map((topic, index) => (
            <div
              key={topic.id}
              className={cn(
                index < trendingTopics.length - 1 &&
                  "border-slate-200 border-b",
              )}
            >
              <div className="flex flex-col gap-2 px-4 py-4">
                {/* Header row with category and right-aligned icons */}
                <div className="flex items-start justify-between">
                  <p className="text-gray-400 text-xs">{topic.category}</p>
                  <div className="flex items-center gap-1">
                    {topic.id === 1 && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({
                          length: getFireIconCount(topic.count),
                        }).map((_, iconIndex) => (
                          <Image
                            key={iconIndex}
                            src="/fire.svg"
                            alt="Trending hot"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        ))}
                      </span>
                    )}
                    {topic.id === 2 && (
                      <Image
                        src="/trending.svg"
                        alt="Trending up"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
                    {topic.id === 3 && (
                      <Image
                        src="/pink-heart.svg"
                        alt="Heart"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
                  </div>
                </div>

                {/* Title */}
                <p className="font-bold text-gray-800 text-lg">{topic.title}</p>

                {/* Mood faces and count row */}
                <div className="mt-1 flex items-center justify-start">
                  <div className="flex items-center">
                    {topic.moods.map((mood, idx) => (
                      <div
                        key={`${mood}-${idx}`}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center",
                          idx > 0 && "-ml-3",
                        )}
                      >
                        <Mood
                          mood={mood}
                          withShadow={false}
                          className="h-5 w-5"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="ml-[2px] text-black text-xs">
                    {topic.count} this week
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood History */}
      <h2 className="mt-6 mb-3 font-bold text-gray-800 text-lg">
        Mood History
      </h2>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setWeekOffset((prev) => prev + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-600 text-sm">{rangeLabel}</span>
            <button
              className={cn(
                "text-gray-400 hover:text-gray-600",
                weekOffset === 0 && "cursor-not-allowed opacity-40",
              )}
              onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {isMoodHistoryLoading && (
              <Loader2 className="ml-1 h-3 w-3 animate-spin text-gray-400" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-7 justify-items-center gap-x-1 gap-y-2">
          {daysInRange.map((date, i) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const mood = moodByDate[dateKey];
            const isFuture = isAfter(startOfDay(date), todayStart);
            const dayLabel = format(date, "EEEEE");

            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-gray-500 text-xs">{dayLabel}</span>
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

          {/* Mood Sentiment Summary */}
          <MoodSentimentSummary moodByDate={moodByDate} />
      </div>

      {/* AI-Prompted Journal */}
      <JournalSection currentMood={(() => {
        const today = format(new Date(), "yyyy-MM-dd");
        return moodByDate[today] ?? null;
      })()} />

      {/* Feedback Card */}
      <div className="mt-6 mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white shadow-sm">
        <h3 className="mb-3 text-center font-semibold">Is Soli helpful?</h3>
        {feedbackStatus !== "success" && (
          <div className="mb-3 flex justify-center gap-6">
            <button
              className="rounded-full bg-white/20 p-3 hover:bg-white/30 disabled:opacity-60"
              disabled={isSubmittingFeedback}
              onClick={() => handleFeedback(true)}
            >
              {isSubmittingFeedback && activeFeedback === "up" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ThumbsUp className="h-6 w-6" />
              )}
            </button>
            <button
              className="rounded-full bg-white/20 p-3 hover:bg-white/30 disabled:opacity-60"
              disabled={isSubmittingFeedback}
              onClick={() => handleFeedback(false)}
            >
              {isSubmittingFeedback && activeFeedback === "down" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ThumbsDown className="h-6 w-6" />
              )}
            </button>
          </div>
        )}
        <p className="mb-2 text-center text-sm opacity-90">
          {feedbackStatus === "success" && "Thanks for your feedback! "}
          Have ideas on how to make it better?{" "}
          <Link
            href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Submit them here.
          </Link>
        </p>
      </div>
    </>
  );
}
