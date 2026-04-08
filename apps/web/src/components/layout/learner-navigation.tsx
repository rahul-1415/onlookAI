import Link from "next/link";

const links = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/assignments", label: "Assignments" }
];

export function LearnerNavigation() {
  return (
    <nav className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200"
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

