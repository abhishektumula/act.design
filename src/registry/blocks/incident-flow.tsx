"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Phone, PhoneCall, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollingNumber } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const steps = [
  { name: "Detect", body: "Twelve regions check every 30 seconds. Frankfurt sees a 503 first." },
  { name: "Confirm", body: "London and Stockholm agree, so it's real. One bad route never pages anyone." },
  { name: "Call", body: "The on-call engineer's phone rings 31 seconds after the first failure." },
  { name: "Resolve", body: "Checks pass again, the status page clears and the timeline is ready for the postmortem." },
];

const regions = ["IAD", "SFO", "YYZ", "GRU", "LHR", "FRA", "ARN", "JNB", "BOM", "SIN", "HND", "SYD"];
/** Which regions are failing at each step. */
const failing = [["FRA"], ["FRA", "LHR", "ARN"], ["FRA", "LHR", "ARN"], []];
/** Seconds since the first failed check, at each step. */
const elapsed = [0, 30, 31, 1039];
const status = [
  { label: "Failing in 1 region", tone: "bg-amber-400" },
  { label: "Down", tone: "bg-blue-600 dark:bg-blue-500" },
  { label: "Down", tone: "bg-blue-600 dark:bg-blue-500" },
  { label: "Resolved", tone: "bg-emerald-500" },
];

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const STEP_MS = 2800;

/**
 * How it works, told as one incident. The steps on the left advance on their
 * own once the block scrolls into view, and the incident card on the right
 * changes in place: regions fail, the clock rolls, the phone rings, it
 * recovers. Click a step to jump to it.
 */
export function IncidentFlow({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  /** Set once someone picks a step by hand; Replay clears it. */
  const [manual, setManual] = useState(false);
  const last = steps.length - 1;

  // Reduced motion shows the finished incident instead of playing it.
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

  const down = failing[step];
  const resolved = step === 3;

  return (
    <section data-slot="incident-flow" className={cn("overflow-hidden bg-white dark:bg-black px-6 py-24 sm:py-32", className)}>
      <div ref={ref} className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* The steps */}
        <div>
          <h2 className="max-w-lg text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-6xl">
            From a failed check to a phone call in <span className="font-serif font-normal tracking-[-0.01em] italic">31 seconds.</span>
          </h2>
          <ol className="mt-12 max-w-md">
            {steps.map((s, i) => {
              const on = i === step;
              return (
                <li key={s.name}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? "step" : undefined}
                    className="group relative grid w-full grid-cols-[2rem_1fr] gap-3 py-3.5 text-left outline-none"
                  >
                    <span className={cn("pt-px text-sm tabular-nums transition-colors", on ? "text-blue-600 dark:text-blue-500" : "text-neutral-400 dark:text-neutral-600")}>0{i + 1}</span>
                    <span>
                      <span className={cn("block text-[17px] font-medium transition-colors", on ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300")}>
                        {s.name}
                      </span>
                      <motion.span
                        initial={false}
                        animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
                        className="block overflow-hidden"
                      >
                        <span className="block pt-1.5 text-[15px] leading-6 text-pretty text-neutral-600 dark:text-neutral-400">{s.body}</span>
                      </motion.span>
                    </span>
                    {/* Progress along the step while it plays */}
                    <span className="absolute bottom-0 left-0 h-px w-full bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08]">
                      {on && playing && (
                        <motion.span
                          key={step}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                          className="block h-full bg-blue-600 dark:bg-blue-500"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* One incident, changing in place */}
        <div className="overflow-hidden rounded-[16px] bg-neutral-50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent),0_30px_60px_-30px_color-mix(in_oklab,var(--color-neutral-600)_55%,transparent)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent),0_30px_60px_-30px_color-mix(in_oklab,var(--color-black)_55%,transparent)] lg:w-[calc(100%+14rem)] dark:bg-neutral-900">
          <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.07] dark:border-neutral-50/[0.07] px-[14px]">
            {["var(--color-red-400)", "var(--color-amber-400)", "var(--color-green-500)"].map((c) => (
              <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-3 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">Incidents</span>
          </div>

          <div className="max-w-[34rem] p-6 sm:p-7">
            {/* Status and clock */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-[13px] text-neutral-700 dark:text-neutral-300">checkout-api</p>
                <p className="mt-2 flex items-center gap-2.5 text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
                  <span className={cn("size-2.5 rounded-full transition-colors duration-500", status[step].tone)} />
                  {/* Words roll whole, never letter by letter */}
                  <span className="relative inline-grid overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={status[step].label}
                        initial={{ y: "80%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-80%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      >
                        {status[step].label}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Since first failure</p>
                <p className="mt-1 font-mono text-3xl font-medium tracking-[-0.02em] text-neutral-950 dark:text-neutral-50 tabular-nums">
                  <RollingNumber value={clock(elapsed[step])} />
                </p>
              </div>
            </div>

            {/* Regions */}
            <div className="mt-7 grid grid-cols-6 gap-1.5">
              {regions.map((r) => {
                const bad = down.includes(r);
                return (
                  <span
                    key={r}
                    className={cn(
                      "rounded-[6px] py-1.5 text-center font-mono text-[11px] transition-colors duration-500",
                      bad ? "bg-blue-600/12 dark:bg-blue-500/12 text-blue-600 dark:text-blue-500 ring-1 ring-blue-600/30 dark:ring-blue-500/30" : resolved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-neutral-950/[0.04] dark:bg-neutral-50/[0.04] text-neutral-500",
                    )}
                  >
                    {r}
                  </span>
                );
              })}
            </div>

            {/* The call */}
            <div className="mt-6 grid">
              <AnimatePresence initial={false} mode="popLayout">
                {step >= 2 ? (
                  <motion.div
                    key={resolved ? "answered" : "calling"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                    className="flex items-center gap-3 rounded-[12px] bg-white p-3 ring-1 ring-neutral-950/[0.07] dark:ring-neutral-50/[0.07] dark:bg-neutral-950"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-950 dark:bg-neutral-50 text-xs font-semibold text-neutral-50 dark:text-neutral-950">MC</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-neutral-950 dark:text-neutral-50">Maria Chen</span>
                      <span className="block text-xs text-neutral-500">{resolved ? "Answered in 38 s" : "On-call, phone ringing"}</span>
                    </span>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4",
                        resolved ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" : "bg-blue-600 dark:bg-blue-500 text-white",
                      )}
                    >
                      {resolved ? (
                        <Phone />
                      ) : (
                        <motion.span animate={{ rotate: [0, -14, 14, -10, 10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}>
                          <PhoneCall />
                        </motion.span>
                      )}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-[3.75rem] items-center rounded-[12px] px-3 text-sm text-neutral-500 ring-1 ring-neutral-950/[0.07] dark:ring-neutral-50/[0.07] ring-dashed"
                  >
                    {step === 0 ? "Waiting for a second region before paging anyone" : "Incident opened, finding who's on call"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-950/[0.07] dark:border-neutral-50/[0.07] pt-5">
              <p className="text-sm text-neutral-500">
                {resolved ? (
                  <>
                    <span className="text-neutral-900 dark:text-neutral-100">Recovered.</span> Timeline saved to the postmortem.
                  </>
                ) : (
                  "Status page updates automatically"
                )}
              </p>
              <Button size="sm" tone="ghost" onClick={replay} disabled={playing}>
                <RotateCcw /> Replay
              </Button>
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
