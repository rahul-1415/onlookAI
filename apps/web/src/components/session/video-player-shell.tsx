"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import { useAttentionMonitor, type InterventionDetail } from "@/hooks/use-attention-monitor";
import { InterventionModal } from "./intervention-modal";

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

interface VideoAssetData {
  id: string;
  title: string;
  description: string;
  duration_sec: number;
  storage_url: string;
}

export function VideoPlayerShell({ sessionId }: VideoPlayerShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [video, setVideo] = useState<VideoAssetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showInterventionModal, setShowInterventionModal] = useState(false);

  const {
    startMonitoring,
    stopMonitoring,
    activeIntervention,
    clearIntervention,
  } = useAttentionMonitor(sessionId);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await apiFetch<{
          session: SessionData;
          storage_url: string;
          video_title: string;
        }>(apiRoutes.getSession(sessionId));

        setSession(response.session);

        // Fetch video asset details
        setVideo({
          id: response.session.video_asset_id,
          title: response.video_title,
          description: "",
          duration_sec: 0,
          storage_url: response.storage_url,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

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
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopMonitoring();
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

  const handleModalClose = (nextAction?: string) => {
    setShowInterventionModal(false);
    clearIntervention();

    // Handle next action
    if (nextAction === "resume" || nextAction === "replay_then_retry") {
      // Resume video
      if (videoRef.current && !isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
        startMonitoring();
      }
    }
    // "retry" means learner can try again - modal will reappear with same question
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

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
      <div className="aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={video?.storage_url}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">{video?.title}</h3>
        <p className="text-sm text-slate-400">{video?.description}</p>

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
          <span className="font-medium text-white">Session ID:</span> {sessionId.slice(0, 8)}...
        </div>
        <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
          <span className="font-medium text-white">Status:</span> {session?.status}
        </div>
        <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
          <span className="font-medium text-white">Duration:</span> {Math.floor(duration / 60)}m
        </div>
      </div>

      {showInterventionModal && activeIntervention && (
        <InterventionModal
          open={showInterventionModal}
          sessionId={sessionId}
          intervention={activeIntervention}
          onClose={handleModalClose}
        />
      )}
    </section>
  );
}
