"use client";

import { cn } from "@/lib/tailwind-utils";

const ITEMS_PER_PAGE = 8;

export function TablePagination({
  cur,
  total,
  count,
  onPage,
}: {
  cur: number;
  total: number;
  count: number;
  onPage: (p: number) => void;
}) {
  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => {
    if (total <= 5) return i + 1;
    if (cur <= 3) return i + 1;
    if (cur >= total - 2) return total - 4 + i;
    return cur - 2 + i;
  });
  const nav =
    "rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex items-center justify-between pt-1">
      <p className="text-gray-500 text-xs">
        Showing {(cur - 1) * ITEMS_PER_PAGE + 1}–
        {Math.min(cur * ITEMS_PER_PAGE, count)} of {count}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, cur - 1))}
          disabled={cur === 1}
          className={nav}
        >
          Previous
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md font-medium text-xs transition-colors",
              n === cur
                ? "bg-blue-600 text-white"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(Math.min(total, cur + 1))}
          disabled={cur === total}
          className={nav}
        >
          Next
        </button>
      </div>
    </div>
  );
}
