import type { ReactNode } from "react";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            OnlookAI Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

