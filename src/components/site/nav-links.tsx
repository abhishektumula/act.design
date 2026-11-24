"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/components", label: "Instruments" },
  { href: "/blocks", label: "Blocks" },
  { href: "/setup", label: "Setup" },
  { href: "/pricing", label: "Pricing" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active ? "text-base-50" : "text-base-400 hover:text-base-50"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
