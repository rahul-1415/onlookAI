# API Specification

Base path: `/api`

## Auth

### `POST /api/auth/login`
Authenticate with email and password. Returns JWT access token.
- Request: `{ email: string, password: string }`
- Response: `{ access_token: string, role: string }`

### `POST /api/auth/test-login`
Development endpoint — bypasses password verification.
- Request: `{ email: string, password: string }`
- Response: `{ access_token: string, role: string }`

### `GET /api/auth/me`
Returns the authenticated user's profile.
- Headers: `Authorization: Bearer <token>`
- Response: `{ id, org_id, email, name, role }`

### `POST /api/auth/logout`
Placeholder for session/token invalidation.
- Response: scaffold acknowledgement

## Learner

All learner endpoints require `Authorization: Bearer <token>`.

### `GET /api/dashboard`
Aggregated stats for the authenticated learner.
- Response:
```json
{
  "total_assignments": 3,
  "completed_assignments": 1,
  "in_progress_assignments": 1,
  "avg_attention_score": 72.5,
  "total_interventions": 4,
  "passed_interventions": 3
}
```

### `GET /api/assignments`
List all assignments for the current user, with course details and last session info.
- Response:
```json
{
  "assignments": [{
    "id": "string",
    "course": { "id", "title", "description", "videos": [{ "id", "title", "description", "duration_sec", "storage_url" }] },
    "status": "assigned | in_progress | completed | failed",
    "due_at": "datetime | null",
    "assigned_at": "datetime | null",
    "completed_at": "datetime | null",
    "last_session_id": "string | null",
    "last_session_status": "string | null",
    "last_session_at": "string | null"
  }]
}
```

### `POST /api/sessions/start`
Create a new training session.
- Request: `{ assignment_id: string, video_asset_id: string }`
- Response: `SessionResponse { id, assignment_id, video_asset_id, status, started_at, ended_at }`

### `GET /api/sessions/{session_id}`
Fetch session details with video information.
- Response: `{ session: SessionResponse, storage_url: string, video_title: string }`

### `POST /api/sessions/{session_id}/heartbeat`
Session liveness ping (scaffold).

### `POST /api/sessions/{session_id}/attention-event`
Ingest an attention event. Triggers intervention if score drops below 40.
- Request:
```json
{
  "event_type": "tab_hidden | tab_visible | window_blur | window_focus | idle | activity_resumed | no_face | face_detected | ...",
  "occurred_at": "ISO 8601 timestamp",
  "value": "float | null",
  "metadata": {}
}
```
- Response:
```json
{
  "score": 65.0,
  "session_status": "playing",
  "intervention": null
}
```
- When intervention triggers:
```json
{
  "score": 35.0,
  "session_status": "interrupted",
  "intervention": {
    "id": "string",
    "question_json": { "question", "choices", "correct_answer", "hint", ... },
    "status": "open"
  }
}
```

### `POST /api/sessions/{session_id}/intervention/{intervention_id}/answer`
Submit an answer to an intervention question.
- Request: `{ user_answer: string }`
- Response:
```json
{
  "is_correct": true,
  "feedback": "Correct! The video discussed...",
  "next_action": "resume | retry | replay_then_retry",
  "intervention_status": "passed | failed"
}
```

### `GET /api/sessions/{session_id}/timeline`
Retrieve all attention events and interventions for a session, sorted by timestamp.
- Response:
```json
{
  "session_id": "string",
  "events": [{
    "type": "attention | intervention",
    "timestamp": "ISO 8601",
    "event_type": "tab_hidden | null",
    "score": "float | null",
    "intervention_status": "passed | null",
    "question_text": "string | null"
  }]
}
```

### `POST /api/sessions/{session_id}/complete`
Mark session as completed. Returns summary stats.
- Response:
```json
{
  "session": { "id", "assignment_id", "video_asset_id", "status": "completed", "started_at", "ended_at" },
  "final_score": 72.0,
  "total_events": 15,
  "interventions_triggered": 2,
  "interventions_passed": 1,
  "duration_seconds": 342.5
}
```

## Admin

### `POST /api/admin/videos/upload`
Upload a video file.
- Request: multipart form — `title: string`, `file: UploadFile`
- Response: `{ id, status: "processing", storage_url }`

### `POST /api/admin/videos/{video_id}/transcribe`
Trigger Whisper transcription for an uploaded video.
- Response: `{ video_id, chunks_created: int, chunks: [{ start_sec, end_sec, text }] }`

### `POST /api/admin/videos/upload-and-transcribe`
Upload + transcribe in one call.
- Request: multipart form — `title: string`, `file: UploadFile`
- Response: `{ id, status, storage_url, chunks_created, chunks }`

### `GET /api/admin/reports/overview`
Compliance reporting overview (scaffold).

## Seed Users

| Email | Role | Password |
|---|---|---|
| `learner@example.com` | learner | any |
| `compliance-admin@example.com` | compliance_admin | any |
| `org-admin@example.com` | org_admin | any |

Use `/api/auth/test-login` with any password for development.
