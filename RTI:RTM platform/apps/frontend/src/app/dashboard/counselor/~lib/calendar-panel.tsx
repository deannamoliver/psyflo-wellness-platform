"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Stethoscope,
  UserCheck,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type CalendarView = "week" | "month";

type EventType = "check-in" | "billing" | "review" | "submission" | "reminder";

type CalendarEvent = {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string;
  label: string;
  type: EventType;
  actionLabel?: string;
  dismissed?: boolean;
};

const EVENT_CONFIG: Record<EventType, { color: string; bg: string; icon: React.ElementType }> = {
  "check-in": { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: UserCheck },
  billing: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: DollarSign },
  review: { color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: FileText },
  submission: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: Stethoscope },
  reminder: { color: "text-rose-600", bg: "bg-rose-50 border-rose-200", icon: Clock },
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function generateMockEvents(baseDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = formatDateKey(baseDate);
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(baseDate.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);
  const dayAfter = new Date(baseDate);
  dayAfter.setDate(baseDate.getDate() + 2);
  const dayAfterKey = formatDateKey(dayAfter);
  const nextWeek = new Date(baseDate);
  nextWeek.setDate(baseDate.getDate() + 5);
  const nextWeekKey = formatDateKey(nextWeek);

  events.push(
    { id: "e1", date: today, time: "9:00 AM", label: "Check in with Sarah M. — Weekly mood review", type: "check-in", actionLabel: "Start Check-in" },
    { id: "e2", date: today, time: "10:30 AM", label: "RTM Data Review — 5 patients due for data day count", type: "billing", actionLabel: "Review Patients" },
    { id: "e3", date: today, time: "1:00 PM", label: "Treatment Plan Review — James K.", type: "review", actionLabel: "Open Plan" },
    { id: "e4", date: today, time: "3:00 PM", label: "Billing Submission Deadline (CPT 98980)", type: "submission", actionLabel: "Submit Claims" },
    { id: "e5", date: tomorrowKey, time: "9:30 AM", label: "Check in with Emily R. — PHQ-9 follow-up", type: "check-in", actionLabel: "Start Check-in" },
    { id: "e6", date: tomorrowKey, time: "11:00 AM", label: "Monthly billing reconciliation due", type: "billing", actionLabel: "View Billing" },
    { id: "e7", date: tomorrowKey, time: "2:00 PM", label: "Review David L. treatment adherence", type: "review", actionLabel: "Open Plan" },
    { id: "e8", date: dayAfterKey, time: "10:00 AM", label: "Check in with Maria S. — At-risk follow-up", type: "check-in", actionLabel: "Start Check-in" },
    { id: "e9", date: dayAfterKey, time: "4:00 PM", label: "Submit RTM device supply claims (CPT 98977)", type: "submission", actionLabel: "Submit Claims" },
    { id: "e10", date: nextWeekKey, time: "9:00 AM", label: "Reminder: 4 patients approaching 16-day data threshold", type: "reminder", actionLabel: "View Patients" },
    { id: "e11", date: nextWeekKey, time: "1:00 PM", label: "Quarterly outcomes report due", type: "submission", actionLabel: "Generate Report" },
  );

  return events;
}

