"use client";

import { useRouter } from "next/navigation";

interface SessionCompletionProps {
  finalScore: number;
  durationSeconds: number;
  interventionsTriggered: number;
  interventionsPassed: number;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function scoreBorder(score: number): string {
  if (score >= 70) return "border-emerald-700";
  if (score >= 40) return "border-amber-700";
  return "border-red-700";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function SessionCompletion({
  finalScore,
  durationSeconds,
  interventionsTriggered,
  interventionsPassed,
}: SessionCompletionProps) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Session Complete
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Training Finished
        </h2>
      </div>

      <div
        className={`mx-auto w-32 h-32 rounded-full border-4 ${scoreBorder(finalScore)} flex items-center justify-center`}
      >
        <div>
          <p className={`text-3xl font-bold ${scoreColor(finalScore)}`}>
            {Math.round(finalScore)}%
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Attention</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400">Duration</p>
          <p className="mt-1 text-lg font-medium text-white">
            {formatDuration(durationSeconds)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400">Interventions</p>
          <p className="mt-1 text-lg font-medium text-white">
            {interventionsTriggered > 0
              ? `${interventionsPassed}/${interventionsTriggered} passed`
              : "None triggered"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400">Score Rating</p>
          <p className={`mt-1 text-lg font-medium ${scoreColor(finalScore)}`}>
            {finalScore >= 70
              ? "Excellent"
              : finalScore >= 40
                ? "Needs Improvement"
                : "Low Engagement"}
          </p>
        </div>
      </div>

      <button
        onClick={() => router.push("/app/assignments")}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        Back to Assignments
      </button>
    </section>
  );
}
