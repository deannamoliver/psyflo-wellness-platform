import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LIB_DIR = path.resolve(__dirname, "~lib");

function readFile(filename: string): string {
  return readFileSync(path.join(LIB_DIR, filename), "utf-8");
}

describe("Support Conversations stat card (counselor dashboard)", () => {
  const counselorSource = readFile("stats-overview.tsx");
  const coachSource = readFile("coach-stats-overview.tsx");

  for (const [label, source] of [
    ["counselor view (stats-overview)", counselorSource],
    ["coach view (coach-stats-overview)", coachSource],
  ] as const) {
    describe(label, () => {
      it("should query chatSessions table for conversation count", () => {
        expect(source).toContain("chatSessions");
        expect(source).toMatch(/\.from\(chatSessions\)/);
      });

      it("should join with userSchools to filter by school", () => {
        expect(source).toMatch(
          /innerJoin\(userSchools,\s*eq\(chatSessions\.userId,\s*userSchools\.userId\)\)/,
        );
      });

      it("should NOT query moodCheckIns table", () => {
        expect(source).not.toContain("moodCheckIns");
      });

      it("should NOT query wellnessCoachHandoffs table", () => {
        expect(source).not.toContain("wellnessCoachHandoffs");
      });

      it("should display 'Total conversations' as the sublabel", () => {
        expect(source).toContain('sublabel="Total conversations"');
      });
    });
  }
});
