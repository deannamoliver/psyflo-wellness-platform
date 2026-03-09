"use client";

import { UserX } from "lucide-react";

type Props = {
  selectedCount: number;
  onDeactivate: () => void;
};

export function UsersBulkActions({ selectedCount, onDeactivate }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 font-dm shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Bulk Actions</h3>
          <p className="mt-0.5 text-gray-500 text-sm">
            {selectedCount > 0
              ? `${selectedCount} user${selectedCount > 1 ? "s" : ""} selected`
              : "Select users from the table above to perform bulk operations"}
          </p>
        </div>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onDeactivate}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserX className="size-4" />
          Deactivate
        </button>
      </div>
    </div>
  );
}
