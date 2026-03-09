import { describe, expect, it } from "vitest";
import { isValidSoliColor, isValidSoliShape } from "./validation";

describe("Soli customization validation", () => {
  describe("isValidSoliColor", () => {
    it("accepts all valid colors", () => {
      const validColors = [
        "blue",
        "teal",
        "purple",
        "pink",
        "orange",
        "green",
        "yellow",
        "royal",
      ];
      for (const color of validColors) {
        expect(isValidSoliColor(color)).toBe(true);
      }
    });

    it("rejects invalid colors", () => {
      expect(isValidSoliColor("red")).toBe(false);
      expect(isValidSoliColor("")).toBe(false);
      expect(isValidSoliColor("BLUE")).toBe(false);
      expect(isValidSoliColor("Blue")).toBe(false);
      expect(isValidSoliColor(" blue")).toBe(false);
      expect(isValidSoliColor("blue ")).toBe(false);
    });
  });

  describe("isValidSoliShape", () => {
    it("accepts all valid shapes", () => {
      const validShapes = ["round", "tall", "wide", "chunky"];
      for (const shape of validShapes) {
        expect(isValidSoliShape(shape)).toBe(true);
      }
    });

    it("rejects invalid shapes", () => {
      expect(isValidSoliShape("square")).toBe(false);
      expect(isValidSoliShape("")).toBe(false);
      expect(isValidSoliShape("ROUND")).toBe(false);
      expect(isValidSoliShape("Round")).toBe(false);
      expect(isValidSoliShape(" round")).toBe(false);
    });
  });

  describe("color-shape combinations", () => {
    it("validates all 32 valid combinations", () => {
      const colors = [
        "blue",
        "teal",
        "purple",
        "pink",
        "orange",
        "green",
        "yellow",
        "royal",
      ];
      const shapes = ["round", "tall", "wide", "chunky"];

      let validCount = 0;
      for (const color of colors) {
        for (const shape of shapes) {
          if (isValidSoliColor(color) && isValidSoliShape(shape)) {
            validCount++;
          }
        }
      }
      expect(validCount).toBe(32);
    });

    it("generates correct image paths for all valid combinations", () => {
      const colors = [
        "blue",
        "teal",
        "purple",
        "pink",
        "orange",
        "green",
        "yellow",
        "royal",
      ];
      const shapes = ["round", "tall", "wide", "chunky"];

      for (const color of colors) {
        for (const shape of shapes) {
          const path = `/images/soli_variations/soli_happy_${color}_${shape}.svg`;
          expect(path).toMatch(
            /^\/images\/soli_variations\/soli_happy_\w+_\w+\.svg$/,
          );
        }
      }
    });
  });

  describe("soli image path generation", () => {
    it("generates correct variation preview path", () => {
      expect(`/images/soli_variations/soli_happy_purple_chunky.svg`).toBe(
        "/images/soli_variations/soli_happy_purple_chunky.svg",
      );
    });

    it("generates correct state image paths", () => {
      const states = ["thriving", "happy", "okay", "lonely", "sleepy"];
      const color = "blue";
      const shape = "round";

      for (const state of states) {
        const path = `/images/soli_state/soli_${state}_${color}_${shape}.svg`;
        expect(path).toContain(state);
        expect(path).toContain(color);
        expect(path).toContain(shape);
      }
    });

    it("generates correct wellness check image path", () => {
      const path = `/images/start-your-day/soli_wellness_check_teal_wide.svg`;
      expect(path).toBe(
        "/images/start-your-day/soli_wellness_check_teal_wide.svg",
      );
    });
  });

  describe("default values", () => {
    it("uses blue as default color", () => {
      expect(isValidSoliColor("blue")).toBe(true);
    });

    it("uses round as default shape", () => {
      expect(isValidSoliShape("round")).toBe(true);
    });
  });
});
