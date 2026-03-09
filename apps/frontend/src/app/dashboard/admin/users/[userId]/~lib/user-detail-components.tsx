import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="size-4 text-gray-500" />
      </div>
      <div>
        <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 text-gray-900 text-sm">{value || "-"}</p>
      </div>
    </div>
  );
}

export function ActionButton({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  variant: "default" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium text-sm transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        variant === "danger"
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-gray-200 text-gray-700 hover:bg-gray-50",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
