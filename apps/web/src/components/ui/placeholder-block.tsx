interface PlaceholderBlockProps {
  title: string;
  description: string;
}

export function PlaceholderBlock({
  title,
  description,
}: PlaceholderBlockProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

