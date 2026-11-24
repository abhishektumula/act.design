"use client";

import { Search } from "lucide-react";
import { btnSecondary } from "./styles";

/** A secondary key that opens the site command palette (it listens for ⌘K). */
export function SearchKey({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className={`${btnSecondary} h-11 rounded-md pr-2 pl-4 text-[14px] ${className}`}
    >
      <Search className="size-4 text-neutral-500" />
      <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
      <kbd className="ml-3 rounded-[3px] px-1.5 py-1 font-mono text-[11px] leading-none text-neutral-500 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10">
        ⌘K
      </kbd>
    </button>
  );
}
