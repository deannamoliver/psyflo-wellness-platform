"use client";

import { differenceInYears, format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Eye,
  Info,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  Shield,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { activateSafetyWorkflow } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/safety-workflow-actions";
import { SafetyWorkflowModal } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/safety-workflow-modal";
import { SafetyWorkflowSidebar } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/safety-workflow-sidebar";
import type { SafetyWorkflowData } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/safety-workflow-types";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
import { Button } from "@/lib/core-ui/button";
import { useHandoffRealtime } from "@/lib/realtime/use-handoff-realtime";
import {
  shouldRefreshForWellnessEvent,
  type WellnessRealtimeEvent,
} from "@/lib/realtime/wellness-events";
import { cn } from "@/lib/tailwind-utils";
import { AiConversationHistory } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/ai-conversation-history";
import { sendAdminMessage } from "./actions";
import { AdminCloseModal } from "./admin-close-modal";
import { AdminTransferModal } from "./admin-transfer-modal";
import { TakeoverModal } from "./takeover-modal";
import type {
  AdminConversationDetail,
  AiMessage,
  ChatEntry,
  TransferCoach,
  TransferEvent,
} from "./types";

type Props = {
  conversation: AdminConversationDetail;
  coaches: TransferCoach[];
  activeWorkflow: SafetyWorkflowData | null;
  coachName: string;
};

export function AdminConversationDetailView({
  conversation,
  coaches,
  activeWorkflow: initialWorkflow,
  coachName,
}: Props) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConnectedOnceRef = useRef(false);
  const [showTakeover, setShowTakeover] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [workflow, setWorkflow] = useState<SafetyWorkflowData | null>(
    initialWorkflow,
  );
  const [, startTransition] = useTransition();

  const isActive =
    conversation.status === "pending" ||
    conversation.status === "accepted" ||
    conversation.status === "in_progress";
  const canChat = conversation.isTakenOver && isActive;
  const [pendingMessages, setPendingMessages] = useState<ChatEntry[]>([]);

  // De-duplicate: remove pending messages that now exist in server data
  const serverMessageCount = conversation.messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: de-dup pending when server messages change
  useEffect(() => {
    setPendingMessages((prev) => {
      if (prev.length === 0) return prev;
      const serverSet = new Set(
        conversation.messages.map((m) => `${m.author}:${m.content}`),
      );
      return prev.filter((p) => !serverSet.has(`${p.author}:${p.content}`));
    });
  }, [serverMessageCount]);

  const adminInitials = coachName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleOptimisticSend = useCallback(
    (content: string) => {
      setPendingMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content,
          author: "coach",
          createdAt: new Date().toISOString(),
          senderInitials: adminInitials,
        },
      ]);
    },
    [adminInitials],
  );

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) return;
    refreshTimeoutRef.current = setTimeout(() => {
      refreshTimeoutRef.current = null;
      router.refresh();
    }, 250);
  }, [router]);

  useEffect(
    () => () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    },
    [],
  );

  useHandoffRealtime({
    handoffId: conversation.handoffId,
    enabled: true,
    onEvent: (event: WellnessRealtimeEvent) => {
      if (event.type === "message.created") {
        const { content } = event;
        if (event.author === "student" && content) {
          // Display student message directly from WebSocket
          setPendingMessages((prev) => [
            ...prev,
            {
              id: event.messageId ?? crypto.randomUUID(),
              content,
              author: "student",
              createdAt: event.createdAt,
              senderInitials: conversation.studentInitials,
            },
          ]);
          scheduleRefresh();
          return;
        }
        // Coach's own echo — already shown optimistically
        if (event.author === "coach") {
          scheduleRefresh();
          return;
        }
      }
      if (shouldRefreshForWellnessEvent(event)) {
        scheduleRefresh();
      }
    },
    onOpen: () => {
      // Only refresh on RE-connections to catch messages missed during disconnection
      if (hasConnectedOnceRef.current) {
        scheduleRefresh();
      }
      hasConnectedOnceRef.current = true;
    },
  });

  const allMessages = [...conversation.messages, ...pendingMessages];

  async function handleActivateWorkflow() {
    startTransition(async () => {
      const workflowId = await activateSafetyWorkflow(
        conversation.handoffId,
        conversation.studentId,
        conversation.schoolId,
      );
      setWorkflow({
        id: workflowId,
        handoffId: conversation.handoffId,
        studentId: conversation.studentId,
        studentName: conversation.studentName,
        studentGrade: conversation.gradeLabel,
        schoolId: conversation.schoolId,
        status: "active",
        isDuringSchoolHours: false,
        activatedAt: new Date().toISOString(),
        immediateDanger: null,
        concernType: null,
        assessmentData: null,
        riskLevel: null,
        professionalJudgment: null,
        actData: null,
      });
      setShowSafetyModal(false);
    });
  }

  return (
    <div
      className="flex h-[calc(100vh-64px)]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with back button */}
        <div className="flex items-center gap-3 border-gray-200 border-b bg-white px-6 py-3">
          <Link
            href="/dashboard/admin/conversations"
            className="flex items-center gap-2 font-medium text-gray-500 text-sm hover:text-gray-700"
          >
            <ArrowLeft className="size-4" />
            Back to Conversations
          </Link>
        </div>

        {/* Student Info Header */}
        <StudentInfoHeader conversation={conversation} />

        {/* Emergency Contacts */}
        {conversation.emergencyContacts.length > 0 && (
          <EmergencyContactsSection contacts={conversation.emergencyContacts} />
        )}

        {/* Chat area */}
        <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
          <ChatMessagesArea
            aiMessages={conversation.aiMessages}
            studentInitials={conversation.studentInitials}
            messages={allMessages}
            reason={conversation.reason}
            topic={conversation.topic}
            safetyWorkflowActivatedAt={conversation.safetyWorkflowActivatedAt}
            safetyWorkflowInitiatedBy={conversation.safetyWorkflowInitiatedBy}
            transferEvents={conversation.transferEvents}
          />

          {/* Bottom bar */}
          {canChat ? (
            <ActiveChatInput
              handoffId={conversation.handoffId}
              conversation={conversation}
              coaches={coaches}
              onShowClose={() => setShowClose(true)}
              onShowTransfer={() => setShowTransfer(true)}
              onStartSafetyWorkflow={() => setShowSafetyModal(true)}
              onOptimisticSend={handleOptimisticSend}
            />
          ) : isActive ? (
            <ObservingBanner
              coachName={conversation.coachName}
              onTakeover={() => setShowTakeover(true)}
            />
          ) : (
            <ClosedBanner />
          )}
        </div>
      </div>

      {/* Safety Workflow Sidebar */}
      {workflow && (
        <SafetyWorkflowSidebar
          workflow={workflow}
          schoolName={conversation.school}
          studentDateOfBirth={conversation.dateOfBirth}
          coachName={coachName}
          onClose={() => setWorkflow(null)}
        />
      )}

      {/* Modals */}
      <TakeoverModal
        open={showTakeover}
        onOpenChange={setShowTakeover}
        handoffId={conversation.handoffId}
        coachName={conversation.coachName}
        studentName={conversation.studentName}
      />
      <AdminCloseModal
        open={showClose}
        onOpenChange={setShowClose}
        conversation={conversation}
      />
      <AdminTransferModal
        open={showTransfer}
        onOpenChange={setShowTransfer}
        conversation={conversation}
        coaches={coaches}
      />
      <SafetyWorkflowModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onActivate={handleActivateWorkflow}
        studentName={conversation.studentName}
        studentGrade={conversation.gradeLabel}
        schoolName={conversation.school}
        dateOfBirth={conversation.dateOfBirth}
      />
    </div>
  );
}

