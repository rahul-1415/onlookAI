import type { ReactNode } from "react";

interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  children,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

