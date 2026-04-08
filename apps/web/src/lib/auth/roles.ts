import type { UserRole } from "@onlook/shared-types";

export const roleLandingPath: Record<UserRole, string> = {
  learner: "/app",
  compliance_admin: "/admin",
  org_admin: "/admin"
};

