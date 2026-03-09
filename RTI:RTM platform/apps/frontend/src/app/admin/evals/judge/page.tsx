import { JudgeManager } from "./judge-manager";

export default function JudgePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Judge</h1>
        <p className="text-muted-foreground text-sm">
          Evaluate test cases and evals or the current prompt
        </p>
      </div>
      <JudgeManager />
    </div>
  );
}
