"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { blocks, categories, registry } from "@/registry/meta";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-thin sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto py-10 pr-4 lg:block">
      <Link
        href="/components"
        className={`mb-8 block rounded-lg px-3 py-1.5 text-sm transition-colors ${
          pathname === "/components" ? "text-base-50" : "text-base-400 hover:text-base-100"
        }`}
      >
        All components
        <span className="ml-2 text-base-600">{registry.length}</span>
      </Link>
      <Link
        href="/blocks"
        className="-mt-7 mb-8 block rounded-lg px-3 py-1.5 text-sm text-base-400 transition-colors hover:text-base-100"
      >
        Blocks
        <span className="ml-2 text-base-600">{blocks.length}</span>
      </Link>
      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <p className="px-3 pb-2 text-xs font-medium text-base-500">{cat}</p>
          <ul>
            {registry
              .filter((r) => r.category === cat)
              .map((r) => {
                const active = pathname === `/components/${r.slug}`;
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/components/${r.slug}`}
                      className={`relative flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        active ? "text-base-50" : "text-base-400 hover:text-base-100"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                          className="absolute inset-0 rounded-lg bg-base-50/[0.06] ring-1 ring-base-50/5"
                        />
                      )}
                      <span className="relative">{r.name}</span>
                      {r.isNew && <span className="relative size-1.5 rounded-full bg-blue-400" aria-label="New" />}
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
