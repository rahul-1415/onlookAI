# OnlookAI

OnlookAI is the infrastructure layer for engagement-aware training products. `Attune Compliance` is the first reference surface built on top of it: a compliance training experience that monitors learner attention in real time, interrupts video playback when engagement drops, recovers comprehension through AI-generated questions, and preserves auditable evidence.

## Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, dark theme (slate palette)
- **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic v2
- **Database**: SQLite (dev), PostgreSQL-ready, local storage abstraction with S3 migration path
- **AI/ML**:
  - OpenAI GPT-4o — question generation and answer evaluation (with offline fallbacks)
  - Whisper (local, via `faster-whisper`) — free video transcription, no API costs
  - MediaPipe BlazeFace (client-side) — real-time face detection for attention tracking
- **Auth**: JWT-based with Firebase-ready architecture
- **Monorepo**: pnpm workspaces + shared packages

## Workspace Layout

```text
apps/
  web/          Next.js learner + admin application
  api/          FastAPI backend — services, agents, integrations
packages/
  shared-types/ Cross-app TypeScript contracts
  ui/           Shared React UI primitives (MetricCard, AppShell, etc.)
  prompts/      Prompt identifiers and structured output contracts
infra/
  docker/       Local container images
  terraform/    Infrastructure placeholders
docs/
  architecture.md
  api-spec.md
  prompts.md
data/
  seeds/        Demo org, users, course, and transcript data
```

## Quick Start

### Backend

```bash
# System dependency (required by Whisper for audio extraction)
brew install ffmpeg  # or: apt install ffmpeg / choco install ffmpeg

cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Optional: configure in .env
# OPENAI_API_KEY=sk-...       (enables AI questions; works without it via fallbacks)
# WHISPER_MODEL_SIZE=base     (options: tiny, base, small, medium, large-v3)
# WHISPER_DEVICE=cpu

uvicorn app.main:app --reload
```

### Frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

### Test Login

```bash
curl -X POST http://localhost:8000/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"email": "learner@example.com", "password": "any"}'
```

Use the returned `access_token` as a Bearer token for API requests.

## Implemented Features

### Phase 1-2: Core Platform
- JWT authentication with role-based access (learner, compliance_admin, org_admin)
- Course and assignment management with seed data
- Video player with playback controls and session lifecycle
- Session creation, tracking, and completion

### Phase 3: AI Interventions & Attention Monitoring
- Real-time attention tracking via DOM events (tab visibility, window focus, idle detection)
- Weighted attention scoring algorithm (0-100 scale)
- Automatic intervention triggers when score drops below 40
- AI-generated comprehension questions (OpenAI GPT-4o with offline fallbacks)
- AI-powered answer evaluation with feedback
- Intervention modal with retry/resume/replay flow

### Phase 4: Whisper Transcription & Face Detection
- Local video transcription via `faster-whisper` (no API costs, ~140MB model auto-downloads)
- Transcript-grounded question generation from actual video content
- Client-side face detection via MediaPipe BlazeFace (1.5s intervals, 3-frame threshold)
- NO_FACE events with higher penalty (-25 vs -20 for tab switches)
- Graceful degradation when camera is unavailable

### Phase 5: Learner Experience UI
- Functional dashboard with real-time stats (assignments, attention score, interventions)
- Status-aware assignment cards (Start/Continue/Completed states)
- Live session timeline with color-coded attention and intervention events
- Session completion view with score circle, duration, and rating
- Navigation with active state highlighting

## Admin Endpoints

- `POST /api/admin/videos/upload` — Upload video files
- `POST /api/admin/videos/{id}/transcribe` — Trigger Whisper transcription
- `POST /api/admin/videos/upload-and-transcribe` — Upload + transcribe in one call
- `GET /api/admin/reports/overview` — Compliance reporting (scaffold)

## Architecture

See [docs/architecture.md](docs/architecture.md) for service boundaries and data flow, [docs/api-spec.md](docs/api-spec.md) for the full API contract, and [docs/prompts.md](docs/prompts.md) for AI prompt design.
