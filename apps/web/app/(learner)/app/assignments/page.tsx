import { AssignmentListShell } from "../../../../src/components/learner/assignment-list-shell";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Assignments</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your assigned training modules.
        </p>
      </div>
      <AssignmentListShell />
    </div>
  );
}
