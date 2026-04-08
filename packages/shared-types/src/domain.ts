export type UserRole = "learner" | "compliance_admin" | "org_admin";

export type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "failed";

export type SessionStatus =
  | "idle"
  | "ready"
  | "playing"
  | "warning"
  | "interrupted"
  | "answering"
  | "resuming"
  | "quiz"
  | "completed"
  | "failed";

export type AttentionEventType =
  | "tab_hidden"
  | "tab_visible"
  | "window_blur"
  | "window_focus"
  | "idle"
  | "activity_resumed"
  | "playback_paused"
  | "playback_resumed"
  | "warning"
  | "no_face";

export type InterventionStatus = "open" | "passed" | "failed" | "abandoned";

export interface AttentionPolicy {
  warningThreshold: number;
  interruptThreshold: number;
  hardPauseThreshold: number;
  tabHiddenSeconds: number;
  idleSeconds: number;
  webcamEnabled: boolean;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  ssoEnabled: boolean;
}

export interface UserSummary {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface CourseSummary {
  id: string;
  orgId: string;
  title: string;
  description: string;
  published: boolean;
}

export interface TranscriptChunk {
  id: string;
  videoAssetId: string;
  startSec: number;
  endSec: number;
  text: string;
}

