"use client";

import { Search } from "lucide-react";
import { btnSecondary } from "./styles";

/** A secondary key that opens the site command palette (it listens for ⌘K). */
export function SearchKey({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className={`${btnSecondary} h-12 rounded-xl pr-2 pl-4 text-[15px] ${className}`}
    >
      <Search className="size-4 text-base-500" />
      <span className="text-base-300">{label}</span>
      <kbd className="ml-3 rounded-md bg-base-800 px-1.5 py-1 font-mono text-[11px] leading-none text-base-400 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10">
        ⌘K
      </kbd>
    </button>
  );
}
