import type { SessionStatus } from "@onlook/shared-types";

export const sessionTransitionMap: Record<SessionStatus, SessionStatus[]> = {
  idle: ["ready"],
  ready: ["playing", "failed"],
  playing: ["warning", "quiz", "failed"],
  warning: ["playing", "interrupted", "failed"],
  interrupted: ["answering", "failed"],
  answering: ["resuming", "interrupted", "failed"],
  resuming: ["playing", "quiz", "failed"],
  quiz: ["completed", "failed"],
  completed: [],
  failed: []
};

export function canTransition(
  current: SessionStatus,
  next: SessionStatus
): boolean {
  return sessionTransitionMap[current].includes(next);
}

