# OnlookAI

OnlookAI is the platform layer for engagement-aware training products. `Attune Compliance` is the first reference surface built on top of it: a compliance training experience that can interrupt video playback, recover comprehension, and preserve auditable evidence.

This repository currently contains the production-style scaffold only. The architecture, folder layout, service boundaries, contracts, and demo data shapes are in place, but product logic is intentionally left as placeholders so implementation can be driven step by step.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-ready structure
- Backend: FastAPI, SQLAlchemy, Alembic, Redis, WebSockets
- Data: PostgreSQL, local storage abstraction with an S3 migration path
- AI: OpenAI-compatible provider abstraction with prompt contracts and structured JSON interfaces
- Monorepo: pnpm workspaces + shared packages

## Workspace Layout

```text
apps/
  web/          Next.js learner + admin application shell
  api/          FastAPI API, services, agents, integrations, workers
packages/
  shared-types/ Cross-app TypeScript contracts
  ui/           Shared React UI primitives and page scaffolds
  prompts/      Prompt identifiers and structured output contracts
infra/
  docker/       Local container images
  terraform/    Infrastructure placeholders for future environments
docs/
  architecture.md
  api-spec.md
  prompts.md
data/
  seeds/        Demo org, users, course, and transcript shapes
```

## Quick Start

1. Copy `.env.example` values into local environment files as needed.
2. Start infrastructure with `docker compose up postgres redis`.
3. Install frontend workspace dependencies with `pnpm install`.
4. Create a Python environment inside `apps/api` and install backend dependencies from `pyproject.toml`.
5. Implement features incrementally against the scaffolded files in `apps/web` and `apps/api`.

## Current Scope

- Route structure for learner/admin/public surfaces
- Domain model skeleton for all requested tables
- API router skeleton matching the requested route groups
- Service/agent/integration boundaries
- Session state and attention contract placeholders
- Seed/demo data file shapes

## Not Implemented Yet

- Auth flows
- Upload pipelines
- Transcript chunking
- Session orchestration logic
- AI question generation and evaluation logic
- xAPI emission
- Reporting queries

See [architecture.md](/Users/rahul/Documents/Projects/OnlookAI/docs/architecture.md), [api-spec.md](/Users/rahul/Documents/Projects/OnlookAI/docs/api-spec.md), and [prompts.md](/Users/rahul/Documents/Projects/OnlookAI/docs/prompts.md) for the intended implementation boundaries.

