import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const STUDENTS_LIB = path.resolve(__dirname, "~lib");
const SAFETY_QUERIES = path.resolve(
  __dirname,
  "../../../../lib/student-alerts/safety-queries.ts",
);

function readFile(filepath: string): string {
  return readFileSync(filepath, "utf-8");
}

describe("Safety alert source filters are consistent", () => {
  const studentsDataSource = readFile(path.join(STUDENTS_LIB, "data.ts"));
  const safetyQueriesSource = readFile(SAFETY_QUERIES);

  describe("students table (data.ts)", () => {
    it('should include "chat" as an alert source alongside "coach"', () => {
      // The query must use inArray with both "coach" and "chat" sources,
      // matching the safety tab query. Previously it only had eq(source, "coach").
      expect(studentsDataSource).toMatch(
        /inArray\(alerts\.source,\s*\["coach",\s*"chat"\]\)/,
      );
    });

    it('should NOT use eq(alerts.source, "coach") without "chat"', () => {
      // Ensure we haven't left a standalone coach-only filter
      expect(studentsDataSource).not.toMatch(/eq\(alerts\.source,\s*"coach"\)/);
    });

    it("should also include screener safety alerts", () => {
      expect(studentsDataSource).toMatch(
        /eq\(alerts\.source,\s*"screener"\).*eq\(alerts\.type,\s*"safety"\)/,
      );
    });
  });

  describe("safety tab (safety-queries.ts)", () => {
    it('should include both "coach" and "chat" alert sources', () => {
      expect(safetyQueriesSource).toMatch(
        /inArray\(alerts\.source,\s*\["coach",\s*"chat"\]\)/,
      );
    });

    it("should also include screener safety alerts", () => {
      expect(safetyQueriesSource).toMatch(
        /eq\(alerts\.source,\s*"screener"\).*eq\(alerts\.type,\s*"safety"\)/,
      );
    });
  });

  it("both queries should use the same alert source pattern", () => {
    // Extract the or(...) filter patterns from both files to verify consistency
    const sourcePattern = /inArray\(alerts\.source,\s*\["coach",\s*"chat"\]\)/;
    const screenerPattern =
      /and\(eq\(alerts\.source,\s*"screener"\),\s*eq\(alerts\.type,\s*"safety"\)\)/;

    expect(studentsDataSource).toMatch(sourcePattern);
    expect(safetyQueriesSource).toMatch(sourcePattern);
    expect(studentsDataSource).toMatch(screenerPattern);
    expect(safetyQueriesSource).toMatch(screenerPattern);
  });
});
