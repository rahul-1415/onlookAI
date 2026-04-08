export const QUESTION_GENERATION_PROMPT_ID =
  "question-generation/transcript-grounded/v1";

export const QUESTION_GENERATION_SYSTEM_PLACEHOLDER = [
  "TODO: define system instructions for transcript-grounded question generation.",
  "Requirements:",
  "- only use the supplied transcript chunk",
  "- output strict JSON",
  "- include fallback simpler question and replay bounds",
].join("\n");

