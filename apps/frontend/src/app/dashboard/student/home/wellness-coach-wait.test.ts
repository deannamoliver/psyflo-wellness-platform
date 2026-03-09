import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LIB_DIR = path.resolve(__dirname, "~lib");

function readFile(filename: string): string {
  return readFileSync(path.join(LIB_DIR, filename), "utf-8");
}

describe("Wellness coach waiting state (desktop + mobile)", () => {
  const desktopSource = readFile("main-chat-area.tsx");
  const mobileSource = readFile("mobile-chat.tsx");

  for (const [label, source] of [
    ["desktop (main-chat-area)", desktopSource],
    ["mobile (mobile-chat)", mobileSource],
  ] as const) {
    describe(label, () => {
      it("should display static 'Estimated time: 2 minutes' text", () => {
        expect(source).toContain("Estimated time: 2 minutes");
      });

      it("should NOT contain a countdown timer interval that updates every second", () => {
        // The old countdown logic used setInterval(..., 1000) inside a
        // useEffect that calculated remaining seconds from requestedAt.
        expect(source).not.toMatch(/setCountdownSeconds/);
      });

      it("should NOT contain countdownSeconds state", () => {
        expect(source).not.toMatch(/useState.*countdownSeconds/);
      });

      it("should NOT contain countdownTotalRef", () => {
        expect(source).not.toContain("countdownTotalRef");
      });

      it("should NOT contain requestedAtRef", () => {
        expect(source).not.toContain("requestedAtRef");
      });

      it("should NOT contain the old dynamic wait time format", () => {
        // Old format: "Wait Time: X min Y s"
        expect(source).not.toContain("Wait Time:");
      });

      it("should still have isWaitingForCoach state for disabling inputs", () => {
        expect(source).toContain("isWaitingForCoach");
      });

      it("should still poll the wellness coach status API", () => {
        expect(source).toContain("/api/wellness-coach/status");
      });
    });
  }
});
