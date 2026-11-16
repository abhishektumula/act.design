"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const links = [
  { href: "/components", label: "Instruments" },
  { href: "/blocks", label: "Blocks" },
  { href: "/setup", label: "Setup" },
  { href: "/pricing", label: "Pricing" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden h-full items-stretch md:flex">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative flex items-center px-3 text-[13px] transition-colors ${active ? "text-base-50" : "text-base-500 hover:text-base-100"}`}
          >
            {l.label}
            {active && (
              <motion.span
                layoutId="nav-active"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                className="absolute inset-x-3 -bottom-px h-px bg-base-50"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
