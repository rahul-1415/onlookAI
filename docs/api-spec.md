# API Spec Skeleton

This document defines the initial API surface only. Handlers are scaffolded in the repository but intentionally return placeholder responses until feature implementation begins.

## Base Paths

- REST: `/api`
- WebSocket: `/api/ws`

## Auth

- `POST /api/auth/login`
  - request: `LoginRequest`
  - response: `AuthSession`
- `GET /api/auth/me`
  - response: authenticated user summary
- `POST /api/auth/logout`
  - response: scaffold acknowledgement

## Admin

- `POST /api/admin/videos/upload`
- `POST /api/admin/videos/{video_id}/transcript`
- `POST /api/admin/videos/{video_id}/publish`
- `POST /api/admin/courses`
- `POST /api/admin/courses/{course_id}/assign`
- `GET /api/admin/reports/overview`
- `GET /api/admin/reports/session/{session_id}`
- `GET /api/admin/reports/export`

## Learner

- `GET /api/assignments`
- `POST /api/sessions/start`
- `POST /api/sessions/{session_id}/heartbeat`
- `POST /api/sessions/{session_id}/attention-event`
- `POST /api/sessions/{session_id}/intervention/{intervention_id}/answer`
- `POST /api/sessions/{session_id}/complete`

## WebSocket Event Names

### Client to Server

- `session.join`
- `video.progress`
- `attention.event`
- `intervention.answer`

### Server to Client

- `session.started`
- `attention.warning`
- `video.pause`
- `intervention.show`
- `intervention.result`
- `video.resume`
- `session.complete`

## Notes

- Transport contracts live in `packages/shared-types`.
- Backend request/response models live in `apps/api/app/schemas`.
- Session orchestration logic is deferred to implementation steps.

