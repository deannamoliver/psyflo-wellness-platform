export type WellnessRealtimeEvent =
  | {
      type: "message.created";
      handoffId: string;
      messageId?: string;
      author: "student" | "coach";
      content?: string;
      createdAt: string;
    }
  | {
      type: "handoff.assigned";
      handoffId: string;
      assignedCoachId: string;
      createdAt: string;
    }
  | {
      type: "handoff.transferred";
      handoffId: string;
      toCoachId: string;
      createdAt: string;
    }
  | {
      type: "handoff.closed";
      handoffId: string;
      createdAt: string;
    }
  | {
      type: "handoff.reopened";
      handoffId: string;
      createdAt: string;
    }
  | {
      type: "handoff.taken_over";
      handoffId: string;
      byAdminId: string;
      createdAt: string;
    };

export function shouldRefreshForWellnessEvent(
  event: WellnessRealtimeEvent,
): boolean {
  return (
    event.type === "message.created" ||
    event.type === "handoff.assigned" ||
    event.type === "handoff.transferred" ||
    event.type === "handoff.closed" ||
    event.type === "handoff.reopened" ||
    event.type === "handoff.taken_over"
  );
}
