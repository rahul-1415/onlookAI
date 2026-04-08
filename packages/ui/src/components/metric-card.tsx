interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
  );
}

