import { describe, expect, it } from "bun:test";
import { dateOrNull } from "./time-utils";

describe("dateOrNull", () => {
  it("returns null for null", () => {
    expect(dateOrNull(null)).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(dateOrNull(undefined)).toBe(null);
  });

  it("parses valid ISO date string", () => {
    const result = dateOrNull("2025-01-15T12:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(0);
    expect(result?.getDate()).toBe(15);
  });

  it("returns null for invalid date string", () => {
    expect(dateOrNull("not-a-date")).toBe(null);
  });
});
