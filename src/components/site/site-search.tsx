"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Component, CreditCard, LayoutGrid, LayoutPanelTop, LayoutTemplate, MousePointerClick, Search, TextCursorInput } from "lucide-react";
import { CommandPalette, type Command } from "@/components/ui/command-palette";
import { blocks, registry, type Category } from "@/registry/meta";

const icons: Record<Category, Command["icon"]> = {
  AI: Bot,
  Cards: CreditCard,
  Actions: MousePointerClick,
  Inputs: TextCursorInput,
  Navigation: Component,
  Overlays: LayoutPanelTop,
  "Data Display": LayoutGrid,
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
        className="hidden h-9 w-52 items-center gap-2 rounded-xl bg-base-900/80 px-3 text-sm text-base-500 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-colors hover:text-base-300 md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded-md bg-base-800 px-1.5 py-0.5 font-mono text-[10px] text-base-400 ring-1 ring-base-50/10">⌘K</kbd>
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
