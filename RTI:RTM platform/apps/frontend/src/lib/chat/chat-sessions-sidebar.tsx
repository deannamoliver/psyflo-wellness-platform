"use client";

import { Loader2, MessageCircleIcon, PlusIcon } from "lucide-react";
import { useSelectedLayoutSegment } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";
import ChatSessionItem from "./chat-session-item";
import type { Session } from "./types";

type ChatSessionsSidebarProps = {
  sessions: Session[];
  basePath: string;
  createAction: () => void;
  emptyMessage: string;
  className?: string;
};

export default function ChatSessionsSidebar({
  sessions,
  basePath,
  createAction,
  emptyMessage,
  className,
}: ChatSessionsSidebarProps) {
  const sessionId = useSelectedLayoutSegment();
  const [isPending, startTransition] = useTransition();

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="size-5 text-primary" />
            <P className="font-semibold">Chat Sessions</P>
          </div>
          <Button
            onClick={() => startTransition(() => createAction())}
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <P className="text-center text-muted-foreground">
                {emptyMessage}
              </P>
            </div>
          ) : (
            sessions.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isActive={sessionId === session.id}
                basePath={basePath}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
