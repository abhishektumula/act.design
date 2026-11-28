"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlockCard } from "./block-card";
import { blockCategories, blocks, type BlockCategory } from "@/registry/meta";
import { cn } from "@/lib/utils";

const id = (c: string) => `blocks-${c.toLowerCase().replace(/\s+/g, "-")}`;

/** Categories that have at least one block, in catalogue order. */
const shelves = blockCategories.map((c) => ({ category: c, items: blocks.filter((b) => b.category === c) })).filter((s) => s.items.length > 0);

/** One category: a heading with arrows over a row of cards that scrolls sideways and snaps. */
function Shelf({ category, items }: { category: BlockCategory; items: typeof blocks }) {
  const row = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ start: true, end: items.length <= 2 });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => setEnds({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const page = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section id={id(category)} aria-labelledby={`${id(category)}-title`} className="scroll-mt-36">
      <div className="flex items-end justify-between gap-4">
        <h2 id={`${id(category)}-title`} className="flex items-baseline gap-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
          {category}
          <span className="text-sm font-normal tracking-normal text-neutral-500 tabular-nums">{items.length}</span>
        </h2>
        <div className={cn("flex gap-1.5", ends.start && ends.end && "invisible")}>
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => page(dir)}
              disabled={dir === -1 ? ends.start : ends.end}
              aria-label={dir === -1 ? `Previous ${category} blocks` : `More ${category} blocks`}
              className="grid size-9 place-items-center rounded-full text-neutral-700 ring-1 ring-neutral-950/10 transition-[background-color,opacity] hover:bg-neutral-950/[0.04] disabled:opacity-35 dark:text-neutral-300 dark:ring-neutral-50/10 dark:hover:bg-neutral-50/[0.06] [&_svg]:size-4"
            >
              {dir === -1 ? <ArrowLeft /> : <ArrowRight />}
            </button>
          ))}
        </div>
      </div>
      {/* Bleeds past the page gutter so cards scroll in from the edge, but snaps back to it */}
      <div ref={row} className="-mx-6 mt-5 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((b) => (
          <BlockCard key={b.slug} block={b} className="w-[min(560px,84vw)] shrink-0 snap-start" />
        ))}
      </div>
    </section>
  );
}

/**
 * The blocks catalogue as shelves: a sticky bar of categories that scrolls
 * sideways, and under it one row per category that scrolls sideways too. The
 * bar follows along, lighting the category in view; click one to jump to it.
 */
export function BlockShelves() {
  const [active, setActive] = useState<string>(shelves[0]?.category ?? "");
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : Infinity);
        // The topmost category still on screen wins.
        const best = [...seen.entries()].filter(([, top]) => top !== Infinity).sort((a, b) => a[1] - b[1])[0];
        const found = best && shelves.find((s) => id(s.category) === best[0]);
        if (found) setActive(found.category);
      },
      { rootMargin: "-140px 0px -45% 0px" },
    );
    for (const s of shelves) {
      const el = document.getElementById(id(s.category));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  // Keep the lit chip on screen inside the bar.
  useEffect(() => {
    const chip = bar.current?.querySelector<HTMLElement>(`[data-category="${active}"]`);
    if (!chip || !bar.current) return;
    const b = bar.current;
    const left = chip.offsetLeft - b.clientWidth / 2 + chip.clientWidth / 2;
    b.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <nav aria-label="Block categories" className="sticky top-16 z-30 -mx-6 mt-12 border-b border-neutral-950/[0.06] bg-white/80 backdrop-blur-xl dark:border-neutral-50/[0.06] dark:bg-black/80">
        <div ref={bar} className="flex gap-1.5 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shelves.map((s) => (
            <a
              key={s.category}
              href={`#${id(s.category)}`}
              data-category={s.category}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id(s.category))?.scrollIntoView({ behavior: "smooth" });
                setActive(s.category);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active === s.category ? "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950" : "text-neutral-600 hover:bg-neutral-950/[0.05] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-50/[0.07] dark:hover:text-neutral-50",
              )}
            >
              {s.category}
              <span className={cn("text-xs tabular-nums", active === s.category ? "opacity-60" : "text-neutral-400 dark:text-neutral-600")}>{s.items.length}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-10 space-y-16">
        {shelves.map((s) => (
          <Shelf key={s.category} category={s.category} items={s.items} />
        ))}
      </div>
    </>
  );
}
