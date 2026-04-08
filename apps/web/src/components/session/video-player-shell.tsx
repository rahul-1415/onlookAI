interface VideoPlayerShellProps {
  sessionId: string;
}

export function VideoPlayerShell({ sessionId }: VideoPlayerShellProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-950" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
          Video surface placeholder for session <span className="font-medium text-white">{sessionId}</span>.
        </div>
        <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
          Attention badge, session timer, and progress controls will mount here.
        </div>
        <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">
          Transcript panel and intervention modal trigger zone will mount here.
        </div>
      </div>
    </section>
  );
}

