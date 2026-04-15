export const apiRoutes = {
  login: "/api/auth/login",
  me: "/api/auth/me",
  logout: "/api/auth/logout",
  dashboard: "/api/dashboard",
  assignments: "/api/assignments",
  startSession: "/api/sessions/start",
  getSession: (sessionId: string) => `/api/sessions/${sessionId}`,
  sessionHeartbeat: (sessionId: string) => `/api/sessions/${sessionId}/heartbeat`,
  sessionAttention: (sessionId: string) =>
    `/api/sessions/${sessionId}/attention-event`,
  sessionTimeline: (sessionId: string) =>
    `/api/sessions/${sessionId}/timeline`,
  interventionAnswer: (sessionId: string, interventionId: string) =>
    `/api/sessions/${sessionId}/intervention/${interventionId}/answer`,
  sessionComplete: (sessionId: string) => `/api/sessions/${sessionId}/complete`,
  adminReportsOverview: "/api/admin/reports/overview"
} as const;

