"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  Shield,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { cn } from "@/lib/tailwind-utils";

// ─── Types ──────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  content: string;
  author: "student" | "coach" | "ai";
  createdAt: string;
  senderName: string;
};

type ConversationSummary = {
  id: string;
  topic: string;
  reason: string;
  status: "active" | "closed" | "transferred";
  startedAt: string;
  closedAt: string | null;
  messages: ChatMessage[];
  hasAlert: boolean;
  themes: string[];
  techniques: string[];
  clinicalNote: string;
};

// ─── Mock Conversation Data ─────────────────────────────────────────

function generateConversationHistory(patientName: string): ConversationSummary[] {
  const profiles: Record<string, ConversationSummary[]> = {
    "Sarah Mitchell": [
      {
        id: "conv-sm-1",
        topic: "Anxiety & Panic",
        reason: "Feeling overwhelmed with school pressure and having panic attacks",
        status: "closed",
        startedAt: "2026-02-18T14:30:00Z",
        closedAt: "2026-02-18T15:15:00Z",
        hasAlert: false,
        messages: [
          { id: "m1", content: "", author: "student", createdAt: "2026-02-18T14:30:00Z", senderName: "Sarah" },
          { id: "m2", content: "", author: "ai", createdAt: "2026-02-18T14:31:00Z", senderName: "Soli" },
          { id: "m3", content: "", author: "student", createdAt: "2026-02-18T14:32:00Z", senderName: "Sarah" },
          { id: "m4", content: "", author: "ai", createdAt: "2026-02-18T14:33:00Z", senderName: "Soli" },
          { id: "m5", content: "", author: "student", createdAt: "2026-02-18T14:34:00Z", senderName: "Sarah" },
          { id: "m6", content: "", author: "ai", createdAt: "2026-02-18T14:35:00Z", senderName: "Soli" },
          { id: "m7", content: "", author: "student", createdAt: "2026-02-18T14:36:00Z", senderName: "Sarah" },
          { id: "m8", content: "", author: "coach", createdAt: "2026-02-18T14:45:00Z", senderName: "Therapist" },
          { id: "m9", content: "", author: "student", createdAt: "2026-02-18T14:47:00Z", senderName: "Sarah" },
          { id: "m10", content: "", author: "coach", createdAt: "2026-02-18T14:50:00Z", senderName: "Therapist" },
        ],
        themes: ["Test anxiety", "Physical symptoms of anxiety", "Academic pressure"],
        techniques: ["5-senses grounding exercise", "4-7-8 breathing technique"],
        clinicalNote: "Patient reported escalating anxiety related to upcoming exams. Physical symptoms include racing heart and shortness of breath. AI-guided grounding was effective in reducing acute distress. Therapist reinforced coping strategies and scheduled follow-up.",
      },
      {
        id: "conv-sm-2",
        topic: "Sleep & Rest",
        reason: "Can't sleep at night, mind racing",
        status: "closed",
        startedAt: "2026-02-10T22:15:00Z",
        closedAt: "2026-02-10T22:45:00Z",
        hasAlert: false,
        messages: [
          { id: "m11", content: "", author: "student", createdAt: "2026-02-10T22:15:00Z", senderName: "Sarah" },
          { id: "m12", content: "", author: "ai", createdAt: "2026-02-10T22:16:00Z", senderName: "Soli" },
          { id: "m13", content: "", author: "student", createdAt: "2026-02-10T22:17:00Z", senderName: "Sarah" },
          { id: "m14", content: "", author: "ai", createdAt: "2026-02-10T22:18:00Z", senderName: "Soli" },
          { id: "m15", content: "", author: "coach", createdAt: "2026-02-10T22:30:00Z", senderName: "Therapist" },
        ],
        themes: ["Insomnia", "Racing thoughts", "Nighttime anxiety"],
        techniques: ["Body scan relaxation", "Sleep hygiene review", "Worry journaling"],
        clinicalNote: "Late-night session initiated by patient due to difficulty falling asleep. Racing thoughts linked to generalized anxiety. Breathing exercises had limited effect; body scan was introduced as alternative. Therapist reinforced sleep hygiene checklist.",
      },
    ],
    "David Chen": [
      {
        id: "conv-dc-1",
        topic: "Sadness & Low Mood",
        reason: "Feeling really down and unmotivated",
        status: "closed",
        startedAt: "2026-02-15T10:00:00Z",
        closedAt: "2026-02-15T10:40:00Z",
        hasAlert: false,
        messages: [
          { id: "m20", content: "", author: "student", createdAt: "2026-02-15T10:00:00Z", senderName: "David" },
          { id: "m21", content: "", author: "ai", createdAt: "2026-02-15T10:01:00Z", senderName: "Soli" },
          { id: "m22", content: "", author: "student", createdAt: "2026-02-15T10:03:00Z", senderName: "David" },
          { id: "m23", content: "", author: "ai", createdAt: "2026-02-15T10:04:00Z", senderName: "Soli" },
          { id: "m24", content: "", author: "coach", createdAt: "2026-02-15T10:15:00Z", senderName: "Therapist" },
          { id: "m25", content: "", author: "student", createdAt: "2026-02-15T10:18:00Z", senderName: "David" },
          { id: "m26", content: "", author: "coach", createdAt: "2026-02-15T10:20:00Z", senderName: "Therapist" },
        ],
        themes: ["Low mood", "Loss of interest", "Amotivation", "Anhedonia"],
        techniques: ["Behavioral activation", "Small goal-setting", "Activity scheduling"],
        clinicalNote: "Patient expressed persistent low mood and loss of interest in previously enjoyed activities (basketball). Pattern consistent with mood check-in data. Therapist introduced behavioral activation with small daily goals. Patient agreed to attempt a short walk.",
      },
    ],
    "Jessica Brown": [
      {
        id: "conv-jb-1",
        topic: "Coping with Big Feelings",
        reason: "Having flashbacks and feeling unsafe",
        status: "closed",
        startedAt: "2026-02-08T16:00:00Z",
        closedAt: "2026-02-08T16:45:00Z",
        hasAlert: true,
        messages: [
          { id: "m30", content: "", author: "student", createdAt: "2026-02-08T16:00:00Z", senderName: "Jessica" },
          { id: "m31", content: "", author: "ai", createdAt: "2026-02-08T16:01:00Z", senderName: "Soli" },
          { id: "m32", content: "", author: "student", createdAt: "2026-02-08T16:02:00Z", senderName: "Jessica" },
          { id: "m33", content: "", author: "ai", createdAt: "2026-02-08T16:03:00Z", senderName: "Soli" },
          { id: "m34", content: "", author: "coach", createdAt: "2026-02-08T16:10:00Z", senderName: "Therapist" },
          { id: "m35", content: "", author: "student", createdAt: "2026-02-08T16:12:00Z", senderName: "Jessica" },
          { id: "m36", content: "", author: "coach", createdAt: "2026-02-08T16:13:00Z", senderName: "Therapist" },
          { id: "m37", content: "", author: "student", createdAt: "2026-02-08T16:15:00Z", senderName: "Jessica" },
          { id: "m38", content: "", author: "coach", createdAt: "2026-02-08T16:17:00Z", senderName: "Therapist" },
        ],
        themes: ["Intrusive memories", "Feeling unsafe", "Emotional dysregulation"],
        techniques: ["5-4-3-2-1 grounding", "Safety assessment", "Somatic grounding"],
        clinicalNote: "Safety alert triggered — patient reported intrusive memories and feeling scared. AI initiated grounding; therapist joined within 10 minutes. 5-4-3-2-1 sensory grounding was effective. Patient reported feeling calmer by end of session. Therapist scheduled 1-hour follow-up check-in.",
      },
    ],
    "Tyler Davis": [
      {
        id: "conv-td-1",
        topic: "Loneliness & Isolation",
        reason: "Feeling left out at school",
        status: "active",
        startedAt: "2026-02-20T12:00:00Z",
        closedAt: null,
        hasAlert: false,
        messages: [
          { id: "m40", content: "", author: "student", createdAt: "2026-02-20T12:00:00Z", senderName: "Tyler" },
          { id: "m41", content: "", author: "ai", createdAt: "2026-02-20T12:01:00Z", senderName: "Soli" },
          { id: "m42", content: "", author: "student", createdAt: "2026-02-20T12:03:00Z", senderName: "Tyler" },
        ],
        themes: ["Social isolation", "Peer relationships", "School adjustment"],
        techniques: ["Empathic listening", "Social skills exploration"],
        clinicalNote: "Patient initiated conversation about feeling isolated at lunch. Reports daily loneliness since schedule changes separated them from friend group. Conversation is ongoing — therapist has not yet joined.",
      },
    ],
    "Alex Patel": [
      {
        id: "conv-ap-1",
        topic: "Moods & Emotions",
        reason: "Mood swings and feeling out of control",
        status: "closed",
        startedAt: "2026-02-19T09:00:00Z",
        closedAt: "2026-02-19T09:30:00Z",
        hasAlert: false,
        messages: [
          { id: "m50", content: "", author: "student", createdAt: "2026-02-19T09:00:00Z", senderName: "Alex" },
          { id: "m51", content: "", author: "ai", createdAt: "2026-02-19T09:01:00Z", senderName: "Soli" },
          { id: "m52", content: "", author: "student", createdAt: "2026-02-19T09:03:00Z", senderName: "Alex" },
          { id: "m53", content: "", author: "coach", createdAt: "2026-02-19T09:10:00Z", senderName: "Therapist" },
          { id: "m54", content: "", author: "student", createdAt: "2026-02-19T09:12:00Z", senderName: "Alex" },
        ],
        themes: ["Mood instability", "Energy fluctuations", "Sleep disruption"],
        techniques: ["Mood tracking reinforcement", "Psychoeducation"],
        clinicalNote: "Patient described cyclical mood pattern — periods of high energy/insomnia alternating with low energy/withdrawal. Therapist corroborated with mood check-in data. Emphasized importance of consistent daily mood tracking for care team coordination.",
      },
    ],
  };

  return profiles[patientName] ?? [{
    id: "conv-default-1",
    topic: "General Check-In",
    reason: "Routine wellness check",
    status: "closed" as const,
    startedAt: "2026-02-15T10:00:00Z",
    closedAt: "2026-02-15T10:20:00Z",
    hasAlert: false,
    messages: [
      { id: "md1", content: "", author: "ai" as const, createdAt: "2026-02-15T10:00:00Z", senderName: "Soli" },
      { id: "md2", content: "", author: "student" as const, createdAt: "2026-02-15T10:02:00Z", senderName: "Patient" },
    ],
    themes: ["General wellness", "School stress"],
    techniques: ["Check-in", "Active listening"],
    clinicalNote: "Routine wellness check-in. Patient reported mild school-related stress. No acute concerns identified.",
  }];
}

