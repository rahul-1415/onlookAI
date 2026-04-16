# Prompt Contracts

AI prompts are implemented in `apps/api/app/agents/prompts.py` and consumed by the question generation and answer evaluation agents. Both agents use OpenAI GPT-4o via `OpenAICompatibleProvider` with automatic fallback to deterministic logic when the API key is not configured.

## Question Generation Agent

- **File**: `apps/api/app/agents/question_generation.py`
- **Prompt builder**: `build_question_prompt()` in `apps/api/app/agents/prompts.py`
- **Provider**: OpenAI GPT-4o via structured output
- **Fallback**: Generic MCQ about the video topic (no API key required)

### Prompt Template

```
Based on the following video transcript, generate a multiple choice question
that tests comprehension.

Video Title: {video_title}
Video Position: {video_position_sec} seconds

Transcript excerpt:
{transcript_text}

Generate a JSON response with the following structure (strictly valid JSON):
{
    "question": "A clear, specific question about the transcript content",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "hint": "A brief hint if the learner needs help"
}

The correct_index should be 0-3 indicating which option is correct (0-indexed).
Make the question challenging but fair, testing key concepts from the transcript.
```

### Transcript Context

The agent fetches up to 3 `TranscriptChunk` rows within a +/-120 second window of the current video position. If no transcript is available (video not transcribed), it falls back to a generic context string.

### Output Schema

```json
{
  "question": "string",
  "type": "mcq",
  "options": ["string", "string", "string", "string"],
  "correct_index": 0,
  "hint": "string"
}
```

### Fallback Output (No API Key)

```json
{
  "question": "What is the main topic discussed in this section of '{video_title}'?",
  "type": "mcq",
  "options": [
    "The primary concept introduced",
    "A supporting detail",
    "A conclusion point",
    "An unrelated topic"
  ],
  "correct_index": 0,
  "hint": "Listen carefully to the introduction of new topics."
}
```

## Answer Evaluation Agent

- **File**: `apps/api/app/agents/answer_evaluation.py`
- **Prompt builder**: `build_evaluation_prompt()` in `apps/api/app/agents/prompts.py`
- **Provider**: OpenAI GPT-4o via structured output
- **Fallback**: Case-insensitive string match against correct option

### Prompt Template

```
Evaluate whether the learner's answer is correct.

Question: {question}

Available options:
{options as JSON array}

Correct answer (index {correct_index}): {correct_answer}

Learner's answer: {user_answer}

Generate a JSON response with the following structure (strictly valid JSON):
{
    "is_correct": true,
    "feedback": "Specific feedback about why the answer is correct or incorrect",
    "next_action": "resume"
}

next_action should be one of: "resume" (correct), "retry" (incorrect, try again),
"replay_then_retry" (incorrect, replay video section then try)

Provide clear, educational feedback that helps the learner understand the concept.
```

### Output Schema

```json
{
  "is_correct": true,
  "feedback": "string",
  "next_action": "resume | retry | replay_then_retry"
}
```

### Fallback Output (No API Key)

Correct answer:
```json
{
  "is_correct": true,
  "feedback": "Correct! The answer is '{correct_answer}'.",
  "next_action": "resume"
}
```

Incorrect answer:
```json
{
  "is_correct": false,
  "feedback": "Not quite. The correct answer is '{correct_answer}'. Please try again or watch the video section again.",
  "next_action": "retry"
}
```

## Guardrails

- Questions are grounded in transcript content when available
- Prefer MCQ over open-ended prompts for reliable evaluation
- All AI responses must be strictly valid JSON
- Deterministic fallback ensures the system works without an OpenAI API key
- Transcript window is limited to +/-120 seconds and 3 chunks to keep prompts focused
