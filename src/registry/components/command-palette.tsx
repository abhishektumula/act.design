"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  CornerDownLeft,
  CreditCard,
  FilePlus2,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Subsequence match: "nds" matches "New document". */
function fuzzy(label: string, query: string) {
  let i = 0;
  const l = label.toLowerCase();
  for (const ch of query.toLowerCase().replace(/\s/g, "")) {
    i = l.indexOf(ch, i);
    if (i === -1) return false;
    i++;
  }
  return true;
}

const noop = () => () => {};

export type Command = { id: string; label: string; group: string; icon: LucideIcon; shortcut?: string[] };

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  onSelect,
  hotkey = "k",
  placeholder = "Type a command or search…",
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  onSelect?: (c: Command) => void;
  hotkey?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, hotkey]);

  const results = useMemo(() => commands.filter((c) => fuzzy(c.label, query)), [commands, query]);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const groups = [...new Set(results.map((r) => r.group))];

  const close = () => {
    onOpenChange(false);
    setQuery("");
    setActive(0);
  };

  const select = (c: Command | undefined) => {
    if (!c) return;
    onSelect?.(c);
    close();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.96, y: -8, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: -4, filter: "blur(4px)" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
            onAnimationComplete={() => input.current?.focus()}
            data-slot="command-palette"
            className={cn("relative w-full max-w-lg overflow-hidden rounded-2xl bg-base-900 shadow-2xl shadow-shade ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10", className)}
          >
            <div className="flex items-center gap-3 border-b border-base-50/5 px-4">
              <Search className="size-4 text-base-500" />
              <input
                ref={input}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
                  else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
                  else if (e.key === "Enter") select(results[active]);
                  else if (e.key === "Escape") close();
                  else return;
                  e.preventDefault();
                }}
                placeholder={placeholder}
                className="h-13 flex-1 bg-transparent text-[15px] text-base-100 outline-none placeholder:text-base-500"
              />
              <kbd className="rounded-md bg-base-800 px-1.5 py-0.5 font-mono text-[10px] text-base-400 ring-1 ring-base-50/10">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && <p className="py-10 text-center text-sm text-base-500">No results for “{query}”</p>}
              {groups.map((group) => (
                <div key={group} className="mb-1">
                  <p className="px-2.5 pt-2 pb-1.5 text-[11px] font-medium tracking-wide text-base-500 uppercase">{group}</p>
                  {results
                    .filter((c) => c.group === group)
                    .map((c) => {
                      const i = results.indexOf(c);
                      const Icon = c.icon;
                      return (
                        <button
                          key={c.id}
                          onPointerMove={() => setActive(i)}
                          onClick={() => select(c)}
                          className={`relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                            active === i ? "text-base-50" : "text-base-400"
                          }`}
                        >
                          {active === i && (
                            <motion.span
                              layoutId={`${id}-hl`}
                              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                              className="absolute inset-0 rounded-lg bg-base-50/[0.06] ring-1 ring-base-50/5"
                            />
                          )}
                          <Icon className="relative size-4" />
                          <span className="relative flex-1 text-left">{c.label}</span>
                          {c.shortcut && (
                            <span className="relative flex gap-1">
                              {c.shortcut.map((k) => (
                                <kbd key={k} className="min-w-5 rounded bg-base-800 px-1 py-0.5 font-mono text-[10px] text-base-400 ring-1 ring-base-50/5">
                                  {k}
                                </kbd>
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-50/5 px-4 py-2.5 text-[11px] text-base-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-base-800 px-1 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="size-3" /> select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const commands: Command[] = [
  { id: "dash", label: "Go to Dashboard", group: "Navigation", icon: LayoutDashboard, shortcut: ["G", "D"] },
  { id: "settings", label: "Open Settings", group: "Navigation", icon: Settings, shortcut: ["⌘", ","] },
  { id: "billing", label: "Billing", group: "Navigation", icon: CreditCard },
  { id: "new", label: "New document", group: "Actions", icon: FilePlus2, shortcut: ["⌘", "N"] },
  { id: "invite", label: "Invite teammate", group: "Actions", icon: UserPlus },
  { id: "theme", label: "Toggle theme", group: "Actions", icon: Moon, shortcut: ["⌘", "T"] },
  { id: "github", label: "Connect GitHub", group: "Integrations", icon: GitBranch },
  { id: "logout", label: "Log out", group: "Account", icon: LogOut },
];

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-72 items-center gap-2.5 rounded-xl bg-base-900 px-3 text-sm text-base-500 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-colors hover:text-base-300"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search commands…</span>
        <kbd className="rounded-md bg-base-800 px-1.5 py-0.5 font-mono text-[10px] text-base-400 ring-1 ring-base-50/10">⌘J</kbd>
      </button>
      <p className="h-4 text-xs text-base-500">{last && <>Ran “{last}”</>}</p>
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} hotkey="j" onSelect={(c) => setLast(c.label)} />
    </div>
  );
}
