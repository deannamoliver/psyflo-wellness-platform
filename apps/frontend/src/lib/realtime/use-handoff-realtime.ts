"use client";

import { useEffect, useRef } from "react";
import type { WellnessRealtimeEvent } from "./wellness-events";

type Options = {
  handoffId: string | null | undefined;
  enabled?: boolean;
  onEvent: (event: WellnessRealtimeEvent) => void;
  onOpen?: () => void;
};

function toSocketUrl(
  baseUrl: string,
  handoffId: string,
  token: string,
): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  const roomUrl = trimmed.includes("/parties/")
    ? `${trimmed}/${handoffId}`
    : `${trimmed}/parties/wellness/${handoffId}`;
  const wsUrl = roomUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${wsUrl}?token=${encodeURIComponent(token)}`;
}

export function useHandoffRealtime({
  handoffId,
  enabled = true,
  onEvent,
  onOpen,
}: Options) {
  const onEventRef = useRef(onEvent);
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    if (!enabled || !handoffId) return;

    const baseUrl = process.env["NEXT_PUBLIC_PARTYKIT_URL"];
    if (!baseUrl) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stableTimer: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;
    let attempt = 0;

    const scheduleReconnect = () => {
      if (isDisposed) return;
      const delay = Math.min(1000 * 2 ** Math.min(attempt, 5), 30_000);
      reconnectTimer = setTimeout(connect, delay);
      attempt += 1;
    };

    const connect = async () => {
      if (isDisposed) return;
      try {
        const tokenRes = await fetch(
          `/api/realtime/wellness/token?handoffId=${handoffId}`,
          { cache: "no-store" },
        );
        if (!tokenRes.ok) {
          scheduleReconnect();
          return;
        }

        const { token } = (await tokenRes.json()) as { token?: string };
        if (!token) {
          scheduleReconnect();
          return;
        }

        if (isDisposed) return;
        socket = new WebSocket(toSocketUrl(baseUrl, handoffId, token));
        socket.onopen = () => {
          // Only reset backoff after the connection stays open for 5s
          stableTimer = setTimeout(() => {
            attempt = 0;
          }, 5_000);
          onOpenRef.current?.();
        };
        socket.onmessage = (message) => {
          try {
            const event = JSON.parse(message.data) as WellnessRealtimeEvent;
            onEventRef.current(event);
          } catch {
            // Ignore malformed events
          }
        };
        socket.onclose = () => {
          if (stableTimer) clearTimeout(stableTimer);
          if (!isDisposed) {
            scheduleReconnect();
          }
        };
        socket.onerror = () => {
          socket?.close();
        };
      } catch {
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (stableTimer) clearTimeout(stableTimer);
      socket?.close();
    };
  }, [enabled, handoffId]);
}
