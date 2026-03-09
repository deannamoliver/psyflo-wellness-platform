import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const APP_DIR = path.resolve(__dirname);

function readFile(filename: string): string {
  return readFileSync(path.join(APP_DIR, filename), "utf-8");
}

describe("Font configuration (cross-browser consistency)", () => {
  const layoutSource = readFile("layout.tsx");
  const globalsSource = readFile("globals.css");

  describe("layout.tsx variable font declarations", () => {
    it("should declare urbanist with a weight range for variable font support", () => {
      // Variable fonts require an explicit weight range (e.g. "100 900") in the
      // localFont() config. Without it, Safari interprets the font-weight axis
      // differently from Chrome, rendering text bolder than intended.
      const urbanistBlock = layoutSource.match(
        /const\s+urbanist\s*=\s*localFont\(\{[\s\S]*?\}\);/,
      );
      expect(urbanistBlock).not.toBeNull();
      expect(urbanistBlock![0]).toContain("weight:");
      expect(urbanistBlock![0]).toMatch(/weight:\s*["']100 900["']/);
    });

    it("should declare dmSans with a weight range for variable font support", () => {
      const dmSansBlock = layoutSource.match(
        /const\s+dmSans\s*=\s*localFont\(\{[\s\S]*?\}\);/,
      );
      expect(dmSansBlock).not.toBeNull();
      expect(dmSansBlock![0]).toContain("weight:");
      expect(dmSansBlock![0]).toMatch(/weight:\s*["']100 900["']/);
    });
  });

  describe("body element font smoothing", () => {
    it("should apply the antialiased class to the body for consistent cross-browser rendering", () => {
      // The Tailwind `antialiased` class sets -webkit-font-smoothing: antialiased
      // and -moz-osx-font-smoothing: grayscale, which prevents Safari from using
      // subpixel antialiasing that makes text appear heavier.
      expect(layoutSource).toMatch(/className=.*antialiased/);
    });
  });

  describe("globals.css font variable definitions", () => {
    it("should define --font-sans using the urbanist CSS variable", () => {
      expect(globalsSource).toContain("--font-sans: var(--font-urbanist)");
    });

    it("should define --font-dm using the dm-sans CSS variable", () => {
      expect(globalsSource).toContain("--font-dm: var(--font-dm-sans)");
    });
  });
});
