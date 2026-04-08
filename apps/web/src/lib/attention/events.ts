import type { AttentionEventInput, AttentionEventType } from "@onlook/shared-types";

export const attentionSignals: AttentionEventType[] = [
  "tab_hidden",
  "tab_visible",
  "window_blur",
  "window_focus",
  "idle",
  "activity_resumed",
  "playback_paused",
  "playback_resumed",
  "warning",
  "no_face"
];

export function createAttentionEvent(
  eventType: AttentionEventType,
  metadata: Record<string, unknown> = {},
  value: number | null = null
): AttentionEventInput {
  return {
    eventType,
    occurredAt: new Date().toISOString(),
    value,
    metadata
  };
}

