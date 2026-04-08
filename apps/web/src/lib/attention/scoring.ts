import type { AttentionEventInput, AttentionPolicy } from "@onlook/shared-types";

export function getDefaultAttentionPolicy(): AttentionPolicy {
  return {
    warningThreshold: 70,
    interruptThreshold: 50,
    hardPauseThreshold: 30,
    tabHiddenSeconds: 8,
    idleSeconds: 20,
    webcamEnabled: false
  };
}

export function calculateAttentionScore(
  _events: AttentionEventInput[],
  baseline = 100
): number {
  return baseline;
}

