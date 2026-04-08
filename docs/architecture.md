# OnlookAI Architecture

## Positioning

OnlookAI is the reusable platform layer for attention-aware training products. `Attune Compliance` is the initial product surface, but the same architecture is intended to support additional verticals such as employee onboarding, healthcare training, safety training, and online education.

The platform is organized around five bounded areas:

1. Identity and tenancy
2. Content and course management
3. Session intelligence and interventions
4. Evidence, reporting, and auditability
5. External integrations and standards

## Runtime Topology

```text
apps/web (Next.js)
  - public marketing/login routes
  - learner experience
  - admin experience
  - websocket session client

apps/api (FastAPI)
  - auth and RBAC
  - content and assignment APIs
  - session orchestrator
  - attention event intake
  - AI agent boundary
  - reporting and audit APIs
  - xAPI integration boundary

data plane
  - PostgreSQL
  - Redis
  - local object storage abstraction

shared packages
  - domain and transport contracts
  - UI primitives
  - prompt identifiers and structured output contracts
```

## Monorepo Responsibilities

### `apps/web`

- `app/`
  - route groups for public, learner, and admin experiences
  - layout boundaries aligned with App Router conventions
- `src/components/`
  - page-local composition pieces by domain area
- `src/lib/`
  - session, attention, auth, API, AI, and xAPI client-side contracts
- `src/stores/`
  - state containers for playback/session state

### `apps/api`

- `app/api/routes/`
  - transport layer only; no core domain logic
- `app/services/`
  - orchestration and domain service boundary
- `app/agents/`
  - provider-agnostic question and evaluation agents
- `app/integrations/`
  - storage, AI provider, LMS, and xAPI adapters
- `app/models/`
  - SQLAlchemy persistence models for all requested tables
- `app/schemas/`
  - Pydantic request/response contracts

### `packages/shared-types`

- Canonical TypeScript contracts used by web routes, websocket events, and admin dashboards.

### `packages/ui`

- Shared React scaffolds and UI primitives so multiple vertical products can reuse the same shell pattern.

### `packages/prompts`

- Prompt identifiers and placeholders for structured-output agents.

## Session Intelligence Boundary

The session orchestrator is the center of the product. It will eventually:

- track the current session state
- compute rolling attention scores
- trigger warning and interruption thresholds
- ask contextual comprehension questions
- evaluate learner answers
- resume or retry
- persist all evidence for audit and reporting

This repo currently includes the files and contracts for that flow, but not the logic itself.

## Data Model Coverage

The backend scaffold includes models for:

- users
- organizations
- video_assets
- transcript_chunks
- courses
- course_videos
- assignments
- sessions
- attention_events
- interventions
- intervention_answers
- final_quiz_results
- audit_logs
- xapi_events

## Deployment Posture

Local development uses Docker Compose for:

- PostgreSQL
- Redis
- API container
- web container

Future production infrastructure is intentionally deferred until feature flows stabilize.

