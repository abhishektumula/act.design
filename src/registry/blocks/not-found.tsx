"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen, Briefcase, CornerDownLeft, LifeBuoy, Link2, ListChecks, LoaderCircle, Newspaper, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Not Found's own look: centred and airy. A giant hairline-weight 404 is the
 * object, a frosted search palette floats over its foot with a warm orange glow
 * instead of a drop shadow, and the ways out are plain text links.
 */

/** Every part of the site the 404 looks through. */
const PLACES = [
  { name: "Docs", icon: BookOpen },
  { name: "Blog", icon: Newspaper },
  { name: "Changelog", icon: ListChecks },
  { name: "Help center", icon: LifeBuoy },
  { name: "Careers", icon: Briefcase },
  { name: "Old links", icon: Link2 },
];

/** How long each place takes to answer, in ms of animation. */
const STEP = 300;

/**
 * A 404 that goes looking for you. A frosted search palette over a giant 404
 * searches every part of the site for the missing address, one place after
 * another; each comes back empty, and then the closest page that does exist
 * rises to the top, ready to open with Enter.
 */
export function NotFound({
  path = "/pricing/teams",
  suggestion = { path: "/pricing", label: "Pricing", match: 94 },
  className,
}: {
  path?: string;
  suggestion?: { path: string; label: string; match: number };
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const t = setTimeout(() => setDone(PLACES.length), 0);
      return () => clearTimeout(t);
    }
    const timers = PLACES.map((_, i) => setTimeout(() => setDone(i + 1), 500 + i * STEP));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  const all = done === PLACES.length;

  return (
    <section data-slot="not-found" className={cn("relative overflow-hidden bg-white px-6 py-20 sm:py-28 dark:bg-black", className)}>
      <div ref={ref} className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* The object: 404 at hairline weight, cut by the palette */}
        <div aria-hidden className="relative -mb-[0.24em] text-[150px] leading-[0.8] font-extralight tracking-[-0.06em] text-neutral-950/90 select-none sm:text-[240px] dark:text-neutral-50/90">
          404
        </div>

        {/* The palette, frosted, with a warm glow under it */}
        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[22px] bg-white/70 text-left shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_40px_120px_-30px_color-mix(in_oklab,var(--color-orange-500)_45%,transparent),0_2px_6px_rgb(0_0_0/0.04)] backdrop-blur-2xl dark:bg-neutral-900/70 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_40px_120px_-30px_color-mix(in_oklab,var(--color-orange-500)_40%,transparent)]">
          <div className="flex h-14 items-center gap-3 border-b border-neutral-950/[0.06] px-5 dark:border-neutral-50/[0.08]">
            <Search className="size-4 shrink-0 text-neutral-400" />
            <span className="min-w-0 flex-1 truncate text-[15px] text-neutral-950 dark:text-neutral-50">{path}</span>
            <span className="shrink-0 text-[12px] text-neutral-500 tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={all ? "done" : "busy"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-block">
                  {all ? "No page here" : `Searching ${done}/${PLACES.length}`}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          {/* The closest match rises in above the list once every place has answered */}
          <motion.div initial={false} animate={{ height: all ? "auto" : 0, opacity: all ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.55, ease: [0.25, 0.8, 0.25, 1] }} className="overflow-hidden">
            <div className="px-2 pt-2">
              <div className="px-3 pt-1 pb-1.5 text-[12px] text-neutral-500">Closest match</div>
              <a href={suggestion.path} className="group flex items-center gap-3 rounded-[12px] bg-orange-500/[0.09] px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:bg-orange-400/[0.12]">
                <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-orange-500 text-white">
                  <ArrowRight className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-neutral-950 dark:text-neutral-50">{suggestion.label}</span>
                  <span className="block truncate text-[12px] text-neutral-500">
                    {suggestion.path} · {suggestion.match}% alike
                  </span>
                </span>
                <kbd className="grid size-7 shrink-0 place-items-center rounded-[7px] bg-white text-neutral-500 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_0_rgb(0_0_0/0.08)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
                  <CornerDownLeft className="size-3.5" />
                </kbd>
              </a>
            </div>
          </motion.div>

          <div className="px-2 pt-2 pb-2">
            <div className="px-3 pt-1 pb-1.5 text-[12px] text-neutral-500">Searched</div>
            <ul className="grid grid-cols-2 gap-x-2 sm:grid-cols-3">
              {PLACES.map((p, i) => {
                const answered = i < done;
                const Icon = p.icon;
                return (
                  <li key={p.name} className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px]">
                    <Icon className={cn("size-4 shrink-0 transition-colors", answered ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-700 dark:text-neutral-300")} />
                    <span className={cn("min-w-0 flex-1 truncate transition-colors", answered ? "text-neutral-400 line-through decoration-neutral-300 dark:text-neutral-500 dark:decoration-neutral-700" : "text-neutral-800 dark:text-neutral-200")}>{p.name}</span>
                    <span className="grid size-4 shrink-0 place-items-center">
                      {!answered && i === done && <LoaderCircle className="size-3.5 animate-spin text-orange-500" />}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <h1 className="mt-14 text-[22px] font-medium tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">This page wandered off.</h1>
        <p className="mt-2 max-w-sm text-[15px] leading-6 text-pretty text-neutral-500">We looked through the whole site and nothing lives at this address any more.</p>
        <div className="mt-7 flex items-center gap-7 text-[15px] font-medium">
          <a href={suggestion.path} className="group inline-flex items-center gap-1.5 text-orange-600 underline decoration-orange-600/30 underline-offset-[5px] transition-colors hover:decoration-orange-600 dark:text-orange-400 dark:decoration-orange-400/30">
            Go to {suggestion.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link href="/" className="text-neutral-700 underline decoration-neutral-300 underline-offset-[5px] transition-colors hover:decoration-neutral-700 dark:text-neutral-300 dark:decoration-neutral-700">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <NotFound />;
}
