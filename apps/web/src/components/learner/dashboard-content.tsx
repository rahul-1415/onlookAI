"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@onlook/ui";
import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";

interface DashboardData {
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  avg_attention_score: number | null;
  total_interventions: number;
  passed_interventions: number;
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiFetch<DashboardData>(apiRoutes.dashboard);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 animate-pulse"
          >
            <div className="h-3 w-20 rounded bg-slate-700" />
            <div className="mt-4 h-8 w-16 rounded bg-slate-700" />
            <div className="mt-3 h-4 w-32 rounded bg-slate-700" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-800 bg-red-900/30 p-6 text-sm text-red-300">
        Error: {error}
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Assignments"
        value={`${data.completed_assignments}/${data.total_assignments}`}
        detail={
          data.in_progress_assignments > 0
            ? `${data.in_progress_assignments} in progress`
            : "No assignments in progress"
        }
      />
      <MetricCard
        label="Attention"
        value={data.avg_attention_score != null ? `${data.avg_attention_score}%` : "--"}
        detail="Average across completed sessions"
      />
      <MetricCard
        label="Interventions"
        value={
          data.total_interventions > 0
            ? `${data.passed_interventions}/${data.total_interventions}`
            : "--"
        }
        detail="Comprehension checks passed"
      />
    </section>
  );
}
