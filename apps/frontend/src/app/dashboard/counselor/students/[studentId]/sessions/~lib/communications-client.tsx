"use client";

import { format } from "date-fns";
import {
  MessageSquare,
  Phone,
  Search,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type CallRecord = {
  id: string;
  date: Date;
  duration: string;
  direction: "inbound" | "outbound";
  notes: string;
};

type MessageRecord = {
  id: string;
  date: Date;
  preview: string;
  sender: "patient" | "provider";
};

type CommunicationsClientProps = {
  patientName?: string;
};

// Mock data for phone calls
const MOCK_CALLS: CallRecord[] = [
  { id: "c1", date: new Date(2026, 2, 7, 14, 30), duration: "12 min", direction: "outbound", notes: "Discussed medication adherence. Patient reports feeling better but still experiencing occasional anxiety. Scheduled follow-up for next week." },
  { id: "c2", date: new Date(2026, 2, 5, 10, 15), duration: "8 min", direction: "inbound", notes: "Patient called with questions about side effects. Reassured and advised to continue current regimen." },
  { id: "c3", date: new Date(2026, 2, 1, 16, 0), duration: "15 min", direction: "outbound", notes: "Initial check-in call. Reviewed treatment plan and set goals for the month." },
  { id: "c4", date: new Date(2026, 1, 25, 11, 45), duration: "6 min", direction: "inbound", notes: "Brief call to confirm appointment time." },
];

// Mock data for in-app messages
const MOCK_MESSAGES: MessageRecord[] = [
  { id: "m1", date: new Date(2026, 2, 8, 9, 0), preview: "Thank you for the resources you shared. I've been practicing the breathing exercises.", sender: "patient" },
  { id: "m2", date: new Date(2026, 2, 7, 15, 30), preview: "Here are some additional coping strategies we discussed. Let me know if you have questions.", sender: "provider" },
  { id: "m3", date: new Date(2026, 2, 6, 11, 20), preview: "I'm feeling a bit overwhelmed today. Is there anything I can do before our next session?", sender: "patient" },
  { id: "m4", date: new Date(2026, 2, 5, 14, 0), preview: "Great progress this week! Keep up the journaling.", sender: "provider" },
  { id: "m5", date: new Date(2026, 2, 3, 10, 15), preview: "Just wanted to check in - how are you feeling after our last session?", sender: "provider" },
];

export function CommunicationsClient({ patientName }: CommunicationsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "calls" | "messages">("all");
  const [search, setSearch] = useState("");
  const [showAddCallModal, setShowAddCallModal] = useState(false);
  const [showCallPanel, setShowCallPanel] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [newCallNotes, setNewCallNotes] = useState("");
  const [newCallDuration, setNewCallDuration] = useState("");
  const [newCallDirection, setNewCallDirection] = useState<"inbound" | "outbound">("outbound");
  const [newMessage, setNewMessage] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const filteredCalls = MOCK_CALLS.filter((c) =>
    c.notes.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMessages = MOCK_MESSAGES.filter((m) =>
    m.preview.toLowerCase().includes(search.toLowerCase())
  );

  // Combined timeline for "All" view
  type TimelineItem = 
    | { type: "call"; data: CallRecord; date: Date }
    | { type: "message"; data: MessageRecord; date: Date };

  const allItems: TimelineItem[] = [
    ...filteredCalls.map((c) => ({ type: "call" as const, data: c, date: c.date })),
    ...filteredMessages.map((m) => ({ type: "message" as const, data: m, date: m.date })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calls")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "calls" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Phone className="h-4 w-4" />
            Phone Calls
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "messages" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            In-App Messages
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCallPanel(true)}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Phone className="h-4 w-4" />
            Call
          </button>
          <button
            type="button"
            onClick={() => setShowMessagePanel(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "all" ? (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Communication History <span className="ml-1 text-gray-400">({allItems.length})</span>
            </h3>
          </div>
          {allItems.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              No communications yet.
            </div>
          ) : (
            <div className="divide-y">
              {allItems.map((item) => (
                <div key={item.type === "call" ? `call-${item.data.id}` : `msg-${item.data.id}`} className="px-4 py-3 hover:bg-gray-50/50">
                  {item.type === "call" ? (
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        item.data.direction === "outbound" ? "bg-blue-50" : "bg-green-50"
                      )}>
                        <Phone className={cn("h-4 w-4", item.data.direction === "outbound" ? "text-blue-600" : "text-green-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {item.data.direction === "outbound" ? "Outbound Call" : "Inbound Call"}
                            </span>
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", item.data.direction === "outbound" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>
                              {item.data.duration}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{format(item.date, "MMM d, h:mm a")}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.data.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                        item.data.sender === "patient" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {item.data.sender === "patient" ? <MessageSquare className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {item.data.sender === "patient" ? (patientName || "Patient") : "You"}
                          </span>
                          <span className="text-xs text-gray-400">{format(item.date, "MMM d, h:mm a")}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600">{item.data.preview}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "calls" ? (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Call History <span className="ml-1 text-gray-400">({filteredCalls.length})</span>
            </h3>
          </div>
          {filteredCalls.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              No phone calls recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {filteredCalls.map((call) => (
                <div key={call.id} className="px-4 py-4 hover:bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        call.direction === "outbound" ? "bg-blue-50" : "bg-green-50"
                      )}>
                        <Phone className={cn(
                          "h-4 w-4",
                          call.direction === "outbound" ? "text-blue-600" : "text-green-600"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {call.direction === "outbound" ? "Outbound Call" : "Inbound Call"}
                          </span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            call.direction === "outbound" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                          )}>
                            {call.direction}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(call.date, "MMM d, yyyy 'at' h:mm a")} · {call.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{call.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Message History <span className="ml-1 text-gray-400">({filteredMessages.length})</span>
            </h3>
          </div>
          {filteredMessages.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              No messages yet.
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="px-4 py-3 hover:bg-gray-50/50">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                      msg.sender === "patient" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    )}>
                      {msg.sender === "patient" ? (patientName?.charAt(0) || "P") : "You"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {msg.sender === "patient" ? (patientName || "Patient") : "You"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(msg.date, "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600 truncate">{msg.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call Panel - Slide out */}
      {showCallPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !isCallActive && setShowCallPanel(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Call Patient</h2>
              {!isCallActive && (
                <button
                  type="button"
                  onClick={() => setShowCallPanel(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {!isCallActive ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <Phone className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">{patientName || "Patient"}</p>
                  <p className="text-sm text-gray-500">(555) 123-4567</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCallActive(true);
                    setCallTimer(0);
                    const interval = setInterval(() => setCallTimer((t) => t + 1), 1000);
                    (window as unknown as { commCallInterval?: NodeJS.Timeout }).commCallInterval = interval;
                  }}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                >
                  Start Call
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-pulse">
                    <Phone className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Call in Progress</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, "0")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{patientName || "Patient"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCallActive(false);
                    const interval = (window as unknown as { commCallInterval?: NodeJS.Timeout }).commCallInterval;
                    if (interval) clearInterval(interval);
                    setNewCallDuration(`${Math.floor(callTimer / 60)}:${(callTimer % 60).toString().padStart(2, "0")}`);
                    setShowCallPanel(false);
                    setShowAddCallModal(true); // Open log modal to add notes
                  }}
                  className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
                >
                  End Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Chat Panel */}
      {showMessagePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" onClick={() => setShowMessagePanel(false)}>
          <div className="h-full w-full max-w-lg bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                  {patientName?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{patientName || "Patient"}</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMessagePanel(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {MOCK_MESSAGES.slice().reverse().map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "provider" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.sender === "provider"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{msg.preview}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      msg.sender === "provider" ? "text-blue-200" : "text-gray-400"
                    )}>
                      {format(msg.date, "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) {
                    // In real app, would send message
                    setNewMessage("");
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Call Modal (for logging after call ends) */}
      {showAddCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Log Phone Call</h2>
              <button
                type="button"
                onClick={() => setShowAddCallModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddCallModal(false);
                setNewCallNotes("");
                setNewCallDuration("");
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Call Direction
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCallDirection("outbound")}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      newCallDirection === "outbound"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Outbound
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCallDirection("inbound")}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      newCallDirection === "inbound"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Inbound
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  value={newCallDuration}
                  onChange={(e) => setNewCallDuration(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="e.g. 15 min"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={newCallNotes}
                  onChange={(e) => setNewCallNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Summary of the call..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCallModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
