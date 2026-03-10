"use client";

import { Download, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type Props = {
  selectedCount: number;
  isReactivate: boolean;
  onExport: () => void;
  onDeactivate: () => void;
};

export function BulkActions({
  selectedCount,
  isReactivate,
  onExport,
  onDeactivate,
}: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <span className="font-medium text-gray-700 text-sm">
        {selectedCount} selected
      </span>
      <div className="h-5 w-px bg-gray-200" />
      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-gray-700 text-sm hover:bg-gray-100"
      >
        <Download className="size-4" />
        Export
      </button>
      <button
        type="button"
        onClick={onDeactivate}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-sm",
          isReactivate
            ? "text-green-700 hover:bg-green-50"
            : "text-amber-700 hover:bg-amber-50"
        )}
      >
        {isReactivate ? (
          <>
            <UserPlus className="size-4" />
            Reactivate
          </>
        ) : (
          <>
            <UserMinus className="size-4" />
            Deactivate
          </>
        )}
      </button>
    </div>
  );
}
