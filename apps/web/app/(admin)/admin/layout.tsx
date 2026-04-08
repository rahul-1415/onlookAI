import type { ReactNode } from "react";

import { AppShell } from "@onlook/ui";

import { AdminNavigation } from "../../../src/components/layout/admin-navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Attune Compliance Admin"
      subtitle="Admin surface for videos, courses, assignments, policies, reports, and audit evidence."
    >
      <AdminNavigation />
      {children}
    </AppShell>
  );
}
