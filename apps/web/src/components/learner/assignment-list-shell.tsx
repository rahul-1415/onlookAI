"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

interface VideoDetail {
  id: string;
  title: string;
  description: string;
  duration_sec: number;
  storage_url: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  videos: VideoDetail[];
}

interface Assignment {
  id: string;
  course: CourseDetail;
  status: string;
  due_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  last_session_id: string | null;
  last_session_status: string | null;
  last_session_at: string | null;
}

interface AssignmentsResponse {
  assignments: Assignment[];
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  assigned: { label: "Assigned", bg: "bg-blue-900/30", text: "text-blue-300" },
  in_progress: { label: "In Progress", bg: "bg-amber-900/30", text: "text-amber-300" },
  completed: { label: "Completed", bg: "bg-emerald-900/30", text: "text-emerald-300" },
  failed: { label: "Failed", bg: "bg-red-900/30", text: "text-red-300" },
};

function getButtonConfig(assignment: Assignment) {
  if (assignment.status === "completed") {
    return { label: "Completed", disabled: true, action: "none" as const };
  }
  if (assignment.last_session_id && assignment.last_session_status !== "completed") {
    return { label: "Continue", disabled: false, action: "continue" as const };
  }
  return { label: "Start Assignment", disabled: false, action: "start" as const };
}

export function AssignmentListShell() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await apiFetch<AssignmentsResponse>("/api/assignments");
        setAssignments(data.assignments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assignments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleAction = async (assignment: Assignment) => {
    const btn = getButtonConfig(assignment);

    if (btn.action === "continue" && assignment.last_session_id) {
      router.push(`/app/session/${assignment.last_session_id}`);
      return;
    }

    if (btn.action === "start") {
      setStartingSession(assignment.id);
      try {
        const firstVideo = assignment.course.videos[0];
        if (!firstVideo) {
          throw new Error("No videos found for this assignment");
        }

        const response = await apiFetch<any>("/api/sessions/start", {
          method: "POST",
          body: JSON.stringify({
            assignment_id: assignment.id,
            video_asset_id: firstVideo.id,
          }),
        });

        router.push(`/app/session/${response.id}`);
      } catch (err) {
        console.error("Failed to start assignment:", err);
        setStartingSession(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 animate-pulse"
          >
            <div className="h-5 w-48 rounded bg-slate-700" />
            <div className="mt-2 h-4 w-64 rounded bg-slate-700" />
            <div className="mt-4 h-9 w-full rounded bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-800 bg-red-900/30 p-6 text-sm text-red-300">
        Error: {error}
      </section>
    );
  }

  if (assignments.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
        No assignments yet.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const status = statusConfig[assignment.status] ?? statusConfig.assigned;
        const btn = getButtonConfig(assignment);

        return (
          <div
            key={assignment.id}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800/70 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {assignment.course.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {assignment.course.description}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {assignment.course.videos.length} video
                  {assignment.course.videos.length !== 1 ? "s" : ""} &bull;{" "}
                  {Math.round(
                    assignment.course.videos.reduce(
                      (sum, v) => sum + v.duration_sec,
                      0
                    ) / 60
                  )}{" "}
                  min total
                </p>
                {assignment.last_session_at && (
                  <p className="text-xs text-slate-500">
                    Last activity:{" "}
                    {new Date(assignment.last_session_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {assignment.due_at && (
                <div className="text-xs text-slate-400">
                  Due: {new Date(assignment.due_at).toLocaleDateString()}
                </div>
              )}

              <button
                onClick={() => handleAction(assignment)}
                disabled={btn.disabled || startingSession === assignment.id}
                className={`mt-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  btn.disabled
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white"
                }`}
              >
                {startingSession === assignment.id ? "Starting..." : btn.label}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
