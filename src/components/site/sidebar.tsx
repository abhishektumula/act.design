"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bot, ChevronDown, Compass, Download, LayoutTemplate, MousePointerClick, SlidersHorizontal, Sparkles } from "lucide-react";
import { blocks, categories, registry, type Category } from "@/registry/meta";
import { NewMark } from "./fx";

type Group = { id: string; label: string; icon: ComponentType<{ className?: string }>; items: { href: string; name: string; isNew?: boolean }[] };

const icons: Record<Category, Group["icon"]> = {
  Controls: SlidersHorizontal,
  Actions: MousePointerClick,
  Motion: Sparkles,
  AI: Bot,
  Navigation: Compass,
};

const groups: Group[] = [
  {
    id: "start",
    label: "Get started",
    icon: Download,
    items: [
      { href: "/setup", name: "Setup guide" },
      { href: "/components", name: `All instruments · ${registry.length}` },
      { href: "/blocks", name: `All blocks · ${blocks.length}` },
    ],
  },
  ...categories.map((cat) => ({
    id: cat,
    label: cat,
    icon: icons[cat],
    items: registry.filter((r) => r.category === cat).map((r) => ({ href: `/components/${r.slug}`, name: r.name, isNew: r.isNew })),
  })),
  { id: "blocks", label: "Blocks", icon: LayoutTemplate, items: blocks.map((b) => ({ href: `/blocks/${b.slug}`, name: b.name, isNew: b.isNew })) },
];

export function Sidebar() {
  const pathname = usePathname();
  // Every group starts open; the one holding the current page can never be closed by accident.
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav className="scrollbar-thin sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
      {groups.map((g) => {
        const holdsActive = g.items.some((i) => i.href === pathname);
        const open = holdsActive || !closed[g.id];
        const Icon = g.icon;
        return (
          <div key={g.id} className="mb-2">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setClosed((c) => ({ ...c, [g.id]: open }))}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[15px] font-medium text-base-100 transition-colors hover:text-base-50"
            >
              <Icon className="size-4 text-base-400" />
              <span className="flex-1 text-left">{g.label}</span>
              <ChevronDown className={`size-4 text-base-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="ml-4 overflow-hidden border-l border-base-50/[0.08]"
                >
                  {g.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`relative -ml-px flex items-center justify-between gap-2 border-l py-1.5 pr-2 pl-4 text-sm transition-colors ${
                            active ? "border-signal text-base-50" : "border-transparent text-base-400 hover:border-base-50/30 hover:text-base-100"
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.isNew && <NewMark />}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
