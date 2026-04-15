"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";

interface TimelineEvent {
  type: "attention" | "intervention";
  timestamp: string;
  event_type?: string;
  score?: number;
  intervention_status?: string;
  question_text?: string;
}

interface TimelineData {
  session_id: string;
  events: TimelineEvent[];
}

interface SessionTimelineShellProps {
  sessionId: string;
  isActive?: boolean;
}

const negativeEvents = new Set([
  "tab_hidden",
  "window_blur",
  "idle",
  "no_face",
  "playback_paused",
  "warning",
]);

const positiveEvents = new Set([
  "tab_visible",
  "window_focus",
  "activity_resumed",
  "face_detected",
  "playback_resumed",
]);

function eventDotColor(event: TimelineEvent): string {
  if (event.type === "intervention") {
    if (event.intervention_status === "passed") return "bg-emerald-400";
    if (event.intervention_status === "failed") return "bg-red-400";
    return "bg-amber-400";
  }
  if (event.event_type && negativeEvents.has(event.event_type)) return "bg-red-400";
  if (event.event_type && positiveEvents.has(event.event_type)) return "bg-emerald-400";
  return "bg-slate-400";
}

function formatEventLabel(event: TimelineEvent): string {
  if (event.type === "intervention") {
    const status = event.intervention_status ?? "open";
    return `Intervention (${status})`;
  }
  return (event.event_type ?? "unknown").replace(/_/g, " ");
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SessionTimelineShell({
  sessionId,
  isActive = false,
}: SessionTimelineShellProps) {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    try {
      const data = await apiFetch<TimelineData>(
        apiRoutes.sessionTimeline(sessionId)
      );
      setTimeline(data);
    } catch {
      // Silently fail — timeline is supplementary
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Auto-refresh while session is active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(fetchTimeline, 10_000);
    return () => clearInterval(interval);
  }, [isActive, fetchTimeline]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="h-4 w-32 rounded bg-slate-700 animate-pulse" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-slate-700 animate-pulse" />
              <div className="h-3 w-48 rounded bg-slate-700 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const events = timeline?.events ?? [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Session Timeline</h3>

      {events.length === 0 ? (
        <p className="text-sm text-slate-500">
          No events recorded yet — start playing the video.
        </p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-1.5 text-sm"
            >
              <div className="flex flex-col items-center mt-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${eventDotColor(event)}`} />
                {idx < events.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 min-h-[16px]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 capitalize">
                    {formatEventLabel(event)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                {event.type === "intervention" && event.question_text && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {event.question_text}
                  </p>
                )}
                {event.score != null && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Score: {Math.round(event.score)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
