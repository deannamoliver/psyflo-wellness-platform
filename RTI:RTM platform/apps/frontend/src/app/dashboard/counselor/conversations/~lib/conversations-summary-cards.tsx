import { Clock, Lock, MessageSquare, MessageSquareWarning } from "lucide-react";
import {
  SUMMARY_CARDS_GRID_CLASS,
  SummaryCard,
} from "@/lib/core-ui/summary-card";
import type { ConversationSummary } from "./data";

export function ConversationsSummaryCards({
  summary,
}: {
  summary: ConversationSummary;
}) {
  return (
    <div className={SUMMARY_CARDS_GRID_CLASS}>
      <SummaryCard
        label="Active Conversations"
        value={summary.active}
        sublabel="Currently in conversation"
        iconBgColor="bg-blue-50"
        valueColor="text-blue-600"
        icon={<MessageSquare className="size-5 text-blue-600" />}
      />
      <SummaryCard
        label="Needs Reply"
        value={summary.needsCoachReply}
        sublabel="Awaiting your response"
        iconBgColor="bg-red-50"
        valueColor="text-red-600"
        icon={<MessageSquareWarning className="size-5 text-red-600" />}
      />
      <SummaryCard
        label="Waiting on Patient"
        value={summary.waitingOnStudent}
        sublabel="Awaiting patient response"
        iconBgColor="bg-amber-50"
        valueColor="text-amber-600"
        icon={<Clock className="size-5 text-amber-600" />}
      />
      <SummaryCard
        label="Closed"
        value={summary.closed}
        sublabel="Successfully completed conversations"
        iconBgColor="bg-gray-100"
        valueColor="text-gray-600"
        icon={<Lock className="size-5 text-gray-500" />}
      />
    </div>
  );
}
