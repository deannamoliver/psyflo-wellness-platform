import Link from "next/link";
import { Badge } from "@/lib/core-ui/badge";
import { Card } from "@/lib/core-ui/card";

export type ConversationItem = {
  id: string;
  studentName: string;
  topic: string;
  status: "pending" | "accepted" | "in_progress";
  needsCoachReply: boolean;
};

function StatusBadge({ needsCoachReply }: { needsCoachReply: boolean }) {
  if (needsCoachReply) {
    return (
      <Badge
        variant="destructive"
        className="whitespace-nowrap rounded-full bg-red-50 px-3 py-1 font-dm font-medium text-[11px] text-red-600"
      >
        Needs Reply
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="whitespace-nowrap rounded-full border-yellow-200 bg-yellow-50 px-3 py-1 font-dm font-medium text-[11px] text-yellow-700"
    >
      Waiting on Patient
    </Badge>
  );
}

function ConversationRow({ item }: { item: ConversationItem }) {
  return (
    <Link
      href={`/dashboard/counselor/conversations/${item.id}`}
      className="flex cursor-pointer items-center gap-3 border-gray-100 border-b px-5 py-3 last:border-b-0 hover:bg-gray-50"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-dm font-medium text-gray-900 text-sm">
          {item.studentName}
        </span>
      </div>
      <StatusBadge needsCoachReply={item.needsCoachReply} />
    </Link>
  );
}

export function ActiveConversations({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-dm font-semibold text-base text-gray-900">
          Active Messages
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-dm font-medium text-primary text-xs">
          {conversations.length} Active
        </span>
      </div>
      <div className="flex flex-col">
        {conversations.length === 0 ? (
          <div className="px-5 py-8 text-center font-dm text-gray-400 text-sm">
            No active conversations
          </div>
        ) : (
          conversations.map((c) => <ConversationRow key={c.id} item={c} />)
        )}
      </div>
      <div className="border-t px-5 py-3 text-center">
        <Link
          href="/dashboard/counselor/conversations"
          className="font-dm font-medium text-primary text-sm hover:text-primary/80"
        >
          View All Messages
        </Link>
      </div>
    </Card>
  );
}
