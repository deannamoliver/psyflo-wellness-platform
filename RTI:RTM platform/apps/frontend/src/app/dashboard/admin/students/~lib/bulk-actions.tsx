"use client";

import { Archive, ArchiveRestore, Ban, Download, Upload } from "lucide-react";

type Props = {
  selectedCount: number;
  isUnarchive: boolean;
  onExport: () => void;
  onBlock: () => void;
  onArchive: () => void;
  onImport: () => void;
};

export function BulkActions({
  selectedCount,
  isUnarchive,
  onExport,
  onBlock,
  onArchive,
  onImport,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">Bulk Actions</h3>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onImport}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 px-5 py-3 font-medium text-blue-600 text-sm transition-colors hover:bg-blue-50"
        >
          <Upload className="size-4" />
          Import Clients
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onExport}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Export Selected
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onBlock}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 font-medium text-red-600 text-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Ban className="size-4" />
          Block Selected
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onArchive}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUnarchive ? (
            <ArchiveRestore className="size-4" />
          ) : (
            <Archive className="size-4" />
          )}
          {isUnarchive ? "Unarchive Selected" : "Archive Selected"}
        </button>
      </div>
    </div>
  );
}
