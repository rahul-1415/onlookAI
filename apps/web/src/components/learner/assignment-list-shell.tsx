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
}

interface AssignmentsResponse {
  assignments: Assignment[];
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

  const handleStartAssignment = async (assignment: Assignment) => {
    setStartingSession(assignment.id);
    try {
      // Get the first video for this assignment
      const firstVideo = assignment.course.videos[0];
      if (!firstVideo) {
        throw new Error("No videos found for this assignment");
      }

      // Create a new session
      const response = await apiFetch<any>("/api/sessions/start", {
        method: "POST",
        body: JSON.stringify({
          assignment_id: assignment.id,
          video_asset_id: firstVideo.id,
        }),
      });

      // Navigate to the session page
      router.push(`/app/session/${response.id}`);
    } catch (err) {
      console.error("Failed to start assignment:", err);
      setStartingSession(null);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
        Loading assignments...
      </section>
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
      {assignments.map((assignment) => (
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                {assignment.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                {assignment.course.videos.length} video{assignment.course.videos.length !== 1 ? 's' : ''} •{' '}
                {assignment.course.videos.reduce((sum, v) => sum + v.duration_sec, 0)} minutes total
              </p>
            </div>

            {assignment.due_at && (
              <div className="text-xs text-slate-400">
                Due: {new Date(assignment.due_at).toLocaleDateString()}
              </div>
            )}

            <button
              onClick={() => handleStartAssignment(assignment)}
              disabled={startingSession === assignment.id}
              className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {startingSession === assignment.id ? "Starting..." : "Start Assignment"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