// ─── Conversation Card ──────────────────────────────────────────────

function ConversationCard({ conversation }: { conversation: ConversationSummary }) {
  const [expanded, setExpanded] = useState(false);
  const messageCount = conversation.messages.length;

  const statusConfig = {
    active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
    transferred: { label: "Transferred", color: "bg-blue-50 text-blue-700 border-blue-200" },
  };

  const status = statusConfig[conversation.status];

  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-3.5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            conversation.hasAlert ? "bg-red-50" : "bg-blue-50",
          )}>
            {conversation.hasAlert ? (
              <Shield className="h-4 w-4 text-red-500" />
            ) : (
              <MessageSquare className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{conversation.topic}</span>
              {conversation.hasAlert && (
                <Badge variant="secondary" className="bg-red-50 text-red-700 text-[9px]">
                  Safety Alert
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-gray-400 line-clamp-1">{conversation.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", status.color)}>
                {status.label}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-400">
              <span>{format(new Date(conversation.startedAt), "MMM d, h:mm a")}</span>
              <span>·</span>
              <span>{messageCount} msgs</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          <div className="px-4 py-4 space-y-4">
            {/* Themes */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Themes Discussed</p>
              <div className="flex flex-wrap gap-1.5">
                {conversation.themes.map((theme) => (
                  <span key={theme} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                    <Tag className="h-3 w-3 text-gray-400" />
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Clinical Note */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Session Summary</p>
              <p className="text-xs text-gray-700 leading-relaxed">{conversation.clinicalNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────

export function PatientChatHistory({ patientName }: { patientName: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const conversations = useMemo(() => generateConversationHistory(patientName), [patientName]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.topic.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.themes.some((t) => t.toLowerCase().includes(q)) ||
        c.clinicalNote.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const activeCount = conversations.filter((c) => c.status === "active").length;
  const alertCount = conversations.filter((c) => c.hasAlert).length;

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Chat Conversations
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            {conversations.length} conversations · {totalMessages} messages
            {activeCount > 0 && ` · ${activeCount} active`}
            {alertCount > 0 && ` · ${alertCount} alerts`}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No conversations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
