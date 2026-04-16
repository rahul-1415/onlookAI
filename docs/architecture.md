# OnlookAI Architecture

## Positioning

OnlookAI is the reusable infrastructure layer for attention-aware training products. `Attune Compliance` is the initial product surface, but the same architecture supports additional verticals such as employee onboarding, healthcare training, safety training, and online education.

The platform is organized around five bounded areas:

1. Identity and tenancy
2. Content and course management
3. Session intelligence and interventions
4. Evidence, reporting, and auditability
5. External integrations and standards

## Runtime Topology

```text
apps/web (Next.js 14, App Router)
  - learner dashboard, assignments, session player
  - admin video upload, transcription, reporting
  - client-side face detection (MediaPipe BlazeFace)
  - attention event collection via REST

apps/api (FastAPI)
  - JWT auth with role-based access control
  - content and assignment management
  - session orchestrator with attention scoring
  - AI agents: question generation + answer evaluation (OpenAI)
  - video transcription (faster-whisper, local)
  - admin video upload and management
  - reporting and audit APIs

data plane
  - SQLite (development) / PostgreSQL (production-ready)
  - local file storage with S3 migration path

shared packages
  - domain and transport contracts
  - UI primitives (MetricCard, AppShell)
  - prompt identifiers and structured output contracts
```

## Monorepo Responsibilities

### `apps/web`

- `app/`
  - route groups: `(learner)` for dashboard/assignments/sessions, `(admin)` for video management/reporting, `(auth)` for login
  - layout boundaries with role-specific navigation
- `src/components/`
  - `learner/` — dashboard content, assignment list
  - `session/` — video player, intervention modal, timeline, completion view
  - `layout/` — learner and admin navigation with active states
- `src/hooks/`
  - `use-attention-monitor.ts` — DOM event tracking (visibility, focus, idle) + face detection bridge
  - `use-face-detection.ts` — MediaPipe BlazeFace integration with camera management
- `src/lib/`
  - API client, route constants, auth utilities

### `apps/api`

- `app/api/routes/`
  - `auth.py` — login, test-login, logout, current user
  - `learner.py` — dashboard, assignments, sessions, attention events, interventions, timeline, completion
  - `admin.py` — video upload, transcription, reporting
- `app/services/`
  - `session_orchestrator.py` — central service coordinating attention intake, scoring, intervention triggers
  - `attention_service.py` — weighted rolling attention score calculation
  - `transcription_service.py` — Whisper-based video transcription with singleton model
- `app/agents/`
  - `question_generation.py` — OpenAI-powered transcript-grounded question generation with fallbacks
  - `answer_evaluation.py` — AI answer evaluation with structured JSON output
- `app/integrations/`
  - `storage/local.py` — local file storage adapter
  - `ai/openai.py` — OpenAI provider with structured output
- `app/models/`
  - SQLAlchemy models for all domain entities (see Data Model section)
- `app/schemas/`
  - Pydantic v2 request/response contracts

### `packages/ui`

- Shared React primitives: `MetricCard`, `AppShell`, `PagePlaceholder`

### `packages/shared-types`

- Cross-app TypeScript contracts for API responses

### `packages/prompts`

- Prompt identifiers and structured output contracts for AI agents

## Session Intelligence Flow

The session orchestrator is the center of the product:

```
Video playback starts
  → Attention monitor begins (DOM events + face detection)
  → Events POST to /sessions/{id}/attention-event
  → SessionOrchestratorService.ingest_attention_event()
    → Creates AttentionEvent record
    → AttentionMonitoringService.calculate_score() (rolling window, last 10 events)
    → If score < 40: triggers intervention
      → QuestionGenerationAgent generates transcript-grounded MCQ
      → Creates Intervention record, pauses video
      → Learner answers via InterventionModal
      → AnswerEvaluationAgent evaluates response
      → Result: resume (correct), retry (incorrect), or replay_then_retry
  → Video ends → POST /sessions/{id}/complete
    → Returns final score, duration, intervention stats
```

### Attention Scoring Algorithm

Weighted rolling score over the last 10 events, starting at 100:

| Event | Weight |
|---|---|
| `NO_FACE` | -25 (physical absence) |
| `TAB_HIDDEN`, `WINDOW_BLUR`, `IDLE` | -20 each |
| `TAB_VISIBLE`, `WINDOW_FOCUS`, `ACTIVITY_RESUMED`, `FACE_DETECTED` | +10 each |

Score clamped to [0, 100]. Intervention triggers at < 40.

### Face Detection (Client-Side)

- MediaPipe BlazeFace via `@mediapipe/tasks-vision`
- Hidden camera element at 320x240 resolution
- Detection every 1.5 seconds (not every frame)
- 3 consecutive "no face" frames (~4.5s) required before firing NO_FACE event
- Graceful degradation: system works without camera permission

### Video Transcription (Local)

- `faster-whisper` with CTranslate2 backend (4x faster than OpenAI Whisper on CPU)
- Model auto-downloads on first use (~140MB for `base` model)
- Segments map directly to `TranscriptChunk(start_sec, end_sec, text)`
- Enables transcript-grounded question generation (vs generic fallback questions)

## Data Model

| Table | Purpose |
|---|---|
| `users` | Learners, compliance admins, org admins |
| `organizations` | Multi-tenant org boundary |
| `video_assets` | Uploaded videos with storage URL, duration, status |
| `transcript_chunks` | Whisper-generated timestamped text segments |
| `courses` | Course metadata and policy references |
| `course_videos` | Many-to-many course-video mapping with sort order |
| `assignments` | User-course assignments with status and due dates |
| `sessions` | Training sessions with lifecycle state and final score |
| `attention_events` | Timestamped attention signals per session |
| `interventions` | Triggered comprehension checks with question JSON |
| `intervention_answers` | Learner responses to interventions |
| `final_quiz_results` | End-of-course quiz outcomes |
| `audit_logs` | System audit trail |
| `xapi_events` | xAPI statement staging |

## Deployment Target

- **Frontend**: Netlify (static + edge functions)
- **Backend**: Fly.io (containerized FastAPI)
- **Database**: Fly.io Postgres or managed PostgreSQL
- **Storage**: Local filesystem (dev), S3-compatible (production)

Local development uses `uvicorn` + `pnpm dev` without containers.
