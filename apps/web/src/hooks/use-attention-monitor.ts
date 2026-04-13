"use client";

import { useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";

export type AttentionEventType =
  | "TAB_HIDDEN"
  | "TAB_VISIBLE"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "IDLE"
  | "ACTIVITY_RESUMED"
  | "NO_FACE"
  | "FACE_DETECTED";

export interface AttentionEventPayload {
  event_type: AttentionEventType;
  occurred_at: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface InterventionDetail {
  id: string;
  question_json: Record<string, unknown>;
  status: string;
}

export interface AttentionEventResponse {
  score: number;
  session_status: string;
  intervention?: InterventionDetail;
}

export function useAttentionMonitor(sessionId: string) {
  const [activeIntervention, setActiveIntervention] =
    useState<InterventionDetail | null>(null);

  const isMonitoringRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  // Post attention event to backend
  const postAttentionEvent = useCallback(
    async (
      eventType: AttentionEventType,
      metadata?: Record<string, unknown>
    ) => {
      try {
        const response = await apiFetch<AttentionEventResponse>(
          apiRoutes.sessionAttention(sessionId),
          {
            method: "POST",
            body: JSON.stringify({
              event_type: eventType,
              occurred_at: new Date().toISOString(),
              metadata: metadata || {},
            }),
          }
        );

        // If intervention triggered, update state
        if (response.intervention) {
          setActiveIntervention(response.intervention);
        }
      } catch (error) {
        console.error("Failed to post attention event:", error);
      }
    },
    [sessionId]
  );

  // Reset idle timer and mark as active
  const resetIdleTimer = useCallback(() => {
    if (!isMonitoringRef.current) return;

    // If was idle, post activity_resumed event
    if (isIdleRef.current) {
      isIdleRef.current = false;
      postAttentionEvent("ACTIVITY_RESUMED");
    }

    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Set new idle timer (30 seconds)
    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      postAttentionEvent("IDLE");
    }, 30000); // 30 seconds
  }, [postAttentionEvent]);

  // Visibility change handler
  const handleVisibilityChange = useCallback(() => {
    if (!isMonitoringRef.current) return;

    if (document.hidden) {
      postAttentionEvent("TAB_HIDDEN");
    } else {
      postAttentionEvent("TAB_VISIBLE");
    }
  }, [postAttentionEvent]);

  // Window blur handler
  const handleWindowBlur = useCallback(() => {
    if (!isMonitoringRef.current) return;
    postAttentionEvent("WINDOW_BLUR");
  }, [postAttentionEvent]);

  // Window focus handler
  const handleWindowFocus = useCallback(() => {
    if (!isMonitoringRef.current) return;
    postAttentionEvent("WINDOW_FOCUS");
  }, [postAttentionEvent]);

  // Activity handler (mousemove, keydown)
  const handleActivity = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return;

    isMonitoringRef.current = true;
    isIdleRef.current = false;

    // Register event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);

    // Initialize idle timer
    resetIdleTimer();
  }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus, handleActivity, resetIdleTimer]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoringRef.current) return;

    isMonitoringRef.current = false;

    // Remove event listeners
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("mousemove", handleActivity);
    document.removeEventListener("keydown", handleActivity);

    // Clear idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus, handleActivity]);

  // Clear intervention
  const clearIntervention = useCallback(() => {
    setActiveIntervention(null);
  }, []);

  // Report face detection status from external hook
  const reportFaceStatus = useCallback(
    (status: "detected" | "not_detected") => {
      if (!isMonitoringRef.current) return;
      postAttentionEvent(status === "detected" ? "FACE_DETECTED" : "NO_FACE");
    },
    [postAttentionEvent]
  );

  return {
    startMonitoring,
    stopMonitoring,
    activeIntervention,
    clearIntervention,
    reportFaceStatus,
  };
}
