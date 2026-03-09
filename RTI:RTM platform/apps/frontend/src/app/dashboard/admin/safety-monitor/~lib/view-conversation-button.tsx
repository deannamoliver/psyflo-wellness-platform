"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { ConversationData } from "../[alertId]/~lib/queries";
import { ViewConversationModal } from "../[alertId]/~lib/view-conversation-modal";
import { fetchConversationAction } from "./actions";

export function ViewConversationButton({ handoffId }: { handoffId: string }) {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationData | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const data = await fetchConversationAction(handoffId);
      if (data) {
        setConversation(data);
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800 disabled:opacity-50"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        View Conversation
      </button>

      {conversation && (
        <ViewConversationModal
          open={open}
          onClose={() => setOpen(false)}
          conversation={conversation}
        />
      )}
    </>
  );
}
