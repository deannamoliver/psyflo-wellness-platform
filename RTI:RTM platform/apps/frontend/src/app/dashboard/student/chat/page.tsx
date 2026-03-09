import { PlusIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import { Muted, P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

export default function ChatPage() {
  return (
    <div className={cn("flex flex-1 gap-0")}>
      <div className="flex flex-1 flex-col overflow-clip rounded-lg border">
        {/* Header - same as ai-chat */}
        <div className="flex flex-shrink-0 items-center gap-4 bg-card p-4">
          <Avatar>
            <AvatarImage src="/chat/chatbot.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <P>Soli</P>
            <Muted className="flex items-center gap-1">
              <span className="inline-flex size-2 animate-pulse rounded-full bg-green-500" />{" "}
              Ready to help you get started
            </Muted>
          </div>
        </div>

        {/* Centered instructions */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <h1 className="mb-4 font-bold text-2xl">Welcome to Soli</h1>
              <p className="text-muted-foreground">
                To get started, choose one of the options below:
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <PlusIcon className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Create New Session
                  </h3>
                </div>
                <p className="text-blue-700 text-sm dark:text-blue-300">
                  Click the <strong>+</strong> button in the sidebar to start a
                  new conversation.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Continue Existing
                  </h3>
                </div>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Select a previous conversation from the sidebar to continue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No input section - this is the key difference from ai-chat */}
      </div>
    </div>
  );
}
