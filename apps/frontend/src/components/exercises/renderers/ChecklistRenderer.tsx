"use client";

import { useState, useEffect } from "react";
import { Check, HelpCircle, ChevronUp } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { ChecklistConfig } from "@/lib/exercises/types";

// ─── Types ───────────────────────────────────────────────────────────

export interface ChecklistRendererProps {
  config: ChecklistConfig;
  initialValues?: {
    checked: string[];
    customFields?: Record<string, string>;
  };
  onChange?: (values: {
    checked: string[];
    unchecked: string[];
    customFields: Record<string, string>;
  }) => void;
  readOnly?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export function ChecklistRenderer({
  config,
  initialValues,
  onChange,
  readOnly = false,
}: ChecklistRendererProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(initialValues?.checked ?? [])
  );
  const [customFields, setCustomFields] = useState<Record<string, string>>(
    initialValues?.customFields ?? {}
  );
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  const totalItems = config.items.length;
  const checkedCount = checkedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const checked = Array.from(checkedItems);
      const unchecked = config.items
        .map((item) => item.id)
        .filter((id) => !checkedItems.has(id));
      onChange({ checked, unchecked, customFields });
    }
  }, [checkedItems, customFields, config.items, onChange]);

  const handleToggle = (itemId: string) => {
    if (readOnly) return;
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const _handleCustomFieldChange = (fieldId: string, value: string) => {
    if (readOnly) return;
    setCustomFields((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleHelp = (itemId: string) => {
    setExpandedHelp((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {checkedCount} of {totalItems} items checked
          </span>
          <span className="text-sm font-semibold text-gray-900">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progressPercent === 100 ? "bg-emerald-500" : "bg-blue-500"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className="mt-2 text-sm text-emerald-600 font-medium">
            ✓ All items completed!
          </p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {config.items.map((item) => {
          const isChecked = checkedItems.has(item.id);
          const hasHelp = !!item.helpText;
          const isHelpExpanded = expandedHelp === item.id;

          return (
            <div key={item.id} className="rounded-lg border bg-white overflow-hidden">
              <div
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors",
                  !readOnly && "cursor-pointer hover:bg-gray-50",
                  isChecked && "bg-emerald-50"
                )}
                onClick={() => handleToggle(item.id)}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors mt-0.5",
                    isChecked
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 bg-white"
                  )}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isChecked ? "text-emerald-700" : "text-gray-900"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Help Toggle */}
                {hasHelp && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHelp(item.id);
                    }}
                    className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    {isHelpExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <HelpCircle className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Help Text (Expanded) */}
              {hasHelp && isHelpExpanded && (
                <div className="border-t bg-blue-50 px-4 py-3">
                  <p className="text-sm text-blue-800">{item.helpText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Require All Warning */}
      {config.requireAll && checkedCount < totalItems && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> All items must be checked to complete this checklist.
          </p>
        </div>
      )}
    </div>
  );
}
