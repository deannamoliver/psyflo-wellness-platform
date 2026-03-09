"use client";

import { AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

export type AlertSeverity = "warning" | "critical";

export interface ClinicalAlertProps {
  level: AlertSeverity;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  title?: string;
}

export function ClinicalAlert({
  level,
  message,
  onDismiss,
  dismissible = true,
  title,
}: ClinicalAlertProps) {
  const styles = {
    warning: {
      container: "border-amber-300 bg-amber-50",
      icon: "text-amber-600",
      title: "text-amber-800",
      message: "text-amber-700",
      dismiss: "text-amber-500 hover:text-amber-700 hover:bg-amber-100",
    },
    critical: {
      container: "border-red-300 bg-red-50",
      icon: "text-red-600",
      title: "text-red-800",
      message: "text-red-700",
      dismiss: "text-red-500 hover:text-red-700 hover:bg-red-100",
    },
  };

  const style = styles[level];
  const Icon = level === "critical" ? XCircle : AlertTriangle;
  const defaultTitle = level === "critical" ? "Critical Alert" : "Warning";

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4",
        style.container
      )}
      role="alert"
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.icon)} />
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-sm", style.title)}>
          {title ?? defaultTitle}
        </h4>
        <p className={cn("mt-1 text-sm", style.message)}>{message}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "shrink-0 rounded-full p-1 transition-colors",
            style.dismiss
          )}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
