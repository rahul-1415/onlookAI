import { DashboardContent } from "../../../src/components/learner/dashboard-content";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your training progress at a glance.
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
