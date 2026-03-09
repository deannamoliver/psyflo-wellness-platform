"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowRightLeft, Home, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useHandoffRealtime } from "@/lib/realtime/use-handoff-realtime";
import {
  shouldRefreshForWellnessEvent,
  type WellnessRealtimeEvent,
} from "@/lib/realtime/wellness-events";
import { cn } from "@/lib/tailwind-utils";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ConversationSidebar } from "./conversation-sidebar";
import { activateSafetyWorkflow } from "./safety-workflow-actions";
import { SafetyWorkflowModal } from "./safety-workflow-modal";
import { SafetyWorkflowSidebar } from "./safety-workflow-sidebar";
import type { SafetyWorkflowData } from "./safety-workflow-types";
import { StudentInfoHeader } from "./student-info-header";
import type {
  ChatEntry,
  ConversationDetail as ConversationDetailType,
  ConversationStatus,
  InboxItem,
  TransferCoach,
} from "./types";

const STATUS_LABEL: Record<ConversationStatus, string> = {
  needs_coach_reply: "Needs Reply",
  waiting_on_student: "Waiting on Patient",
  closed: "Closed",
  transferred: "Transferred",
};

const STATUS_PILL: Record<
  ConversationStatus,
  { bg: string; text: string; dot: string; icon?: React.ReactNode }
> = {
  needs_coach_reply: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-600",
  },
  waiting_on_student: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-600",
  },
  closed: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "",
    icon: <Lock className="size-3 shrink-0" />,
  },
  transferred: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "",
    icon: <ArrowRightLeft className="size-3 shrink-0" />,
  },
};

type ConversationDetailProps = {
  conversation: ConversationDetailType;
  inboxConversations: InboxItem[];
  coachName: string;
  activeWorkflow: SafetyWorkflowData | null;
  coaches: TransferCoach[];
};

export function ConversationDetailView({
  conversation,
  inboxConversations,
  coachName,
  activeWorkflow: initialWorkflow,
  coaches,
}: ConversationDetailProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConnectedOnceRef = useRef(false);
  const isClosed =
    conversation.status === "closed" || conversation.status === "transferred";
  const [showModal, setShowModal] = useState(false);
  const [workflow, setWorkflow] = useState<SafetyWorkflowData | null>(
    initialWorkflow,
  );
  const [, startTransition] = useTransition();

  const safetyModeActive = workflow !== null;
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

  const coachInitials = coachName
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
          senderInitials: coachInitials,
        },
      ]);
    },
    [coachInitials],
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
          // Still refresh so server data catches up
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
      setShowModal(false);
    });
  }

  return (
    <div
      className="flex h-[calc(100vh-64px)]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <ConversationSidebar
        conversations={inboxConversations}
        currentHandoffId={conversation.handoffId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 border-gray-200 border-b bg-white px-6 py-2 text-gray-500 text-xs">
          <Link
            href="/dashboard/counselor/home"
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <Home className="size-3" />
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-700">
            Conversation- {conversation.topic}
          </span>
        </div>

        <StudentInfoHeader conversation={conversation} />

        {/* Status bar */}
        <div className="flex items-center justify-between border-gray-200 border-b bg-white px-6 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2.5 rounded-full",
                isClosed ? "bg-gray-400" : "bg-green-500",
              )}
            />
            <span className="font-medium text-gray-900">
              {conversation.status === "transferred"
                ? "Transferred Conversation"
                : isClosed
                  ? "Closed Conversation"
                  : "Active Conversation"}
            </span>
            <span className="text-gray-400">
              {conversation.status === "transferred" &&
              conversation.transferredAt
                ? `Transferred ${formatDistanceToNow(new Date(conversation.transferredAt), { addSuffix: true })}`
                : conversation.status === "closed" && conversation.closedAt
                  ? `Closed ${formatDistanceToNow(new Date(conversation.closedAt), { addSuffix: true })}`
                  : `Started ${formatDistanceToNow(new Date(conversation.startedAt), { addSuffix: true })}`}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-xs",
              STATUS_PILL[conversation.status].bg,
              STATUS_PILL[conversation.status].text,
            )}
          >
            {STATUS_PILL[conversation.status].icon ?? (
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  STATUS_PILL[conversation.status].dot,
                )}
              />
            )}
            {STATUS_LABEL[conversation.status]}
          </span>
        </div>

        {/* Chat area */}
        <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
          <ChatMessages
            aiMessages={conversation.aiMessages}
            messages={allMessages}
            studentInitials={conversation.studentInitials}
            reason={conversation.reason}
            topic={conversation.topic}
            safetyWorkflowActivatedAt={conversation.safetyWorkflowActivatedAt}
            safetyWorkflowInitiatedBy={conversation.safetyWorkflowInitiatedBy}
            transferEvents={conversation.transferEvents}
          />

          <ChatInput
            handoffId={conversation.handoffId}
            isClosed={isClosed}
            safetyModeActive={safetyModeActive}
            onStartSafetyWorkflow={() => setShowModal(true)}
            onOptimisticSend={handleOptimisticSend}
            conversation={conversation}
            coaches={coaches}
          />
        </div>
      </div>

      {/* Safety Workflow Sidebar */}
      {safetyModeActive && workflow && (
        <SafetyWorkflowSidebar
          workflow={workflow}
          schoolName={conversation.school}
          studentDateOfBirth={conversation.dateOfBirth}
          coachName={coachName}
          onClose={() => setWorkflow(null)}
        />
      )}

      {/* Safety Workflow Activation Modal */}
      <SafetyWorkflowModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onActivate={handleActivateWorkflow}
        studentName={conversation.studentName}
        studentGrade={conversation.gradeLabel}
        schoolName={conversation.school}
        dateOfBirth={conversation.dateOfBirth}
        status={conversation.status}
      />
    </div>
  );
}
