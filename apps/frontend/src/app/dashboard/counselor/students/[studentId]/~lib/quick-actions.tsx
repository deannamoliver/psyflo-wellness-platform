"use client";

import {
  ClipboardList,
  Dumbbell,
  MessageSquare,
  Phone,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type QuickActionsProps = {
  studentId: string;
  basePath?: string;
};

export function QuickActions({ studentId, basePath = "/dashboard/counselor/students" }: QuickActionsProps) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showActionItemModal, setShowActionItemModal] = useState(false);
  const [showAssignActivityModal, setShowAssignActivityModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowActionItemModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Action Item
        </button>
        <Link
          href={`${basePath}/${studentId}/treatment-plan`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Treatment Plan
        </Link>
        <button
          type="button"
          onClick={() => setShowCallModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </button>
        <button
          type="button"
          onClick={() => setShowMessageModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Message
        </button>
        <button
          type="button"
          onClick={() => setShowAssignActivityModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Assign Activity
        </button>
      </div>

      {/* Add Action Item Modal */}
      {showActionItemModal && (
        <ActionItemModal onClose={() => setShowActionItemModal(false)} />
      )}

      {/* Log Call Modal */}
      {showCallModal && (
        <LogCallModal onClose={() => setShowCallModal(false)} />
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <SendMessageModal onClose={() => setShowMessageModal(false)} />
      )}

      {/* Assign Activity Modal */}
      {showAssignActivityModal && (
        <AssignActivityModal onClose={() => setShowAssignActivityModal(false)} />
      )}
    </>
  );
}

function ActionItemModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("follow_up");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Action Item</h2>
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Action item title..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="follow_up">Follow Up</option>
                <option value="documentation">Documentation</option>
                <option value="outreach">Outreach</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LogCallModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"call" | "log">("call");
  const [direction, setDirection] = useState("outbound");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  // Mock patient phone number
  const patientPhone = "(555) 123-4567";

  const startCall = () => {
    setIsCallActive(true);
    // Start timer
    const interval = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
    // Store interval ID for cleanup
    (window as unknown as { callInterval?: NodeJS.Timeout }).callInterval = interval;
  };

  const endCall = () => {
    setIsCallActive(false);
    const interval = (window as unknown as { callInterval?: NodeJS.Timeout }).callInterval;
    if (interval) clearInterval(interval);
    // Convert timer to duration string
    const mins = Math.floor(callTimer / 60);
    const secs = callTimer % 60;
    setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
    setMode("log"); // Switch to log mode to add notes
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Mode tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode("call")}
            className={cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors", mode === "call" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600")}
          >
            Make Call
          </button>
          <button
            type="button"
            onClick={() => setMode("log")}
            className={cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors", mode === "log" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600")}
          >
            Log Call
          </button>
        </div>

        {mode === "call" ? (
          <div className="space-y-4">
            {!isCallActive ? (
              <>
                <div className="text-center py-4">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Call Patient</p>
                  <p className="text-sm text-gray-500">{patientPhone}</p>
                </div>
                <button
                  type="button"
                  onClick={startCall}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                >
                  Start Call
                </button>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-pulse">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Call in Progress</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{formatTime(callTimer)}</p>
                  <p className="text-sm text-gray-500 mt-1">{patientPhone}</p>
                </div>
                <button
                  type="button"
                  onClick={endCall}
                  className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
                >
                  End Call
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Log Phone Call</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Call Direction</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDirection("outbound")} className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium", direction === "outbound" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600")}>Outbound</button>
                <button type="button" onClick={() => setDirection("inbound")} className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium", direction === "inbound" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600")}>Inbound</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Duration</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. 15 min" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Summary of the call..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Call</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SendMessageModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");

  // Mock message history
  const messages = [
    { id: "m1", text: "Hi, how are you feeling today?", sender: "provider", time: "10:30 AM" },
    { id: "m2", text: "I'm doing better, thanks for checking in!", sender: "patient", time: "10:45 AM" },
    { id: "m3", text: "That's great to hear. Remember to complete your breathing exercises.", sender: "provider", time: "11:00 AM" },
    { id: "m4", text: "Will do. I've been practicing every morning.", sender: "patient", time: "11:15 AM" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" onClick={onClose}>
      <div className="h-full w-full max-w-lg bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
              P
            </div>
            <div>
              <p className="font-medium text-gray-900">Patient</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender === "provider" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2", msg.sender === "provider" ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md")}>
                <p className="text-sm">{msg.text}</p>
                <p className={cn("text-[10px] mt-1", msg.sender === "provider" ? "text-blue-200" : "text-gray-400")}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) setMessage(""); }} className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button type="submit" disabled={!message.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AssignActivityModal({ onClose }: { onClose: () => void }) {
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [frequency, setFrequency] = useState("Daily");

  // Mock treatment plans - in real app, these would come from props or context
  const treatmentPlans = [
    { id: "plan-1", name: "Depression Management Plan", status: "active" },
    { id: "plan-2", name: "Anxiety Reduction Plan", status: "active" },
  ];

  const activities = [
    { id: "breathing", name: "Breathing Exercise", category: "Relaxation" },
    { id: "journaling", name: "Daily Journal", category: "Reflection" },
    { id: "gratitude", name: "Gratitude Practice", category: "Mindfulness" },
    { id: "grounding", name: "5-4-3-2-1 Grounding", category: "Coping Skills" },
    { id: "thought_record", name: "Thought Record", category: "CBT" },
    { id: "mood_tracking", name: "Mood Tracking", category: "Self-Awareness" },
  ];

  const canSubmit = selectedActivity && selectedPlan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Assign Activity</h2>
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4">
          {/* Treatment Plan Selection - Required */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Treatment Plan <span className="text-red-500">*</span>
            </label>
            {treatmentPlans.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">No active treatment plans found.</p>
                <p className="text-xs text-amber-600 mt-1">Please create a treatment plan first before assigning activities.</p>
              </div>
            ) : (
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              >
                <option value="">Select a treatment plan...</option>
                {treatmentPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Activity Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Activity <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => setSelectedActivity(activity.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    selectedActivity === activity.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <p className={cn("text-sm font-medium", selectedActivity === activity.id ? "text-blue-700" : "text-gray-900")}>{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.category}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="Daily">Daily</option>
              <option value="3x / week">3x per week</option>
              <option value="Weekly">Weekly</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button 
              type="submit" 
              disabled={!canSubmit} 
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
