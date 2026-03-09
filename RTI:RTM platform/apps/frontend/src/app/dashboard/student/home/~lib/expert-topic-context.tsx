"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

export type ExpertTopic = {
  id: number;
  title: string;
  icon: string;
  parentTitle: string;
} | null;

type ExpertTopicContextType = {
  expertTopic: ExpertTopic;
  setExpertTopic: (topic: ExpertTopic) => void;
  clearExpertTopic: () => void;
  /** True once a message has been sent with this expert topic */
  isTopicCommitted: boolean;
  /** Mark the current expert topic as committed (chat started) */
  commitTopic: () => void;
};

const ExpertTopicContext = createContext<ExpertTopicContextType | null>(null);

export function ExpertTopicProvider({ children }: { children: ReactNode }) {
  const [expertTopic, setExpertTopic] = useState<ExpertTopic>(null);
  const [isTopicCommitted, setIsTopicCommitted] = useState(false);

  const handleSetExpertTopic = (topic: ExpertTopic) => {
    setExpertTopic(topic);
    setIsTopicCommitted(false);
  };

  const handleClearExpertTopic = () => {
    setExpertTopic(null);
    setIsTopicCommitted(false);
  };

  return (
    <ExpertTopicContext.Provider
      value={{
        expertTopic,
        setExpertTopic: handleSetExpertTopic,
        clearExpertTopic: handleClearExpertTopic,
        isTopicCommitted,
        commitTopic: () => setIsTopicCommitted(true),
      }}
    >
      {children}
    </ExpertTopicContext.Provider>
  );
}

export function useExpertTopic() {
  const context = useContext(ExpertTopicContext);
  if (!context) {
    throw new Error("useExpertTopic must be used within ExpertTopicProvider");
  }
  return context;
}
