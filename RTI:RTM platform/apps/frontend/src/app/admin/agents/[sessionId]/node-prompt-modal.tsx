"use client";

import { FileCodeIcon } from "lucide-react";
import { Badge } from "@/lib/core-ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { ScrollArea } from "@/lib/core-ui/scroll-area";
import { getNodePromptInfo } from "@/lib/langgraph/node-prompt-map";

interface NodePromptModalProps {
  nodeName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal that displays the LLM prompt(s) used by a specific LangGraph node
 */
export function NodePromptModal({
  nodeName,
  open,
  onOpenChange,
}: NodePromptModalProps) {
  if (!nodeName) {
    return null;
  }

  const nodeInfo = getNodePromptInfo(nodeName);

  if (!nodeInfo || !nodeInfo.isLLMNode) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileCodeIcon className="h-6 w-6 text-primary" />
            <DialogTitle className="font-mono text-xl">{nodeName}</DialogTitle>
          </div>
          {nodeInfo.description && (
            <p className="pt-2 text-left text-base text-muted-foreground">
              {nodeInfo.description}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {nodeInfo.prompts?.map((prompt, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Prompts array items have no unique identifier
              <div key={idx} className="space-y-3">
                {nodeInfo.prompts && nodeInfo.prompts.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      Prompt {idx + 1} of {nodeInfo.prompts.length}
                    </Badge>
                    <Badge
                      variant={
                        prompt.type === "static" ? "default" : "secondary"
                      }
                      className="text-sm"
                    >
                      {prompt.type}
                    </Badge>
                  </div>
                )}

                {prompt.type === "static" ? (
                  <div className="rounded-md border bg-muted/30 p-5">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {prompt.content}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prompt.params && prompt.params.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium text-base">Parameters:</p>
                        <div className="flex flex-wrap gap-2">
                          {prompt.params.map((param) => (
                            <Badge
                              key={param}
                              variant="outline"
                              className="font-mono text-sm"
                            >
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="rounded-md border bg-muted/30 p-5">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {prompt.template}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
