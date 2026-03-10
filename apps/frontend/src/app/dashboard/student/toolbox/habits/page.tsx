"use client";

import {
  ArrowLeft,
  Book,
  Brain,
  Check,
  Dumbbell,
  Droplets,
  GraduationCap,
  Heart,
  ListChecks,
  Moon,
  Plus,
  Salad,
  ShowerHead,
  Sparkles,
  Sun,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type HabitCategory = "health" | "hygiene" | "academic" | "mental" | "social";

type Habit = {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  completedDays: number[];
  streak: number;
  goal?: string;
};

type SuggestedHabit = {
  title: string;
  description: string;
  category: HabitCategory;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  goal?: string;
};

const HABIT_CATEGORIES: { id: HabitCategory; label: string; icon: typeof Heart; color: string }[] = [
  { id: "health", label: "Health & Fitness", icon: Dumbbell, color: "text-emerald-500" },
  { id: "hygiene", label: "Hygiene & Self-Care", icon: ShowerHead, color: "text-cyan-500" },
  { id: "academic", label: "Academic & Learning", icon: GraduationCap, color: "text-purple-500" },
  { id: "mental", label: "Mental Wellness", icon: Brain, color: "text-pink-500" },
  { id: "social", label: "Social & Relationships", icon: Heart, color: "text-red-500" },
];

const SUGGESTED_HABITS: SuggestedHabit[] = [
  // Health & Fitness
  { title: "Morning Exercise", description: "30 minutes of physical activity", category: "health", icon: Dumbbell, color: "text-emerald-500", bgColor: "bg-emerald-500", goal: "30 min" },
  { title: "Drink Water", description: "Stay hydrated throughout the day", category: "health", icon: Droplets, color: "text-blue-500", bgColor: "bg-blue-500", goal: "8 glasses" },
  { title: "Eat Healthy", description: "Include fruits and vegetables", category: "health", icon: Salad, color: "text-green-500", bgColor: "bg-green-500", goal: "5 servings" },
  { title: "Sleep Early", description: "Get to bed before 10 PM", category: "health", icon: Moon, color: "text-indigo-500", bgColor: "bg-indigo-500", goal: "8 hours" },
  // Hygiene & Self-Care
  { title: "Morning Shower", description: "Start fresh every morning", category: "hygiene", icon: ShowerHead, color: "text-cyan-500", bgColor: "bg-cyan-500" },
  { title: "Brush Teeth", description: "Twice daily dental care", category: "hygiene", icon: Sparkles, color: "text-sky-500", bgColor: "bg-sky-500", goal: "2x daily" },
  { title: "Skincare Routine", description: "Take care of your skin", category: "hygiene", icon: Sun, color: "text-amber-500", bgColor: "bg-amber-500" },
  // Academic & Learning
  { title: "Study Session", description: "Focused study time", category: "academic", icon: Book, color: "text-purple-500", bgColor: "bg-purple-500", goal: "1 hour" },
  { title: "Read a Book", description: "Expand your knowledge", category: "academic", icon: GraduationCap, color: "text-violet-500", bgColor: "bg-violet-500", goal: "20 pages" },
  { title: "Review Notes", description: "Go over class materials", category: "academic", icon: ListChecks, color: "text-fuchsia-500", bgColor: "bg-fuchsia-500", goal: "15 min" },
  // Mental Wellness
  { title: "Morning Meditation", description: "Start with mindfulness", category: "mental", icon: Brain, color: "text-pink-500", bgColor: "bg-pink-500", goal: "10 min" },
  { title: "Gratitude Journal", description: "Write 3 things you're grateful for", category: "mental", icon: Heart, color: "text-rose-500", bgColor: "bg-rose-500", goal: "3 items" },
  { title: "Deep Breathing", description: "Practice breathing exercises", category: "mental", icon: Sparkles, color: "text-teal-500", bgColor: "bg-teal-500", goal: "5 min" },
  // Social
  { title: "Call a Friend", description: "Stay connected with loved ones", category: "social", icon: Heart, color: "text-red-500", bgColor: "bg-red-500" },
  { title: "Family Time", description: "Quality time with family", category: "social", icon: Heart, color: "text-orange-500", bgColor: "bg-orange-500", goal: "30 min" },
];

const INITIAL_HABITS: Habit[] = [
  {
    id: "1",
    title: "Morning Meditation",
    description: "Start with mindfulness",
    category: "mental",
    icon: Brain,
    color: "text-pink-500",
    bgColor: "bg-pink-500",
    completedDays: [0, 1, 2, 3, 4],
    streak: 5,
    goal: "10 min",
  },
  {
    id: "2",
    title: "Morning Exercise",
    description: "30 minutes of physical activity",
    category: "health",
    icon: Dumbbell,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    completedDays: [0, 2, 4],
    streak: 1,
    goal: "30 min",
  },
  {
    id: "3",
    title: "Read a Book",
    description: "Expand your knowledge",
    category: "academic",
    icon: Book,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    completedDays: [0, 1, 2, 3, 4, 5, 6],
    streak: 7,
    goal: "20 pages",
  },
  {
    id: "4",
    title: "Drink Water",
    description: "Stay hydrated throughout the day",
    category: "health",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    completedDays: [0, 1, 3, 4],
    streak: 2,
    goal: "8 glasses",
  },
];

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [activeTab, setActiveTab] = useState<"my-habits" | "discover">("my-habits");

  const todayIndex = new Date().getDay();

  const toggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isCompleted = habit.completedDays.includes(dayIndex);
        return {
          ...habit,
          completedDays: isCompleted
            ? habit.completedDays.filter((d) => d !== dayIndex)
            : [...habit.completedDays, dayIndex],
        };
      })
    );
  };

  const addHabitFromSuggestion = (suggestion: SuggestedHabit) => {
    const habit: Habit = {
      id: Date.now().toString(),
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      icon: suggestion.icon,
      color: suggestion.color,
      bgColor: suggestion.bgColor,
      completedDays: [],
      streak: 0,
      goal: suggestion.goal,
    };
    setHabits((prev) => [...prev, habit]);
    setShowAddModal(false);
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const totalCompleted = habits.reduce((acc, h) => acc + h.completedDays.length, 0);
  const totalPossible = habits.length * 7;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  const todayCompleted = habits.filter((h) => h.completedDays.includes(todayIndex)).length;

  const filteredSuggestions = selectedCategory
    ? SUGGESTED_HABITS.filter((h) => h.category === selectedCategory)
    : SUGGESTED_HABITS;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#EDF2F9]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/student/home"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
              <ListChecks className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl">Habit Tracker</h1>
              <p className="text-gray-500 text-sm">Build healthy habits and track your progress</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 font-medium text-white text-sm transition-colors hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-5xl">
          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Target className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">{habits.length}</p>
              <p className="text-white/80 text-sm">Active Habits</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">{todayCompleted}/{habits.length}</p>
              <p className="text-white/80 text-sm">Completed Today</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <ListChecks className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">{completionRate}%</p>
              <p className="text-white/80 text-sm">Weekly Completion</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <span className="text-lg">🔥</span>
              </div>
              <p className="font-bold text-3xl">{Math.max(...habits.map((h) => h.streak), 0)}</p>
              <p className="text-white/80 text-sm">Best Streak</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab("my-habits")}
              className={cn(
                "rounded-full px-6 py-2 font-medium text-sm transition-all",
                activeTab === "my-habits"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              My Habits
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={cn(
                "rounded-full px-6 py-2 font-medium text-sm transition-all",
                activeTab === "discover"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              Discover Habits
            </button>
          </div>

          {activeTab === "my-habits" ? (
            <>
              {/* Habits List */}
              <div className="space-y-4">
                {habits.map((habit) => {
                  const HabitIcon = habit.icon;
                  const categoryInfo = HABIT_CATEGORIES.find((c) => c.id === habit.category);
                  return (
                    <div key={habit.id} className="rounded-2xl bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                              habit.bgColor
                            )}
                          >
                            <HabitIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{habit.title}</h3>
                              {habit.goal && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 text-xs">
                                  Goal: {habit.goal}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">{habit.description}</p>
                            {categoryInfo && (
                              <div className="mt-1 flex items-center gap-1">
                                <categoryInfo.icon className={cn("h-3 w-3", categoryInfo.color)} />
                                <span className="text-gray-400 text-xs">{categoryInfo.label}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5">
                            <span className="text-orange-500">🔥</span>
                            <span className="font-semibold text-orange-600 text-sm">{habit.streak}</span>
                            <span className="text-orange-500 text-xs">day streak</span>
                          </div>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Week Progress */}
                      <div className="flex items-center gap-2">
                        {WEEK_DAYS.map((day, index) => {
                          const isCompleted = habit.completedDays.includes(index);
                          const isToday = index === todayIndex;
                          return (
                            <button
                              key={index}
                              onClick={() => toggleHabitDay(habit.id, index)}
                              className={cn(
                                "flex h-12 flex-1 flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                                isCompleted
                                  ? `${habit.bgColor} text-white shadow-md`
                                  : isToday
                                    ? "border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <>
                                  <span className="text-xs">{day}</span>
                                  {isToday && <span className="text-[10px]">Today</span>}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {habits.length === 0 && (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <ListChecks className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900 text-lg">No habits yet</h3>
                  <p className="mb-4 text-gray-500">Start building healthy habits by adding your first one!</p>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="rounded-full bg-gray-900 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Discover Habits
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Discover Habits Tab */
            <>
              {/* Category Filter */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    selectedCategory === null
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  All Categories
                </button>
                {HABIT_CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                        selectedCategory === category.id
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <CategoryIcon className={cn("h-4 w-4", selectedCategory === category.id ? "text-white" : category.color)} />
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {/* Suggested Habits Grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredSuggestions.map((suggestion, index) => {
                  const SuggestionIcon = suggestion.icon;
                  const categoryInfo = HABIT_CATEGORIES.find((c) => c.id === suggestion.category);
                  const isAlreadyAdded = habits.some((h) => h.title === suggestion.title);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "rounded-2xl bg-white p-5 shadow-sm transition-all",
                        isAlreadyAdded ? "opacity-50" : "hover:shadow-md"
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                            suggestion.bgColor
                          )}
                        >
                          <SuggestionIcon className="h-6 w-6" />
                        </div>
                        {suggestion.goal && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500 text-xs">
                            {suggestion.goal}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 font-bold text-gray-900">{suggestion.title}</h3>
                      <p className="mb-2 text-gray-500 text-sm">{suggestion.description}</p>
                      {categoryInfo && (
                        <div className="mb-3 flex items-center gap-1">
                          <categoryInfo.icon className={cn("h-3 w-3", categoryInfo.color)} />
                          <span className="text-gray-400 text-xs">{categoryInfo.label}</span>
                        </div>
                      )}
                      <button
                        onClick={() => addHabitFromSuggestion(suggestion)}
                        disabled={isAlreadyAdded}
                        className={cn(
                          "w-full rounded-full py-2 font-medium text-sm transition-colors",
                          isAlreadyAdded
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                      >
                        {isAlreadyAdded ? "Already Added" : "Add Habit"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Custom Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-xl">Add New Habit</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">Choose from suggested habits or browse by category:</p>

            {/* Quick Category Selection */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  selectedCategory === null
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                All
              </button>
              {HABIT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Suggestions Grid */}
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {filteredSuggestions.map((suggestion, index) => {
                  const SuggestionIcon = suggestion.icon;
                  const isAlreadyAdded = habits.some((h) => h.title === suggestion.title);
                  return (
                    <button
                      key={index}
                      onClick={() => !isAlreadyAdded && addHabitFromSuggestion(suggestion)}
                      disabled={isAlreadyAdded}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3 text-left transition-all",
                        isAlreadyAdded
                          ? "bg-gray-50 opacity-50 cursor-not-allowed"
                          : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white",
                          suggestion.bgColor
                        )}
                      >
                        <SuggestionIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{suggestion.title}</p>
                        <p className="text-gray-500 text-xs truncate">{suggestion.description}</p>
                      </div>
                      {isAlreadyAdded ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <Plus className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full bg-gray-900 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
