import type {
  AttentionEventType,
  AttentionPolicy,
  AssignmentStatus,
  SessionStatus,
  TranscriptChunk,
  UserRole,
} from "./domain";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  orgId: string;
  role: UserRole;
  accessToken: string;
}

export interface AssignmentSummary {
  id: string;
  courseId: string;
  userId: string;
  status: AssignmentStatus;
  dueAt: string | null;
}

export interface StartSessionRequest {
  assignmentId: string;
  videoAssetId: string;
}

export interface SessionSummary {
  id: string;
  assignmentId: string;
  userId: string;
  videoAssetId: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  avgAttentionScore: number | null;
  interventionCount: number;
  finalScore: number | null;
}

export interface AttentionEventInput {
  eventType: AttentionEventType;
  occurredAt: string;
  value: number | null;
  metadata: Record<string, unknown>;
}

export interface QuestionPayload {
  question: string;
  questionType: "short_answer" | "mcq";
  choices: string[];
  correctAnswer: string;
  acceptableConcepts: string[];
  difficulty: "easy" | "medium" | "hard";
  replayStartSec: number | null;
  replayEndSec: number | null;
  hint: string | null;
}

export interface InterventionSummary {
  id: string;
  sessionId: string;
  triggerReason: string;
  attentionScore: number;
  status: "open" | "passed" | "failed" | "abandoned";
  question: QuestionPayload;
}

export interface InterventionAnswerInput {
  userAnswer: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  confidence: number;
  reason: string;
  nextAction: "resume" | "retry" | "replay_then_retry";
  feedback: string;
}

export interface SessionPlayerContract {
  session: SessionSummary;
  policy: AttentionPolicy;
  recentTranscript: TranscriptChunk[];
  activeIntervention: InterventionSummary | null;
}

export interface ScaffoldResponse {
  area: string;
  status: "scaffold_only";
  nextStep: string;
}

