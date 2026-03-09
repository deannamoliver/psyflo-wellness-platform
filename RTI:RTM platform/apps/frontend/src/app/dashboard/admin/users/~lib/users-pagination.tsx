"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
};

export function UsersPagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  function getPageNumbers(): { key: string; value: number | null }[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => ({
        key: String(i + 1),
        value: i + 1,
      }));
    }
    const pages: { key: string; value: number | null }[] = [
      { key: "1", value: 1 },
    ];
    if (currentPage > 3) pages.push({ key: "start-ellipsis", value: null });
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push({ key: String(i), value: i });
    }
    if (currentPage < totalPages - 2)
      pages.push({ key: "end-ellipsis", value: null });
    pages.push({ key: String(totalPages), value: totalPages });
    return pages;
  }

  return (
    <div className="flex items-center justify-between font-dm">
      <span className="text-gray-500 text-sm">
        Showing {start}-{end} of {totalItems.toLocaleString()} users
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex size-9 items-center justify-center rounded-md border border-gray-200 transition-colors",
            currentPage === 1
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>

        {getPageNumbers().map((item) =>
          item.value === null ? (
            <span key={item.key} className="px-1.5 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={item.key}
              type="button"
              onClick={() => onPageChange(item.value as number)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md font-medium text-sm transition-colors",
                currentPage === item.value
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50",
              )}
            >
              {item.value}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex size-9 items-center justify-center rounded-md border border-gray-200 transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
