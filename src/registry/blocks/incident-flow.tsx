"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, GitMerge, RotateCcw, X } from "lucide-react";
import { RollingNumber } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

/*
 * Agent Run's own look: a dark, ruled, technical band. Hairlines instead of
 * shadows, square corners, one lime accent, small uppercase labels, and
 * outlined square buttons that carry their keyboard shortcut.
 */

const steps = [
  { name: "Reproduce", body: "Writes a test that fails the way the customer said it would." },
  { name: "Trace", body: "Cart and refunds fail too. It's the rounding, not the coupon." },
  { name: "Fix", body: "Rewrites one line and asks the code owner to review." },
  { name: "Merge", body: "Every suite passes. Approved, merged, changelog written." },
];

type Mark = "wait" | "fail" | "pass";

/** The three tests the story is about, and their result at each step. */
const tests: { name: string; ms: string; at: Mark[] }[] = [
  { name: "tax › rounds after the discount", ms: "41ms", at: ["fail", "fail", "pass", "pass"] },
  { name: "cart › total with a coupon", ms: "63ms", at: ["wait", "fail", "pass", "pass"] },
  { name: "refund › partial refund", ms: "38ms", at: ["wait", "fail", "pass", "pass"] },
];

/** Seconds since the issue was filed, at each step. */
const elapsed = [0, 74, 252, 371];
const status = ["Reproduced", "3 failing", "In review", "Merged"];

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const STEP_MS = 3000;

function RollWord({ value }: { value: string }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "90%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-90%", opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A test's mark in one fixed slot; the new mark scales in over the old. */
function Status({ mark }: { mark: Mark }) {
  return (
    <span className="relative grid size-4 shrink-0 place-items-center">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={mark}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className={cn("grid size-4 place-items-center [&_svg]:size-3.5 [&_svg]:stroke-[2.5]", mark === "pass" ? "text-lime-400" : mark === "fail" ? "text-rose-400" : "text-neutral-600")}
        >
          {mark === "pass" ? <Check /> : mark === "fail" ? <X /> : <span className="size-1.5 bg-neutral-600" />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A square, outlined key-cap button, with its shortcut printed inside. */
function KeyButton({ children, hotkey, onPress, disabled }: { children: React.ReactNode; hotkey: string; onPress: () => void; disabled?: boolean }) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== hotkey.toLowerCase() || e.metaKey || e.ctrlKey || disabled) return;
      if ((e.target as HTMLElement)?.closest("input,textarea,[contenteditable]")) return;
      onPress();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [hotkey, onPress, disabled]);
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2.5 border border-white/15 pr-1.5 pl-3 text-[13px] font-medium text-neutral-100 transition-colors outline-none hover:border-lime-400/60 hover:text-white focus-visible:border-lime-400 disabled:opacity-40 [&_svg]:size-3.5"
    >
      {children}
      <kbd className="grid h-6 min-w-6 place-items-center border border-white/15 px-1 font-sans text-[11px] text-neutral-400">{hotkey}</kbd>
    </button>
  );
}

/**
 * How it works, told as one coding agent's run, on a dark technical band. The
 * four steps run along a ruled track and advance on their own once the block
 * scrolls into view; the run panel below changes in place: a test reproduces
 * the bug, two more fail with it, the fix lands as a one-line diff with a
 * review request, then everything passes and it merges. Click a step to jump,
 * or press R to replay.
 */
