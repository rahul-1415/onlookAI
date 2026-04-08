import Link from "next/link";

import { AppShell, MetricCard, PagePlaceholder } from "@onlook/ui";

export default function HomePage() {
  return (
    <AppShell
      title="OnlookAI"
      subtitle="Platform scaffold for engagement-aware training products. Attune Compliance is the first reference surface."
    >
      <PagePlaceholder
        eyebrow="Public"
        title="Reference Product Surface"
        description="This page is intentionally minimal. It anchors the public route structure while the actual marketing and launch surface is implemented later."
      >
        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <Link
            className="rounded-full border border-slate-700 px-4 py-2 hover:border-cyan-400"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-4 py-2 hover:border-cyan-400"
            href="/app"
          >
            Learner App
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-4 py-2 hover:border-cyan-400"
            href="/admin"
          >
            Admin App
          </Link>
        </div>
      </PagePlaceholder>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Use Case"
          value="Compliance"
          detail="Initial vertical for contextual interventions during video playback."
        />
        <MetricCard
          label="Platform"
          value="Reusable"
          detail="Designed to extend into onboarding, education, healthcare, and safety training."
        />
        <MetricCard
          label="State"
          value="Scaffold"
          detail="Folder structure, contracts, and docs exist; product logic is intentionally deferred."
        />
      </section>
    </AppShell>
  );
}

