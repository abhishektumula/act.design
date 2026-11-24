"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { blocks, categories, registry } from "@/registry/meta";

const head = "px-3 pb-2.5 text-[13px] font-medium text-base-50";

export function Sidebar() {
  const pathname = usePathname();

  const top = [
    { href: "/components", label: "All instruments", count: registry.length },
    { href: "/blocks", label: "Blocks", count: blocks.length },
  ];

  return (
    <nav className="scrollbar-thin sticky top-16 hidden h-[calc(100svh-4rem)] w-56 shrink-0 overflow-y-auto py-10 pr-4 lg:block">
      <ul className="mb-9">
        {top.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`flex items-center justify-between rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                pathname === l.href ? "bg-base-900 text-base-50" : "text-base-400 hover:text-base-100"
              }`}
            >
              {l.label}
              <span className="text-xs text-base-500 tabular-nums">{l.count}</span>
            </Link>
          </li>
        ))}
      </ul>
      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <p className={head}>{cat}</p>
          <ul className="ml-3 border-l border-base-50/[0.08]">
            {registry
              .filter((r) => r.category === cat)
              .map((r) => {
                const active = pathname === `/components/${r.slug}`;
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/components/${r.slug}`}
                      className={`relative -ml-px flex items-center justify-between border-l border-transparent py-1.5 pr-2 pl-4 text-[13px] transition-colors ${
                        active ? "text-base-50" : "text-base-400 hover:border-base-50/30 hover:text-base-100"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                          className="absolute inset-y-1 -left-px w-px bg-signal"
                        />
                      )}
                      <span>{r.name}</span>
                      {r.isNew && <span className="rounded bg-signal/10 px-1.5 text-[10px] font-medium text-signal">New</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
