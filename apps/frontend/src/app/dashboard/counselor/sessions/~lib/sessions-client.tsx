"use client";

import {
  Activity,
  ArrowLeft,
  Brain,
  Calendar,
  ChevronDown,
  Clock,
  Hash,
  SearchIcon,
  SmilePlus,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import type { SessionActivity, SessionSentiment } from "./mock-sessions";
import { generateMockSessions } from "./mock-sessions";

const SENTIMENT_CONFIG: Record<SessionSentiment, { label: string; color: string; bg: string; dot: string }> = {
  positive: { label: "Positive", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  neutral: { label: "Neutral", color: "text-gray-600", bg: "bg-gray-100", dot: "bg-gray-400" },
  negative: { label: "Negative", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  mixed: { label: "Mixed", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
};

const SENTIMENT_OPTIONS: { value: SessionSentiment; label: string }[] = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
  { value: "mixed", label: "Mixed" },
];

const PAGE_SIZE = 12;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h!, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

// ─── Session Detail Modal ────────────────────────────────────────────

function SessionDetailModal({
  session,
  onClose,
}: {
  session: SessionActivity;
  onClose: () => void;
}) {
  const sentimentCfg = SENTIMENT_CONFIG[session.sentiment];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-500">{session.patientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          {/* Session ID & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border bg-gray-50 px-3 py-1.5">
              <Hash className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-mono text-sm font-semibold text-gray-700">{session.id}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(session.date)} at {formatTime(session.time)}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(session.durationMinutes)}
            </div>
          </div>

          {/* Session Summary */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Session Summary</h3>
            <p className="text-sm leading-relaxed text-gray-700">{session.summary}</p>
          </div>

          {/* Sentiment & Mood */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sentiment</h3>
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", sentimentCfg.dot)} />
                <span className={cn("text-sm font-medium", sentimentCfg.color)}>{sentimentCfg.label}</span>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Mood</h3>
              <div className="flex items-center gap-2">
                <SmilePlus className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{session.mood}</span>
              </div>
            </div>
          </div>

          {/* Mental Health Contributors */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Mental Health Contributors
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.mentalHealthContributors.map((contributor) => (
                <div
                  key={contributor}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5"
                >
                  <Brain className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-medium text-purple-700">{contributor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Activities */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Session Activities
            </h3>
            <div className="space-y-2">
              {session.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Activity className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sessions List ───────────────────────────────────────────────────

export function SessionsClient({ patientName }: { patientName?: string } = {}) {
  const sessions = useMemo(() => {
    const all = generateMockSessions();
    return patientName ? all.filter((s) => s.patientName === patientName) : all;
  }, [patientName]);
  const [search, setSearch] = useState("");
  const [selectedSentiments, setSelectedSentiments] = useState<SessionSentiment[]>([]);
  const [page, setPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState<SessionActivity | null>(null);

  const hasFilters = search !== "" || selectedSentiments.length > 0;

  const filtered = useMemo(() => {
    let result = sessions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.patientName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      );
    }
    if (selectedSentiments.length > 0) {
      result = result.filter((s) => selectedSentiments.includes(s.sentiment));
    }
    return result;
  }, [sessions, search, selectedSentiments]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearAll = () => {
    setSearch("");
    setSelectedSentiments([]);
    setPage(0);
  };

  return (
    <div style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
            <Input
              placeholder={patientName ? "Search by session ID..." : "Search by patient name or session ID..."}
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-10 border-gray-200 bg-white pl-10 font-dm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hover:!bg-gray-50 hover:!text-gray-700 h-10 min-w-[140px] justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700"
              >
                <span className="truncate">
                  {selectedSentiments.length > 0
                    ? SENTIMENT_OPTIONS.filter((o) => selectedSentiments.includes(o.value)).map((o) => o.label).join(", ")
                    : "All Sentiments"}
                </span>
                <ChevronDown className="size-4 shrink-0 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[140px] bg-white font-dm"
            >
              {SENTIMENT_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedSentiments.includes(option.value)}
                  onCheckedChange={() => {
                    setSelectedSentiments((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((s) => s !== option.value)
                        : [...prev, option.value],
                    );
                    setPage(0);
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={clearAll}
            disabled={!hasFilters}
            className={cn(
              "font-medium text-sm",
              hasFilters ? "text-blue-600 hover:text-blue-800" : "cursor-not-allowed text-gray-400",
            )}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 mb-3 flex items-center justify-between px-1">
        <span className="text-sm text-gray-500">
          Showing {filtered.length} session{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sessions Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Session ID</th>
              {!patientName && <th className="px-4 py-3">Patient</th>}
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Sentiment</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No sessions found matching your filters.
                </td>
              </tr>
            ) : (
              pageData.map((session) => {
                const sentimentCfg = SENTIMENT_CONFIG[session.sentiment];
                return (
                  <tr
                    key={session.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-600">{session.id}</span>
                    </td>
                    {!patientName && (
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{session.patientName}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(session.date)}, {formatTime(session.time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {formatDuration(session.durationMinutes)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", sentimentCfg.bg, sentimentCfg.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sentimentCfg.dot)} />
                        {sentimentCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        View &rsaquo;
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <span className="text-sm text-gray-500">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              &lt;
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
