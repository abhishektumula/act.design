"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bot, LayoutGrid, MousePointerClick, Search, SlidersHorizontal, Sparkles, Type, X } from "lucide-react";
import { categories, registry, type Category, type RegistryItem } from "@/registry/meta";
import { NewMark } from "./fx";

type Filter = Category | "All";

const icons: Record<Filter, ComponentType<{ className?: string }>> = {
  All: LayoutGrid,
  Controls: SlidersHorizontal,
  Actions: MousePointerClick,
  Text: Type,
  Motion: Sparkles,
  AI: Bot,
};

const filters: Filter[] = ["All", ...categories];

/** How well an item matches the query: name first, then the start of a word, then anywhere in the description. 0 is no match. */
function score(item: RegistryItem, q: string) {
  const name = item.name.toLowerCase();
  if (name.startsWith(q)) return 4;
  if (name.split(/\s+/).some((w) => w.startsWith(q))) return 3;
  if (name.includes(q) || item.category.toLowerCase().startsWith(q)) return 2;
  if (item.description.toLowerCase().includes(q)) return 1;
  return 0;
}

/** The name with the matched part picked out. */
function Mark({ text, q }: { text: string; q: string }) {
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-neutral-950 underline decoration-blue-600/60 decoration-2 underline-offset-[3px] dark:text-neutral-50 dark:decoration-blue-500/60">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  );
}

/**
 * The components sidebar: a search field and category filters on top, the matching
 * components underneath. `/` jumps to the search; arrow keys move into the results.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    const pool = registry.filter((r) => filter === "All" || r.category === filter);
    if (!q) return pool;
    return pool
      .map((r) => ({ r, s: score(r, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.r);
  }, [filter, q]);

  // Browsing everything with no search keeps the list grouped by category.
  const grouped = filter === "All" && !q;
  const counts = useMemo(() => Object.fromEntries(filters.map((f) => [f, registry.filter((r) => f === "All" || r.category === f).length])), []);

  // `/` focuses the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || t.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = () => Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      links()[0]?.focus();
    } else if (e.key === "Enter" && results[0]) {
      router.push(`/components/${results[0].slug}`);
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else input.current?.blur();
    }
  };
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const all = links();
    const i = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowUp" && i <= 0) return input.current?.focus();
    all[Math.min(all.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))]?.focus();
  };

  const row = (item: RegistryItem) => {
    const active = pathname === `/components/${item.slug}`;
    return (
      <motion.li key={item.slug} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <Link
          href={`/components/${item.slug}`}
          aria-current={active ? "page" : undefined}
          className={`relative -ml-px flex items-center justify-between gap-2 border-l py-1.5 pr-2 pl-4 text-sm transition-colors outline-none focus-visible:bg-neutral-950/[0.04] dark:focus-visible:bg-neutral-50/[0.06] ${
            active
              ? "border-blue-600 text-neutral-950 dark:border-blue-500 dark:text-neutral-50"
              : "border-transparent text-neutral-600 hover:border-neutral-950/30 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-50/30 dark:hover:text-neutral-100"
          }`}
        >
          <span className="truncate">
            <Mark text={item.name} q={q} />
          </span>
          {item.isNew && <NewMark />}
        </Link>
      </motion.li>
    );
  };

  return (
    <nav aria-label="Components" className="scrollbar-thin sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 flex-col py-8 pr-4 lg:flex">
      {/* Search */}
      <label className="group relative flex h-9 items-center gap-2 rounded-lg bg-neutral-950/[0.04] px-2.5 ring-1 ring-neutral-950/[0.06] transition-[background-color,box-shadow] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/40 dark:bg-neutral-50/[0.05] dark:ring-neutral-50/[0.06] dark:focus-within:bg-neutral-950 dark:focus-within:ring-blue-500/40">
        <Search className="size-4 shrink-0 text-neutral-500" />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          placeholder="Search components"
          aria-label="Search components"
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100"
        />
        {query ? (
          <button type="button" aria-label="Clear search" onClick={() => (setQuery(""), input.current?.focus())} className="grid size-5 place-items-center rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="grid h-5 min-w-5 place-items-center rounded border border-neutral-950/10 px-1 font-mono text-[10px] text-neutral-500 dark:border-neutral-50/10">/</kbd>
        )}
      </label>

      {/* Categories */}
      <div role="radiogroup" aria-label="Category" className="mt-3 flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const on = filter === f;
          const Icon = icons[f];
          return (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setFilter(f)}
              className={`relative flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                on ? "text-white dark:text-neutral-950" : "text-neutral-600 ring-1 ring-neutral-950/[0.08] hover:text-neutral-950 hover:ring-neutral-950/20 dark:text-neutral-400 dark:ring-neutral-50/[0.08] dark:hover:text-neutral-50 dark:hover:ring-neutral-50/20"
              }`}
            >
              {on && <motion.span layoutId="sidebar-filter" transition={{ type: "spring", stiffness: 500, damping: 38 }} className="absolute inset-0 rounded-full bg-neutral-950 dark:bg-neutral-50" />}
              <Icon className="relative size-3.5" />
              <span className="relative">{f === "All" ? "Browse all" : f}</span>
              <span className={`relative font-mono text-[10px] tabular-nums ${on ? "opacity-60" : "text-neutral-400 dark:text-neutral-500"}`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="scrollbar-thin -mr-4 mt-5 min-h-0 flex-1 overflow-y-auto pr-4">
        <p aria-live="polite" className="mb-2 px-1 font-mono text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
          {q ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : filter === "All" ? `All components · ${results.length}` : `${filter} · ${results.length}`}
        </p>

        {results.length === 0 ? (
          <div className="mt-6 px-1 text-sm text-neutral-500">
            Nothing matches “{query.trim()}”{filter !== "All" && <> in {filter}</>}.
            {filter !== "All" && (
              <button type="button" onClick={() => setFilter("All")} className="mt-2 block text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-600 dark:text-neutral-100 dark:decoration-neutral-700">
                Search everything
              </button>
            )}
          </div>
        ) : grouped ? (
          <ul ref={list} onKeyDown={onListKey}>
            {categories.map((cat) => {
              const Icon = icons[cat];
              return (
                <li key={cat} className="mb-3">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    <Icon className="size-3.5 text-neutral-500" />
                    {cat}
                  </div>
                  <ul className="ml-[11px] border-l border-neutral-950/[0.08] dark:border-neutral-50/[0.08]">{results.filter((r) => r.category === cat).map(row)}</ul>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul ref={list} onKeyDown={onListKey} className="ml-[11px] border-l border-neutral-950/[0.08] dark:border-neutral-50/[0.08]">
            <AnimatePresence initial={false} mode="popLayout">
              {results.map(row)}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </nav>
  );
}
