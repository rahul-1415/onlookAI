# Prompt Contracts

The repository contains prompt placeholders and IDs only. Prompt text and evaluation policy should be finalized after the session orchestration flow is implemented.

## Question Generation Agent

- package: `@onlook/prompts`
- id: `question-generation/transcript-grounded/v1`
- purpose: create one grounded comprehension check from a recent transcript chunk

### Required output shape

```json
{
  "question": "string",
  "question_type": "short_answer|mcq",
  "choices": ["string"],
  "correct_answer": "string",
  "acceptable_concepts": ["string"],
  "difficulty": "easy|medium|hard",
  "replay_start_sec": 0,
  "replay_end_sec": 0,
  "hint": "string"
}
```

## Answer Evaluation Agent

- package: `@onlook/prompts`
- id: `answer-evaluation/transcript-grounded/v1`
- purpose: determine whether a learner has recovered comprehension based only on the transcript chunk, answer key, and learner response

### Required output shape

```json
{
  "is_correct": true,
  "confidence": 0.91,
  "reason": "string",
  "next_action": "resume|retry|replay_then_retry",
  "feedback": "string"
}
```

## Guardrails

- never use facts outside the transcript chunk and answer key
- prefer short questions over open-ended essay prompts
- return structured JSON only
- preserve deterministic schemas for backend validation

