"use client";

import { MessageCircle, Notebook, Plus } from "lucide-react";
import { useState } from "react";
import { AddNoteModal } from "./add-note-modal";
import type { ReferralNote } from "./referral-detail-data";

type Props = {
  notes: ReferralNote[];
  referralId: string;
};

function NoteCard({ note }: { note: ReferralNote }) {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700 text-xs">
          {note.authorInitials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900 text-sm">
                {note.authorName}
              </span>
              <span className="ml-2 text-gray-500 text-xs">
                {note.authorRole}
              </span>
            </div>
            <span className="text-gray-400 text-xs">{note.createdAt}</span>
          </div>
          <p className="mt-2 text-gray-600 text-sm leading-relaxed">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function InternalNotesSection({ notes, referralId }: Props) {
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Notebook className="size-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Internal Notes
          </h2>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800"
          onClick={() => setAddNoteOpen(true)}
        >
          <Plus className="size-3.5" />
          Add Note
        </button>
      </div>
      <AddNoteModal
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        referralId={referralId}
      />
      <div className="mt-4 space-y-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      {notes.length <= 1 && (
        <div className="mt-6 flex flex-col items-center py-4 text-gray-400">
          <MessageCircle className="size-10 text-gray-300" />
          <p className="mt-2 text-sm">No additional notes yet</p>
        </div>
      )}
    </div>
  );
}
