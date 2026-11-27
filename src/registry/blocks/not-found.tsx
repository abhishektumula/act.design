"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, CornerDownRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REGIONS = [
  { code: "IAD", city: "Virginia", ms: 41 },
  { code: "SFO", city: "San Francisco", ms: 63 },
  { code: "FRA", city: "Frankfurt", ms: 92 },
  { code: "LHR", city: "London", ms: 88 },
  { code: "SIN", city: "Singapore", ms: 187 },
  { code: "GRU", city: "São Paulo", ms: 141 },
];

/** How long each region takes to answer, in ms of animation. */
const STEP = 260;

/**
 * A 404 for a product that watches websites. Every region checks the missing
 * address, all of them reach the site quickly, and all get the same answer: the
 * site is fine, the page isn't there. Then it suggests where to go instead.
 */
export function NotFound({
  domain = "northwind.app",
  path = "/pricing/teams",
  suggestion = { path: "/pricing", label: "Pricing", ms: 94, from: "Frankfurt" },
  className,
}: {
  domain?: string;
  path?: string;
  suggestion?: { path: string; label: string; ms: number; from: string };
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // How many regions have answered. Every one answers at once with reduced motion.
  const [done, setDone] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const t = setTimeout(() => setDone(REGIONS.length), 0);
      return () => clearTimeout(t);
    }
    const timers = REGIONS.map((_, i) => setTimeout(() => setDone(i + 1), 450 + i * STEP));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, run]);

  const again = () => {
    setDone(0);
    setRun((r) => r + 1);
  };

  const all = done === REGIONS.length;

  return (
    <section data-slot="not-found" className={cn("relative overflow-hidden bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <p className="truncate font-mono text-[13px] text-neutral-500">
            404 <span className="text-neutral-300 dark:text-neutral-700">·</span> {domain}
            {path}
          </p>
          <h1 className="mt-5 text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 sm:text-6xl dark:text-neutral-50">
            Not down. <span className="font-serif font-normal tracking-[-0.01em] italic">Just not here.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
            {REGIONS.length} regions reached the site in under 200 ms and all got the same answer: there&apos;s no page at this address. It may have moved.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button tone="signal" size="lg">
              Go to {suggestion.label}
            </Button>
            <Button size="lg">
              Back home <ArrowRight />
            </Button>
          </div>
        </div>

        {/* The checks: a window that runs off the right edge on wide screens */}
        <div ref={ref} className="relative pb-10">
          <div className="overflow-hidden rounded-[14px] bg-neutral-50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent),0_30px_60px_-30px_color-mix(in_oklab,var(--color-neutral-600)_55%,transparent)] lg:w-[calc(100%+18rem)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent),0_30px_60px_-30px_color-mix(in_oklab,var(--color-black)_55%,transparent)]">
            <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.07] px-[14px] dark:border-neutral-50/[0.07]">
              {["var(--color-red-400)", "var(--color-amber-400)", "var(--color-green-500)"].map((c) => (
                <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-3 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">Checks</span>
            </div>

            <div className="max-w-[40rem] px-5 pt-5 pb-6 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("size-2 shrink-0 rounded-full transition-colors duration-300", all ? "bg-neutral-400 dark:bg-neutral-500" : "animate-pulse bg-blue-600 dark:bg-blue-500")} />
                  <span className="truncate font-mono text-[13px] text-neutral-950 dark:text-neutral-50">
                    {domain}
                    {path}
                  </span>
                </span>
                <span className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-800 tabular-nums dark:text-neutral-200">
                    {done} of {REGIONS.length}
                  </span>{" "}
                  {all ? "regions agree" : "regions checked"}
                </span>
              </div>

              <ul className="mt-5 divide-y divide-neutral-950/[0.06] border-y border-neutral-950/[0.06] dark:divide-neutral-50/[0.06] dark:border-neutral-50/[0.06]">
                {REGIONS.map((r, i) => {
                  const answered = i < done;
                  return (
                    <li key={r.code} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="w-9 font-mono text-xs text-neutral-500">{r.code}</span>
                      <span className="flex-1 truncate text-neutral-700 dark:text-neutral-300">{r.city}</span>
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-neutral-950/10 sm:w-24 dark:bg-neutral-50/10">
                        <motion.span
                          initial={false}
                          animate={{ width: answered ? `${(r.ms / 300) * 100}%` : "0%" }}
                          transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="block h-full rounded-full bg-neutral-950/50 dark:bg-neutral-50/50"
                        />
                      </span>
                      <span className="w-14 text-right text-neutral-500 tabular-nums">{answered ? `${r.ms} ms` : "—"}</span>
                      <span className="w-9 text-right font-mono text-xs font-medium">
                        <AnimatePresence initial={false}>
                          {answered && (
                            <motion.span
                              key={run}
                              initial={reduce ? false : { opacity: 0, y: 4, filter: "blur(3px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              transition={{ duration: 0.25 }}
                              className="inline-block text-blue-600 dark:text-blue-500"
                            >
                              404
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex h-8 items-center justify-end">
                <button
                  type="button"
                  onClick={again}
                  disabled={!all}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 outline-none transition-[color,opacity] hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-0 dark:hover:text-neutral-50 dark:focus-visible:ring-blue-500/50"
                >
                  <RotateCcw className="size-3.5" />
                  Check again
                </button>
              </div>
            </div>
          </div>

          {/* The way out, once every region has answered */}
          <div aria-live="polite" className="absolute bottom-0 left-4 w-[min(21rem,calc(100%-2rem))] sm:left-6 lg:-left-8">
            <AnimatePresence>
              {all && (
                <motion.a
                  key={run}
                  href={suggestion.path}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32, delay: reduce ? 0 : 0.15 }}
                  className="group flex items-center gap-3 rounded-[14px] bg-neutral-50 p-3 pr-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_10%,transparent),0_14px_32px_-10px_color-mix(in_oklab,var(--color-neutral-600)_55%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:bg-neutral-800 dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_10%,transparent),0_14px_32px_-10px_color-mix(in_oklab,var(--color-black)_55%,transparent)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                    <CornerDownRight className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-950 dark:text-neutral-50">Did you mean {suggestion.path}?</span>
                    <span className="block truncate text-xs text-neutral-500">
                      200 OK · {suggestion.ms} ms from {suggestion.from}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                </motion.a>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <NotFound />;
}
