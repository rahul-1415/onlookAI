import { MetricCard, PagePlaceholder } from "@onlook/ui";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6">
      <PagePlaceholder
        eyebrow="Learner"
        title="Dashboard"
        description="Reserved for assigned modules, in-progress sessions, certificates, and completion summaries."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Assignments"
          value="--"
          detail="Will summarize required modules by due date and status."
        />
        <MetricCard
          label="Attention"
          value="--"
          detail="Will surface average attention and recovery performance."
        />
        <MetricCard
          label="Completion"
          value="--"
          detail="Will track completed vs in-progress training."
        />
      </section>
    </div>
  );
}

