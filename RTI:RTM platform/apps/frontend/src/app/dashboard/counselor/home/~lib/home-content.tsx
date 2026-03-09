"use client";

import { useState } from "react";
import { type ContentTab, ContentTabs } from "./content-tabs";

type HomeContentProps = {
  mentalHealthContent: React.ReactNode;
  wellnessContent: React.ReactNode;
  skillsContent: React.ReactNode;
};

export function HomeContent({
  mentalHealthContent,
  wellnessContent,
  skillsContent,
}: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>("mental-health");

  return (
    <div className="flex flex-col gap-6">
      <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "mental-health" && mentalHealthContent}
      {activeTab === "wellness" && wellnessContent}
      {activeTab === "skills" && skillsContent}
    </div>
  );
}
