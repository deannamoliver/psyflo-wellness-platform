"use client";

import { cn } from "@/lib/tailwind-utils";

export type ContentTab = "mental-health" | "wellness" | "skills";

type ContentTabsProps = {
  activeTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
};

const tabs: { id: ContentTab; label: string }[] = [
  { id: "mental-health", label: "Mental Health" },
  { id: "wellness", label: "Wellness" },
  { id: "skills", label: "Skills" },
];

export function ContentTabs({ activeTab, onTabChange }: ContentTabsProps) {
  return (
    <div className="inline-flex w-max gap-2 rounded-[8px] border border-gray-200 bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-[8px] px-4 py-2 font-dm font-medium text-sm transition-colors",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
