const VALID_COLORS = [
  "blue",
  "teal",
  "purple",
  "pink",
  "orange",
  "green",
  "yellow",
  "royal",
] as const;

const VALID_SHAPES = ["round", "tall", "wide", "chunky"] as const;

export type SoliColor = (typeof VALID_COLORS)[number];
export type SoliShape = (typeof VALID_SHAPES)[number];

export function isValidSoliColor(color: string): color is SoliColor {
  return (VALID_COLORS as readonly string[]).includes(color);
}

export function isValidSoliShape(shape: string): shape is SoliShape {
  return (VALID_SHAPES as readonly string[]).includes(shape);
}