export default function CalendarPanel({ onClose }: { onClose: () => void }) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(today));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>(() => generateMockEvents(today));

  const navigateWeek = useCallback((dir: number) => {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + dir * 7);
      return next;
    });
  }, []);

  const navigateMonth = useCallback((dir: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + dir);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(today);
    setCurrentWeekStart(getMonday(today));
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  const dismissEvent = useCallback((id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, dismissed: true } : e)));
  }, []);

  const handleAction = useCallback((event: CalendarEvent) => {
    dismissEvent(event.id);
  }, [dismissEvent]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  const monthDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const dates: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) dates.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) dates.push(new Date(year, month, d));
    while (dates.length % 7 !== 0) dates.push(null);
    return dates;
  }, [currentMonth]);

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedEvents = events.filter((e) => e.date === selectedDateKey && !e.dismissed);

  const getEventsForDate = useCallback(
    (d: Date) => events.filter((e) => e.date === formatDateKey(d) && !e.dismissed),
    [events],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Schedule</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                view === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                view === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              )}
            >
              Month
            </button>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-b px-5 py-2">
        <button type="button" onClick={() => (view === "week" ? navigateWeek(-1) : navigateMonth(-1))} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">
            {view === "week"
              ? `${weekDates[0]!.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekDates[6]!.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : `${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
          </span>
          <button type="button" onClick={goToToday} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200">
            Today
          </button>
        </div>
        <button type="button" onClick={() => (view === "week" ? navigateWeek(1) : navigateMonth(1))} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        {view === "week" ? (
          <div className="px-5 py-3">
            {/* Week header */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center">
              {DAYS_SHORT.map((d) => (
                <span key={d} className="text-[10px] font-medium text-gray-400">{d}</span>
              ))}
            </div>
            {/* Week dates */}
            <div className="mb-4 grid grid-cols-7 gap-1">
              {weekDates.map((d) => {
                const dayEvents = getEventsForDate(d);
                const isSelected = isSameDay(d, selectedDate);
                const isToday_ = isSameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "relative flex h-10 flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : isToday_
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {d.getDate()}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className={cn(
                              "h-1 w-1 rounded-full",
                              isSelected ? "bg-white/70" : EVENT_CONFIG[e.type].color.replace("text-", "bg-"),
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 py-3">
            {/* Month header */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center">
              {DAYS_SHORT.map((d) => (
                <span key={d} className="text-[10px] font-medium text-gray-400">{d}</span>
              ))}
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />;
                const dayEvents = getEventsForDate(d);
                const isSelected = isSameDay(d, selectedDate);
                const isToday_ = isSameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "relative flex h-8 items-center justify-center rounded-md text-[11px] font-medium transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : isToday_
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {d.getDate()}
                    {dayEvents.length > 0 && (
                      <span className={cn(
                        "absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full text-[8px] font-bold",
                        isSelected ? "bg-white text-blue-600" : "bg-blue-500 text-white",
                      )}>
                        {dayEvents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Day Events */}
        <div className="border-t px-5 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {isSameDay(selectedDate, today)
                ? "Today"
                : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <span className="text-[10px] text-gray-400">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}</span>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Clock className="mb-2 h-5 w-5 text-gray-300" />
              <p className="text-xs text-gray-400">No events scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((evt) => {
                const cfg = EVENT_CONFIG[evt.type];
                const Icon = cfg.icon;
                return (
                  <div key={evt.id} className={cn("rounded-lg border p-3 transition-colors", cfg.bg)}>
                    <div className="flex items-start gap-2.5">
                      <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", cfg.color.replace("text-", "bg-").replace("600", "100"))}>
                        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{evt.label}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{evt.time}</span>
                          <span className={cn("rounded-full px-1.5 py-0 text-[9px] font-medium", cfg.color, cfg.bg)}>
                            {evt.type === "check-in" ? "Check-in" : evt.type === "billing" ? "Billing" : evt.type === "review" ? "Review" : evt.type === "submission" ? "Submission" : "Reminder"}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => dismissEvent(evt.id)} className="shrink-0 text-gray-300 hover:text-gray-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {evt.actionLabel && (
                      <div className="mt-2 flex items-center gap-2 pl-8">
                        <button
                          type="button"
                          onClick={() => handleAction(evt)}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold text-white transition-colors",
                            cfg.color.replace("text-", "bg-"),
                            "hover:opacity-90",
                          )}
                        >
                          <Check className="h-3 w-3" />
                          {evt.actionLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissEvent(evt.id)}
                          className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[9px] text-gray-500">Check-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[9px] text-gray-500">Billing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="text-[9px] text-gray-500">Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-gray-500">Submission</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[9px] text-gray-500">Reminder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
