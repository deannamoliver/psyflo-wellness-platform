import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import { P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";
import type { Session } from "./types";

type ChatSessionItemProps = {
  session: Session;
  isActive: boolean;
  basePath: string;
  className?: string;
};

export default function ChatSessionItem({
  session,
  isActive,
  basePath,
  className,
}: ChatSessionItemProps) {
  return (
    <Button
      className={cn(
        "mb-2 flex w-full flex-col items-start gap-2 rounded-lg p-3 text-left transition-colors",
        isActive && "border border-border/30 bg-accent",
        className,
      )}
      asChild
    >
      <Link href={`${basePath}/${session.id}`}>
        <div className="flex w-full items-center justify-between gap-2">
          <P className="flex-1 truncate font-medium text-sm">
            {session.title || "Untitled"}
          </P>
          {session.hasUnread && !isActive && (
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
      </Link>
    </Button>
  );
}
