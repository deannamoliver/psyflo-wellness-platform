import "server-only";

import type { WellnessRealtimeEvent } from "./wellness-events";

function toRoomPublishUrl(handoffId: string): string | null {
  const baseUrl =
    process.env["PARTYKIT_URL"] ?? process.env["NEXT_PUBLIC_PARTYKIT_URL"];
  if (!baseUrl) return null;

  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.includes("/parties/")) {
    return `${trimmed}/${handoffId}`;
  }
  return `${trimmed}/parties/wellness/${handoffId}`;
}

export async function publishHandoffEvent(
  handoffId: string,
  event: WellnessRealtimeEvent,
): Promise<void> {
  const url = toRoomPublishUrl(handoffId);
  const publishSecret = process.env["PARTYKIT_PUBLISH_SECRET"];
  if (!url || !publishSecret) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-partykit-secret": publishSecret,
      },
      body: JSON.stringify(event),
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(
        `Failed to publish handoff event (${response.status}): ${body}`,
      );
    }
  } catch (error) {
    console.error("Failed to publish handoff event:", error);
  }
}
