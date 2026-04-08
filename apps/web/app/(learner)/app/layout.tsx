import type { ReactNode } from "react";

import { AppShell } from "@onlook/ui";

import { LearnerNavigation } from "../../../src/components/layout/learner-navigation";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Attune Compliance"
      subtitle="Learner surface for assignments, session playback, intervention handling, and completion history."
    >
      <LearnerNavigation />
      {children}
    </AppShell>
  );
}
