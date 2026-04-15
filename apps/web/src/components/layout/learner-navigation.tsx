"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/assignments", label: "Assignments" },
];

export function LearnerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-3">
      {links.map((link) => {
        const isActive =
          link.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              isActive
                ? "border-blue-600 bg-blue-900/30 text-white"
                : "border-slate-800 bg-slate-900/70 text-slate-200 hover:border-slate-600"
            }`}
            href={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
