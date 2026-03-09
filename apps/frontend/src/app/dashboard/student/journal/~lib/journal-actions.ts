"use server";

import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Save a journal entry to the database.
 *
 * Once the `journal_entries` table is created (see NEW_TABLES_SCHEMA.ts),
 * uncomment the DB insert below. Until then, this is a no-op server action
 * that validates the user session — the client continues to use localStorage.
 */
export async function saveJournalEntry(_data: {
  text: string;
  promptText: string | null;
  promptCategory: string | null;
  sentimentLabel: string;
  sentimentScore: number;
  emotions: { name: string; intensity: number }[];
  wordCount: number;
}) {
  const db = await serverDrizzle();
  const userId = db.userId();

  // ── Once journal_entries table is created, uncomment: ──
  // import { journalEntries } from "@feelwell/database";
  // await db.admin.insert(journalEntries).values({
  //   studentId: userId,
  //   text: data.text,
  //   promptText: data.promptText,
  //   promptCategory: data.promptCategory,
  //   sentimentLabel: data.sentimentLabel,
  //   sentimentScore: data.sentimentScore,
  //   emotions: JSON.stringify(data.emotions),
  //   wordCount: data.wordCount,
  // });

  return { ok: true, userId };
}

/**
 * Get journal entry timestamps for a student (used by provider dashboard).
 * Returns only timestamps and sentiment — not the actual journal text,
 * keeping entries private to the student.
 */
export async function getStudentJournalTimestamps(_studentId: string) {
  const db = await serverDrizzle();
  db.userId(); // verify authenticated

  // ── Once journal_entries table is created, uncomment: ──
  // import { journalEntries } from "@feelwell/database";
  // const entries = await db.admin
  //   .select({
  //     id: journalEntries.id,
  //     createdAt: journalEntries.createdAt,
  //     sentimentLabel: journalEntries.sentimentLabel,
  //     wordCount: journalEntries.wordCount,
  //     promptCategory: journalEntries.promptCategory,
  //   })
  //   .from(journalEntries)
  //   .where(eq(journalEntries.studentId, studentId))
  //   .orderBy(desc(journalEntries.createdAt))
  //   .limit(20);
  // return entries;

  return [] as {
    id: string;
    createdAt: Date;
    sentimentLabel: string | null;
    wordCount: number | null;
    promptCategory: string | null;
  }[];
}
