import { MetricCard, PagePlaceholder } from "@onlook/ui";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PagePlaceholder
        eyebrow="Admin"
        title="Operations Dashboard"
        description="Reserved for completion rate, average attention score, intervention load, and flagged sessions."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Completion Rate"
          value="--"
          detail="Will aggregate course outcomes by organization and module."
        />
        <MetricCard
          label="Interventions"
          value="--"
          detail="Will highlight recovery question volume and pass rate."
        />
        <MetricCard
          label="Risk"
          value="--"
          detail="Will surface learners and modules that need review."
        />
      </section>
    </div>
  );
}

