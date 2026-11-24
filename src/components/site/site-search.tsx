"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Component, LayoutTemplate, MousePointerClick, Type, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { CommandPalette, type Command } from "@/components/ui/command-palette";
import { blocks, registry, type Category } from "@/registry/meta";

const icons: Record<Category, Command["icon"]> = {
  Controls: SlidersHorizontal,
  Actions: MousePointerClick,
  Text: Type,
  Motion: Sparkles,
  AI: Bot,
  Navigation: Component,
};

const commands: Command[] = [
  ...registry.map((item) => ({
    id: `/components/${item.slug}`,
    label: item.name,
    group: item.category,
    icon: icons[item.category],
  })),
  ...blocks.map((block) => ({
    id: `/blocks/${block.slug}`,
    label: `${block.name} block`,
    group: "Blocks",
    icon: LayoutTemplate,
  })),
];

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden h-8 w-44 items-center gap-2 rounded-md px-2.5 text-[13px] text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-950/[0.05] dark:hover:bg-neutral-50/[0.05] hover:text-neutral-950 dark:hover:text-neutral-50 md:flex"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded-[4px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-px font-mono text-[10px] text-neutral-600 dark:text-neutral-400">⌘K</kbd>
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        onSelect={(c) => router.push(c.id)}
      />
    </>
  );
}
