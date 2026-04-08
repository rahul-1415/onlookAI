export const ANSWER_EVALUATION_PROMPT_ID =
  "answer-evaluation/transcript-grounded/v1";

export const ANSWER_EVALUATION_SYSTEM_PLACEHOLDER = [
  "TODO: define system instructions for transcript-grounded answer evaluation.",
  "Requirements:",
  "- compare learner answer only against the supplied transcript chunk and answer key",
  "- return pass/fail, confidence, reason, feedback, next_action",
].join("\n");

