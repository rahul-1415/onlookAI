"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import { useAttentionMonitor, type InterventionDetail } from "@/hooks/use-attention-monitor";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { InterventionModal } from "./intervention-modal";
import { SessionCompletion } from "./session-completion";
import { SessionTimelineShell } from "./session-timeline-shell";

interface VideoPlayerShellProps {
  sessionId: string;
}

interface SessionData {
  id: string;
  assignment_id: string;
  video_asset_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

interface CompletionData {
  final_score: number;
  total_events: number;
  interventions_triggered: number;
  interventions_passed: number;
  duration_seconds: number;
}

export function VideoPlayerShell({ sessionId }: VideoPlayerShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [completion, setCompletion] = useState<CompletionData | null>(null);

  const {
    startMonitoring,
    stopMonitoring,
    activeIntervention,
    clearIntervention,
    reportFaceStatus,
  } = useAttentionMonitor(sessionId);

  const {
    faceStatus,
    cameraError,
    startDetection,
    stopDetection,
  } = useFaceDetection();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await apiFetch<{
          session: SessionData;
          storage_url: string;
          video_title: string;
        }>(apiRoutes.getSession(sessionId));

        setSession(response.session);
        setVideoUrl(response.storage_url);
        setVideoTitle(response.video_title);

        // If session is already completed, fetch completion data
        if (response.session.status === "completed") {
          setCompletion({
            final_score: 0,
            total_events: 0,
            interventions_triggered: 0,
            interventions_passed: 0,
            duration_seconds: 0,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Bridge face detection status to attention events
  useEffect(() => {
    if (faceStatus === "detected" || faceStatus === "not_detected") {
      reportFaceStatus(faceStatus);
    }
  }, [faceStatus, reportFaceStatus]);

  // When intervention appears, pause video and show modal
  useEffect(() => {
    if (activeIntervention) {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowInterventionModal(true);
    }
  }, [activeIntervention, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        stopMonitoring();
      } else {
        videoRef.current.play();
        startMonitoring();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    startMonitoring();
    startDetection();
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopMonitoring();
    stopDetection();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    stopMonitoring();
    stopDetection();

    try {
      const result = await apiFetch<{ session: SessionData } & CompletionData>(
        apiRoutes.sessionComplete(sessionId),
        { method: "POST" }
      );
      setCompletion({
        final_score: result.final_score,
        total_events: result.total_events,
        interventions_triggered: result.interventions_triggered,
        interventions_passed: result.interventions_passed,
        duration_seconds: result.duration_seconds,
      });
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  };

  const handleModalClose = (nextAction?: string) => {
    setShowInterventionModal(false);
    clearIntervention();

    if (nextAction === "resume" || nextAction === "replay_then_retry") {
      if (videoRef.current && !isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
        startMonitoring();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="aspect-video rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center">
          <p className="text-slate-400">Loading video...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-800 bg-red-900/30 p-6">
        <p className="text-red-300">Error: {error}</p>
      </section>
    );
  }

  // Show completion view
  if (completion) {
    return (
      <div className="space-y-6">
        <SessionCompletion
          finalScore={completion.final_score}
          durationSeconds={completion.duration_seconds}
          interventionsTriggered={completion.interventions_triggered}
          interventionsPassed={completion.interventions_passed}
        />
        <SessionTimelineShell sessionId={sessionId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl ?? undefined}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleVideoEnded}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{videoTitle}</h3>

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  setCurrentTime(newTime);
                  if (videoRef.current) {
                    videoRef.current.currentTime = newTime;
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="text-sm text-slate-400 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mt-4">
          <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
            <span className="font-medium text-white">Session ID:</span>{" "}
            {sessionId.slice(0, 8)}...
          </div>
          <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
            <span className="font-medium text-white">Status:</span>{" "}
            {session?.status}
          </div>
          <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
            <span className="font-medium text-white">Duration:</span>{" "}
            {Math.floor(duration / 60)}m
          </div>
        </div>

        {cameraError && (
          <div className="text-xs text-amber-400 mt-1">
            Camera unavailable — face detection disabled
          </div>
        )}

        {showInterventionModal && activeIntervention && (
          <InterventionModal
            open={showInterventionModal}
            sessionId={sessionId}
            intervention={activeIntervention}
            onClose={handleModalClose}
          />
        )}
      </section>

      <SessionTimelineShell sessionId={sessionId} isActive={isPlaying} />
    </div>
  );
}