/* ---------- Student Info Header ---------- */

function StudentInfoHeader({
  conversation,
}: {
  conversation: AdminConversationDetail;
}) {
  const age = conversation.dateOfBirth
    ? differenceInYears(new Date(), new Date(conversation.dateOfBirth))
    : null;

  const dobDisplay = conversation.dateOfBirth
    ? `${format(new Date(conversation.dateOfBirth), "MMMM d, yyyy")}${age != null ? ` (${age} years old)` : ""}`
    : "N/A";

  return (
    <div className="border-gray-200 border-b bg-white px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-gray-900 text-xl">
              {conversation.studentName}
            </h1>
            <span className="rounded-md bg-gray-200 px-3 py-1 font-medium text-gray-900 text-xs">
              {conversation.gradeLabel}
            </span>
            {conversation.hasAlert && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-semibold text-red-700 text-xs">
                <Shield className="size-3" />
                Alert Active
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-12 gap-y-1 text-sm lg:grid-cols-4">
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                DOB/Age
              </span>
              <p className="text-gray-900">{dobDisplay}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Email
              </span>
              <p className="text-gray-900">{conversation.email ?? "N/A"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Grade
              </span>
              <p className="text-gray-900">{conversation.gradeLabel}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Home Address
              </span>
              <p className="text-gray-900">
                {conversation.homeAddress?.trim() || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">
            Coach:{" "}
            <span className="font-medium text-gray-900">
              {conversation.coachName}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Emergency Contacts Section ---------- */

function EmergencyContactsSection({
  contacts,
}: {
  contacts: AdminConversationDetail["emergencyContacts"];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-gray-200 border-b bg-white px-6 py-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 font-medium text-gray-700 text-sm"
      >
        <Phone className="size-4 text-blue-600" />
        Emergency Contacts ({contacts.length})
        <span className="text-gray-400 text-xs">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">
                  {contact.name}
                </p>
                {contact.tag && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-medium text-[10px] uppercase",
                      contact.tag === "primary"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {contact.tag.replace("_", " ")}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs capitalize">
                {contact.relation} ({contact.contactType})
              </p>
              {contact.primaryPhone && (
                <p className="mt-1 text-gray-700 text-xs">
                  {contact.primaryPhone}
                </p>
              )}
              {contact.primaryEmail && (
                <p className="text-gray-700 text-xs">{contact.primaryEmail}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Chat Messages Area ---------- */

function AIContextBanner({ reason, topic }: { reason: string; topic: string }) {
  return (
    <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-gray-100 border-b px-4 py-2.5">
        <Info className="size-3.5 text-blue-500" />
        <span className="font-medium text-gray-700 text-xs">
          AI Conversation Context
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 px-4 py-3">
        <div className="pr-4">
          <div className="mb-1 font-medium text-[10px] text-gray-400 uppercase tracking-wider">
            Reason
          </div>
          <p className="text-gray-800 text-sm">{reason}</p>
        </div>
        <div className="pl-4">
          <div className="mb-1 flex items-center gap-1 font-medium text-[10px] text-gray-400 uppercase tracking-wider">
            <MessageCircle className="size-3" />
            Topic
          </div>
          <p className="text-gray-800 text-sm">{topic}</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ entry }: { entry: ChatEntry }) {
  const isCoach = entry.author === "coach";
  const time = format(new Date(entry.createdAt), "h:mm a");

  if (isCoach) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[70%]">
          <div className="rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white">
            {entry.content}
          </div>
          <div className="mt-1 text-right text-gray-400 text-xs">{time}</div>
        </div>
        <Avatar className="mt-1 size-8 shrink-0">
          <AvatarFallback className="bg-blue-600 font-semibold text-white text-xs">
            {entry.senderInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarFallback className="bg-green-600 font-semibold text-white text-xs">
          {entry.senderInitials}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%]">
        <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 text-gray-900 text-sm">
          {entry.content}
        </div>
        <div className="mt-1 text-gray-400 text-xs">{time}</div>
      </div>
    </div>
  );
}

function SafetyWorkflowBanner({ initiatedBy }: { initiatedBy: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-red-500 border-l-4 bg-red-50 px-4 py-3">
      <AlertTriangle className="size-5 shrink-0 text-red-500" />
      <span className="font-semibold text-red-700 text-sm">
        {initiatedBy ?? "Coach"} initiated safety workflow.
      </span>
    </div>
  );
}

function TransferBanner({ event }: { event: TransferEvent }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-blue-500 border-l-4 bg-blue-50 px-4 py-3">
      <ArrowRightLeft className="size-5 shrink-0 text-blue-500" />
      <span className="text-blue-700 text-sm">
        {event.eventType === "takeover" ? (
          <>
            <span className="font-semibold">{event.performedByName}</span> took
            over this conversation
            {event.transferToName && (
              <>
                {" "}
                from{" "}
                <span className="font-semibold">{event.transferToName}</span>
              </>
            )}
            .
          </>
        ) : (
          <>
            Conversation transferred from{" "}
            <span className="font-semibold">{event.performedByName}</span> to{" "}
            <span className="font-semibold">
              {event.transferToName ?? "another coach"}
            </span>
            .
          </>
        )}
      </span>
    </div>
  );
}

function findEventBannerPositions(
  messages: ChatEntry[],
  events: TransferEvent[],
): Map<number, TransferEvent[]> {
  const map = new Map<number, TransferEvent[]>();
  for (const event of events) {
    const eventTime = new Date(event.createdAt).getTime();
    let position = -2;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && new Date(msg.createdAt).getTime() <= eventTime) {
        position = i;
        break;
      }
    }
    const existing = map.get(position) ?? [];
    existing.push(event);
    map.set(position, existing);
  }
  return map;
}

function findSafetyBannerIndex(
  messages: ChatEntry[],
  activatedAt: string | null,
): number {
  if (!activatedAt) return -1;
  const activatedTime = new Date(activatedAt).getTime();
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg && new Date(msg.createdAt).getTime() <= activatedTime) {
      return i;
    }
  }
  return -2; // before all messages
}

function ChatMessagesArea({
  aiMessages,
  studentInitials,
  messages,
  reason,
  topic,
  safetyWorkflowActivatedAt,
  safetyWorkflowInitiatedBy,
  transferEvents,
}: {
  aiMessages: AiMessage[];
  studentInitials: string;
  messages: ChatEntry[];
  reason: string;
  topic: string;
  safetyWorkflowActivatedAt: string | null;
  safetyWorkflowInitiatedBy: string | null;
  transferEvents: TransferEvent[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bannerAfterIndex = findSafetyBannerIndex(
    messages,
    safetyWorkflowActivatedAt,
  );
  const transferPositions = findEventBannerPositions(messages, transferEvents);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <AIContextBanner reason={reason} topic={topic} />
      <div className="mx-auto max-w-3xl space-y-4">
        <AiConversationHistory
          aiMessages={aiMessages}
          studentInitials={studentInitials}
        />
        {bannerAfterIndex === -2 && (
          <SafetyWorkflowBanner initiatedBy={safetyWorkflowInitiatedBy} />
        )}
        {transferPositions.get(-2)?.map((evt) => (
          <TransferBanner key={evt.id} event={evt} />
        ))}
        {messages.map((msg, i) => (
          <div key={msg.id} className="space-y-4">
            <MessageBubble entry={msg} />
            {i === bannerAfterIndex && (
              <SafetyWorkflowBanner initiatedBy={safetyWorkflowInitiatedBy} />
            )}
            {transferPositions.get(i)?.map((evt) => (
              <TransferBanner key={evt.id} event={evt} />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/* ---------- Bottom Bars ---------- */

function ObservingBanner({
  coachName,
  onTakeover,
}: {
  coachName: string;
  onTakeover: () => void;
}) {
  return (
    <div className="border-gray-200 border-t bg-blue-50/60 px-6 py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eye className="size-6 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">
            You are observing this conversation
          </p>
          <p className="text-blue-600 text-xs">
            Messages between the student and {coachName} are shown in real time.
          </p>
        </div>
        <Button
          onClick={onTakeover}
          className="mt-1 gap-1.5 bg-red-600 text-white hover:bg-red-700"
          size="sm"
        >
          Take Over Conversation
        </Button>
      </div>
    </div>
  );
}

function ClosedBanner() {
  return (
    <div className="border-gray-200 border-t bg-gray-50 px-6 py-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold text-gray-600 text-sm">
          This conversation has been closed
        </p>
        <p className="text-gray-500 text-xs">
          You can view the conversation history, but no new messages can be
          sent.
        </p>
      </div>
    </div>
  );
}

function ActiveChatInput({
  handoffId,
  conversation: _conversation,
  coaches: _coaches,
  onShowClose,
  onShowTransfer,
  onStartSafetyWorkflow,
  onOptimisticSend,
}: {
  handoffId: string;
  conversation: AdminConversationDetail;
  coaches: TransferCoach[];
  onShowClose: () => void;
  onShowTransfer: () => void;
  onStartSafetyWorkflow: () => void;
  onOptimisticSend?: (content: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!message.trim() || isPending) return;
    const text = message;
    setMessage("");
    onOptimisticSend?.(text);
    startTransition(async () => {
      await sendAdminMessage(handoffId, text);
    });
  }

  return (
    <div className="border-gray-200 border-t bg-white">
      {/* Message input */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <input
            type="text"
            placeholder="Type your message to the student..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isPending}
            className="flex-1 border-none bg-transparent text-gray-900 text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-gray-100 border-t px-6 py-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-red-200 bg-red-600 text-white",
              "hover:bg-red-700 hover:text-white",
            )}
            onClick={onStartSafetyWorkflow}
            disabled={isPending}
          >
            Start Safety Workflow
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={onShowTransfer}
            disabled={isPending}
          >
            <ArrowRightLeft className="size-3.5" />
            Transfer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={onShowClose}
            disabled={isPending}
          >
            <XCircle className="size-3.5" />
            End Chat
          </Button>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSend}
          disabled={!message.trim() || isPending}
        >
          Send Message
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
