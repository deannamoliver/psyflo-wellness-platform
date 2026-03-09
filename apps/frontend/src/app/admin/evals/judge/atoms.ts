import type { AdminPrompt, AdminTestCase } from "@feelwell/database";
import { atom } from "jotai";

export interface JudgeResult {
  testCase: AdminTestCase;
  scores: Record<string, { score: number; reasoning: string }>;
  success: boolean;
  error?: string;
  generatedResponse?: string | null;
  activePrompt?: AdminPrompt | null;
  isTransfer?: boolean;
}

export interface EvaluationTab {
  id: string;
  name: string;
  mode: "sanity-check" | "test-prompt";
  results: JudgeResult[];
  promptName?: string;
  createdAt: Date;
}

export const judgeResultsAtom = atom<{
  "sanity-check": JudgeResult[];
  "test-prompt": JudgeResult[];
}>({
  "sanity-check": [],
  "test-prompt": [],
});

export const evaluationTabsAtom = atom<EvaluationTab[]>([]);

export const activeTabIdAtom = atom<string | null>(null);

export const selectedTestCaseIdsAtom = atom<string[]>([]);

export const selectedEvalIdsAtom = atom<string[]>([]);
