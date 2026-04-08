import type { AnswerEvaluation, QuestionPayload } from "@onlook/shared-types";

export const questionGenerationSchemaShape: QuestionPayload = {
  question: "",
  questionType: "short_answer",
  choices: [],
  correctAnswer: "",
  acceptableConcepts: [],
  difficulty: "easy",
  replayStartSec: null,
  replayEndSec: null,
  hint: null
};

export const answerEvaluationSchemaShape: AnswerEvaluation = {
  isCorrect: false,
  confidence: 0,
  reason: "",
  nextAction: "retry",
  feedback: ""
};

