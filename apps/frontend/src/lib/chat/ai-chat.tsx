"use client";

import { MicIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import { Separator } from "@/lib/core-ui/separator";
import { Muted, P } from "@/lib/core-ui/typography";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/lib/extended-ui/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/lib/extended-ui/ai/input";
import { AIMessage, AIMessageContent } from "@/lib/extended-ui/ai/message";
import { cn } from "@/lib/tailwind-utils";
import type { Message } from "./types";

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      <span
        className="size-2 animate-pulse rounded-full bg-muted-foreground"
        style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
      />
      <span
        className="size-2 animate-pulse rounded-full bg-muted-foreground"
        style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
      />
      <span
        className="size-2 animate-pulse rounded-full bg-muted-foreground"
        style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
      />
    </div>
  );
}

type AIChatProps = {
  sessionId: string;
  sessionTitle: string;
  messages: Message[];
  statusMessage: string;
  placeholder: string;
  className?: string;
  onMessageUpdate?: (messages: Message[]) => void;
};

export default function AIChat({
  sessionId,
  sessionTitle,
  messages: initialMessages,
  statusMessage,
  placeholder,
  className,
  onMessageUpdate,
}: AIChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<EventSource | null>(null);

  const [status, setStatus] = useState<
    "ready" | "submitted" | "streaming" | "error"
  >("ready");

  // Notify parent when messages update
  useEffect(() => {
    if (onMessageUpdate && messages.length > initialMessages.length) {
      onMessageUpdate(messages);
    }
  }, [messages, onMessageUpdate, initialMessages.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const textTrimmed = text.trim();
    if (!textTrimmed) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textTrimmed,
    };

    // Check if this is the first message
    const isFirstMessage = sessionTitle === "New Chat" && messages.length === 0;
    const titleToSet = isFirstMessage
      ? textTrimmed.length > 50
        ? `${textTrimmed.substring(0, 50)}...`
        : textTrimmed
      : null;

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setStatus("streaming");
    setIsStreaming(true);

    // Close any existing stream
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }

    const params = new URLSearchParams({
      sessionId,
      message: textTrimmed,
    });

    const eventSource = new EventSource(`/api/chat/stream?${params}`);
    streamRef.current = eventSource;

    let assistantMessageId: string | null = null;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === data.id)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: data.id,
                role: "model",
                content: data.content,
              },
            ];
          });
        } else if (data.type === "chunk") {
          setMessages((prev) => {
            // Check if message with this ID already exists in state
            const existingMessage = prev.find((msg) => msg.id === data.id);

            if (existingMessage) {
              return prev.map((msg) =>
                msg.id === data.id ? { ...msg, content: data.content } : msg,
              );
            }
            const messageId = data.id || crypto.randomUUID();
            assistantMessageId = messageId;
            return [
              ...prev,
              {
                id: messageId,
                role: "model" as const,
                content: data.content,
              },
            ];
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.addEventListener("done", async () => {
      eventSource.close();
      streamRef.current = null;
      setIsStreaming(false);
      setStatus("ready");

      // Update title if this was the first message
      if (titleToSet) {
        try {
          const response = await fetch(
            `/api/chat/sessions/${sessionId}/title`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title: titleToSet }),
            },
          );

          if (!response.ok) {
            console.error("Failed to update session title");
          } else {
            router.refresh();
          }
        } catch (error) {
          console.error("Error updating session title:", error);
        }
      }
    });

    eventSource.addEventListener("error", () => {
      console.error("SSE connection error");
      eventSource.close();
      streamRef.current = null;
      setIsStreaming(false);
      setStatus("error");
      toast.error("Connection error. Please try again.");

      if (!assistantMessageId) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "model",
            content: "Sorry, an error occurred. Please try again.",
          },
        ]);
      }
    });
  };

  return (
    <div className={cn("flex h-full gap-0", className)}>
      <div className="flex flex-1 flex-col overflow-clip rounded-lg border">
        <div className="flex items-center gap-4 bg-card p-4">
          <Avatar>
            <AvatarImage src="/chat/chatbot.png" />
            <AvatarFallback>CB</AvatarFallback>
          </Avatar>
          <div>
            <P>Soli</P>
            <Muted className="flex items-center gap-1">
              <span className="inline-flex size-2 animate-pulse rounded-full bg-green-500" />{" "}
              {statusMessage}
            </Muted>
          </div>
        </div>
        <AIConversation className="overflow-y-auto">
          <AIConversationContent>
            {messages.map((message) => {
              return (
                <AIMessage from={message.role} key={message.id}>
                  <AIMessageContent>{message.content}</AIMessageContent>
                </AIMessage>
              );
            })}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <AIMessage from="model" key="thinking">
                <AIMessageContent>
                  <ThinkingDots />
                </AIMessageContent>
              </AIMessage>
            )}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
        <div className="px-2 pb-2">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
            />
            <Separator />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton>
                  <MicIcon className="size-4" />
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit disabled={!text || isStreaming} status={status} />
            </AIInputToolbar>
          </AIInput>
        </div>
      </div>
    </div>
  );
}
