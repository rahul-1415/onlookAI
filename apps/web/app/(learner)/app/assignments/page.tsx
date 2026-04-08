import { PagePlaceholder } from "@onlook/ui";

import { AssignmentListShell } from "../../../../src/components/learner/assignment-list-shell";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <PagePlaceholder
        eyebrow="Learner"
        title="Assignments"
        description="Reserved for assignment list, due dates, progress, and launch actions."
      />
      <AssignmentListShell />
    </div>
  );
}
