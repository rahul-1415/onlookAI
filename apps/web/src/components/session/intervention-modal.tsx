interface InterventionModalProps {
  open: boolean;
}

export function InterventionModal({ open }: InterventionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-50">
      Placeholder intervention modal for contextual question-and-answer recovery.
    </div>
  );
}

