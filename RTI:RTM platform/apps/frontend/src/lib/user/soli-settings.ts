"use client";

/**
 * Sync soli settings from database to localStorage
 * This should be called when the user logs in or when components mount
 * @returns The settings object if successful, null if failed
 */
export async function syncSoliSettingsToLocalStorage(): Promise<{
  soliColor: string;
  soliShape: string;
} | null> {
  try {
    const response = await fetch("/api/user/soli-settings");
    if (response.ok) {
      const settings = await response.json();
      if (settings.soliColor && settings.soliShape) {
        localStorage.setItem("soliColor", settings.soliColor);
        localStorage.setItem("soliShape", settings.soliShape);
        return settings;
      }
    }
  } catch (error) {
    console.error("Failed to sync soli settings from database:", error);
  }
  return null;
}

/**
 * Get soli color from localStorage (with fallback)
 */
export function getSoliColor(): string {
  if (typeof window === "undefined") return "blue";
  return localStorage.getItem("soliColor") || "blue";
}

/**
 * Get soli shape from localStorage (with fallback)
 */
export function getSoliShape(): string {
  if (typeof window === "undefined") return "round";
  return localStorage.getItem("soliShape") || "round";
}

export type SoliStateType = "thriving" | "happy" | "okay" | "lonely" | "sleepy";

/**
 * Get soli image path based on color, shape, and state
 * State images are in /images/soli_state/, variations in /images/soli_variations/
 */
export function getSoliImage(
  color?: string,
  shape?: string,
  state: SoliStateType = "happy",
): string {
  const soliColor = color || getSoliColor();
  const soliShape = shape || getSoliShape();
  return `/images/soli_state/soli_${state}_${soliColor}_${soliShape}.svg`;
}

/**
 * Get wellness check soli image path based on color and shape
 */
export function getWellnessCheckSoliImage(
  color?: string,
  shape?: string,
): string {
  const soliColor = color || getSoliColor();
  const soliShape = shape || getSoliShape();
  return `/images/start-your-day/soli_wellness_check_${soliColor}_${soliShape}.svg`;
}