export function IncidentFlow({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [manual, setManual] = useState(false);
  const last = steps.length - 1;

  // Reduced motion shows the finished run instead of playing it.
  const step = reduce && !manual ? last : current;
  const playing = inView && !reduce && !manual && current < last;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setCurrent((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, current]);

  const go = (i: number) => {
    setManual(true);
    setCurrent(i);
  };
  const replay = () => {
    setManual(false);
    setCurrent(0);
  };

  const merged = step === last;
  const fixed = step >= 2;

  return (
    <section data-slot="incident-flow" className={cn("overflow-hidden bg-neutral-950 px-6 pt-24 text-neutral-100 sm:pt-28", className)}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] text-lime-400 uppercase">
          How it works
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-neutral-500">Agent · acme/checkout</span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <h2 className="max-w-3xl text-[40px] leading-[1.04] font-medium tracking-[-0.035em] text-balance text-white sm:text-[56px]">Bug report in. Merged fix out. Six minutes between.</h2>
          <KeyButton hotkey="R" onPress={replay} disabled={playing}>
            <RotateCcw /> Replay
          </KeyButton>
        </div>

        {/* The track: four steps along one rule that fills as the run moves */}
        <ol className="relative mt-14 grid grid-cols-2 gap-y-8 border-t border-white/10 md:grid-cols-4">
          <motion.span
            aria-hidden
            initial={false}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: reduce ? 0 : STEP_MS / 1000, ease: "linear" }}
            className="absolute -top-px left-0 hidden h-px bg-lime-400 md:block"
          />
          {steps.map((s, i) => {
            const on = i === step;
            const done = i < step;
            return (
              <li key={s.name}>
                <button type="button" onClick={() => go(i)} aria-current={on ? "step" : undefined} className="group block w-full pt-5 pr-6 text-left outline-none">
                  <span className={cn("text-[12px] tabular-nums transition-colors", on ? "text-lime-400" : done ? "text-neutral-400" : "text-neutral-600")}>0{i + 1}</span>
                  <span className={cn("mt-2 block text-[17px] font-medium transition-colors", on ? "text-white" : "text-neutral-500 group-hover:text-neutral-300")}>{s.name}</span>
                  <span className={cn("mt-1.5 block max-w-[15rem] text-[14px] leading-[1.5] text-pretty transition-colors", on ? "text-neutral-300" : "text-neutral-600")}>{s.body}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* The run panel: ruled, square, no shadow; it runs off the band's foot */}
        <div aria-hidden className="mt-16 h-[360px] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] sm:h-[340px]">
          <div className="h-full border border-b-0 border-white/10 bg-white/[0.02]">
            <div className="flex h-11 items-center justify-between gap-4 border-b border-white/10 px-4 text-[12px]">
              <span className="truncate text-neutral-400">
                <span className="text-neutral-200">Tax rounds wrong on discounted carts</span> · #482
              </span>
              <span className="flex shrink-0 items-center gap-4">
                <span className={cn("flex items-center gap-2 font-medium transition-colors duration-300", merged ? "text-lime-400" : fixed ? "text-neutral-200" : "text-rose-400")}>
                  <span className="size-1.5 bg-current" />
                  <RollWord value={status[step]} />
                </span>
                <span className="text-neutral-200 tabular-nums">
                  <RollingNumber value={clock(elapsed[step])} />
                </span>
              </span>
            </div>

            <div className="grid h-[calc(100%-2.75rem)] md:grid-cols-[1.1fr_1fr]">
              {/* Tests */}
              <div className="border-white/10 md:border-r">
                <div className="px-4 pt-4 pb-2 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">Tests</div>
                {tests.map((t) => {
                  const mark = t.at[step];
                  return (
                    <div key={t.name} className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                      <Status mark={mark} />
                      <span className={cn("min-w-0 flex-1 truncate text-[13px] transition-colors duration-300", mark === "wait" ? "text-neutral-600" : "text-neutral-200")}>{t.name}</span>
                      <span className={cn("text-[12px] text-neutral-500 tabular-nums transition-opacity", mark === "wait" && "opacity-0")}>{t.ms}</span>
                    </div>
                  );
                })}
                {[132, 96, 150].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                    <span className="size-1.5 bg-white/15" />
                    <span style={{ width: w }} className="h-[6px] bg-white/[0.07]" />
                  </div>
                ))}
              </div>

              {/* The fix and the review */}
              <div className="hidden md:block">
                <div className="px-4 pt-4 pb-2 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">Diff · cart/total.ts</div>
                <motion.div initial={false} animate={{ opacity: fixed ? 1 : 0.25 }} transition={{ duration: 0.5 }} className="mx-4 border border-white/10 font-mono text-[12px] leading-[1.7]">
                  <div className="bg-rose-400/10 px-3 py-1 text-neutral-400">
                    <span className="mr-3 text-rose-400">−</span>const total = round(price) - discount
                  </div>
                  <motion.div initial={false} animate={{ backgroundColor: fixed ? "rgb(163 230 53 / 0.1)" : "rgb(163 230 53 / 0)" }} className="px-3 py-1 text-neutral-100">
                    <span className="mr-3 text-lime-400">+</span>
                    {fixed ? "const total = round(price - discount)" : "…"}
                  </motion.div>
                </motion.div>

                <div className="mx-4 mt-4 flex h-12 items-center gap-3 border border-white/10 px-3">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {fixed ? (
                      <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }} className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="grid size-7 shrink-0 place-items-center bg-neutral-100 text-[11px] font-semibold text-neutral-950">MC</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-200">
                          Maria Chen · <span className="text-neutral-400"><RollWord value={merged ? "approved, merged" : "review requested"} /></span>
                        </span>
                        <GitMerge className={cn("size-4 shrink-0 transition-colors", merged ? "text-lime-400" : "text-neutral-500")} />
                      </motion.div>
                    ) : (
                      <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-neutral-600">
                        No reviewer yet
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <IncidentFlow />;
}
