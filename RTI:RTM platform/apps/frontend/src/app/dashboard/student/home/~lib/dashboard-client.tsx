"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { useExpertTopic } from "./expert-topic-context";
import DesktopHomeView from "./desktop-home-view";
import MobileHomeView from "./mobile-home-view";

type Session = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

import type { Message, WellnessCoachMessage } from "@/lib/chat/types";
import type {
  StoredAssessment,
  StoredExercise,
} from "@/app/dashboard/~lib/provider-data-actions";

type DashboardClientProps = {
  firstName: string;
  fullName: string;
  userEmail: string;
  initialSessions: Session[];
  soliStateData: SoliStateData;
  todoExercises?: StoredExercise[];
  todoAssessments?: StoredAssessment[];
};

export default function DashboardClient({
  firstName,
  fullName,
  userEmail,
  initialSessions,
  soliStateData,
  todoExercises,
  todoAssessments,
}: DashboardClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  // Mobile chat state (mobile still opens chat inline)
  const [mobileActiveSessionId, setMobileActiveSessionId] = useState<
    string | null
  >(null);
  const [mobileActiveMessages, setMobileActiveMessages] = useState<Message[]>(
    [],
  );
  const [mobileCoachFirstName, setMobileCoachFirstName] = useState<
    string | null
  >(null);
  const [mobileWellnessCoachMessages, setMobileWellnessCoachMessages] =
    useState<WellnessCoachMessage[]>([]);
  const [mobileWellnessHandoffId, setMobileWellnessHandoffId] = useState<
    string | null
  >(null);
  const [mobilePendingFirstMessage, setMobilePendingFirstMessage] = useState<
    string | null
  >(null);
  const [mobileChatKey, setMobileChatKey] = useState(0);
  const [mobileActiveSubject, setMobileActiveSubject] = useState<string | null>(
    null,
  );
  const [mobileLoadingSessionId, setMobileLoadingSessionId] = useState<
    string | null
  >(null);

  const { expertTopic, clearExpertTopic } = useExpertTopic();
  const prevExpertTopicRef = useRef(expertTopic);

  // When an expert topic is selected, reset mobile chat
  useEffect(() => {
    if (expertTopic && expertTopic !== prevExpertTopicRef.current) {
      setMobileActiveSessionId(null);
      setMobileActiveMessages([]);
      setMobileCoachFirstName(null);
      setMobileWellnessCoachMessages([]);
      setMobileWellnessHandoffId(null);
      setMobilePendingFirstMessage(null);
      setMobileChatKey((prev) => prev + 1);
    }
    prevExpertTopicRef.current = expertTopic;
  }, [expertTopic]);

  const fetchMobileSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setMobileActiveMessages(data.messages || []);
        setMobileCoachFirstName(data.assignedCoachFirstName ?? null);
        setMobileWellnessCoachMessages(data.wellnessCoachMessages || []);
        setMobileWellnessHandoffId(data.wellnessHandoffId ?? null);
        setMobileActiveSubject(data.subject ?? null);
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
      setMobileActiveMessages([]);
      setMobileCoachFirstName(null);
      setMobileWellnessCoachMessages([]);
      setMobileWellnessHandoffId(null);
      setMobileActiveSubject(null);
    }
  };

  // Desktop: navigate to chat page for a specific session
  const handleDesktopSelectSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, hasUnread: false } : s)),
    );
    fetch(`/api/chat/sessions/${sessionId}/read`, { method: "POST" }).catch(
      () => {},
    );
    router.push(`/dashboard/student/chat/${sessionId}`);
  };

  // Mobile handlers
  const handleMobileNewChat = () => {
    clearExpertTopic();
    setMobileActiveSessionId(null);
    setMobileActiveMessages([]);
    setMobileCoachFirstName(null);
    setMobileWellnessCoachMessages([]);
    setMobileWellnessHandoffId(null);
    setMobileActiveSubject(null);
    setMobilePendingFirstMessage(null);
    setMobileChatKey((prev) => prev + 1);
  };

  const handleMobileSelectSession = async (sessionId: string) => {
    clearExpertTopic();
    setMobileActiveSessionId(sessionId);
    setMobileLoadingSessionId(sessionId);
    setMobileActiveMessages([]); // Clear so we don't show previous session's messages while loading
    setMobileCoachFirstName(null);
    setMobileWellnessCoachMessages([]);
    setMobileWellnessHandoffId(null);
    setMobileActiveSubject(null);
    // Optimistically mark as read in local state
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, hasUnread: false } : s)),
    );
    await fetchMobileSessionData(sessionId);
    setMobileLoadingSessionId(null);
    setMobileChatKey((prev) => prev + 1);
    // Fire-and-forget mark as read on server
    fetch(`/api/chat/sessions/${sessionId}/read`, { method: "POST" }).catch(
      () => {},
    );
  };

  const handleMobileSessionCreated = (
    session: Session,
    firstMessage?: string,
  ) => {
    setSessions((prev) => [session, ...prev]);
    setMobileActiveSessionId(session.id);
    if (firstMessage != null) setMobilePendingFirstMessage(firstMessage);
  };

  return (
    <>
      {/* Mobile View */}
      <MobileHomeView
        key={`mobile-${mobileChatKey}`}
        firstName={firstName}
        fullName={fullName}
        userEmail={userEmail}
        sessions={sessions}
        activeSessionId={mobileActiveSessionId}
        activeMessages={mobileActiveMessages}
        activeCoachFirstName={mobileCoachFirstName}
        activeWellnessCoachMessages={mobileWellnessCoachMessages}
        activeWellnessHandoffId={mobileWellnessHandoffId}
        pendingFirstMessage={mobilePendingFirstMessage}
        onPendingFirstMessageSent={() => setMobilePendingFirstMessage(null)}
        soliStateData={soliStateData}
        onNewChat={handleMobileNewChat}
        onSelectSession={handleMobileSelectSession}
        onSessionCreated={handleMobileSessionCreated}
        onRealtimeRefreshSession={(sessionId) =>
          fetchMobileSessionData(sessionId)
        }
        isLoadingChat={mobileLoadingSessionId !== null}
        expertTopic={expertTopic}
        activeSubject={mobileActiveSubject}
      />

      {/* Desktop View - Wellness Dashboard */}
      <div className="hidden min-w-0 flex-1 overflow-hidden lg:flex lg:flex-col">
        <DesktopHomeView
          firstName={firstName}
          fullName={fullName}
          userEmail={userEmail}
          sessions={sessions}
          soliStateData={soliStateData}
          onSelectSession={handleDesktopSelectSession}
          todoExercises={todoExercises}
          todoAssessments={todoAssessments}
        />
      </div>
    </>
  );
}
