"use client";

import { create } from "zustand";

import type { InterventionSummary, SessionStatus } from "@onlook/shared-types";

interface SessionStoreState {
  status: SessionStatus;
  activeIntervention: InterventionSummary | null;
  setStatus: (status: SessionStatus) => void;
  setActiveIntervention: (intervention: InterventionSummary | null) => void;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  status: "idle",
  activeIntervention: null,
  setStatus: (status) => set({ status }),
  setActiveIntervention: (activeIntervention) => set({ activeIntervention })
}));

