"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  label: string;
};

export function ConversationsPagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
  label,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  return (
    <div className="flex items-center justify-between font-dm">
      <span className="text-gray-500 text-sm">
        Showing {totalItems} {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm transition-colors",
            currentPage === 1
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
