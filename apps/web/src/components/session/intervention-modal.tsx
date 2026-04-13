"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import type { InterventionDetail } from "@/hooks/use-attention-monitor";

interface InterventionModalProps {
  open: boolean;
  sessionId: string;
  intervention: InterventionDetail;
  onClose: (nextAction?: string) => void;
}

interface EvaluationResponse {
  is_correct: boolean;
  feedback: string;
  next_action: string;
  intervention_status: string;
}

export function InterventionModal({
  open,
  sessionId,
  intervention,
  onClose,
}: InterventionModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const questionData = intervention.question_json as {
    question: string;
    options: string[];
    type: string;
    correct_index?: number;
    hint?: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption.trim()) {
      setError("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch<EvaluationResponse>(
        apiRoutes.interventionAnswer(sessionId, intervention.id),
        {
          method: "POST",
          body: JSON.stringify({
            user_answer: selectedOption,
          }),
        }
      );

      setEvaluationResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit answer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (evaluationResult) {
      onClose(evaluationResult.next_action);
    }
  };

  // Show result overlay if evaluation complete
  if (evaluationResult) {
    const isCorrect = evaluationResult.is_correct;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div
          className={`rounded-xl p-8 max-w-md w-full border-2 ${
            isCorrect
              ? "bg-green-900/40 border-green-500 text-green-50"
              : "bg-red-900/40 border-red-500 text-red-50"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${
              isCorrect ? "text-green-300" : "text-red-300"
            }`}
          >
            {isCorrect ? "Correct! ✓" : "Not Quite Right ✗"}
          </h2>

          <p className="mb-6 text-sm leading-relaxed">
            {evaluationResult.feedback}
          </p>

          <div className="flex gap-3">
            {!isCorrect && (
              <button
                onClick={() => {
                  setEvaluationResult(null);
                  setSelectedOption("");
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
            )}

            <button
              onClick={handleContinue}
              className={`flex-1 px-4 py-2 font-medium rounded-md transition-colors ${
                isCorrect
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-slate-600 hover:bg-slate-700 text-white"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show question form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="rounded-xl bg-slate-900 border border-slate-700 p-8 max-w-2xl w-full text-white">
        <h2 className="text-2xl font-bold mb-2 text-amber-300">
          Comprehension Check
        </h2>

        <p className="text-sm text-slate-400 mb-6">
          Let's make sure you're paying attention
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{questionData.question}</h3>

            {questionData.hint && (
              <p className="text-xs text-amber-200/70 mb-3 italic">
                Hint: {questionData.hint}
              </p>
            )}
          </div>

          {/* MCQ Options */}
          {questionData.type === "mcq" && (
            <div className="space-y-3">
              {questionData.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-slate-600 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-500 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedOption("");
                setError(null);
                onClose();
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Skip
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              disabled={isSubmitting || !selectedOption.trim()}
            >
              {isSubmitting ? "Checking..." : "Submit Answer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
