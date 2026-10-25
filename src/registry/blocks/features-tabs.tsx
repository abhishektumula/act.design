"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Image as ImageIcon, Lock, Search, Sparkles, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const DURATION = 6;

function SearchVisual() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex h-11 items-center gap-2.5 rounded-xl bg-base-900 px-3.5 text-sm text-base-200 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
        <Search className="size-4 text-base-500" /> quarterly churn by plan
      </div>
      {[
        { icon: FileText, t: "Q3 retention review.pdf", m: "Matched “churn” · p. 4" },
        { icon: ImageIcon, t: "Plan breakdown.png", m: "Text found in image" },
        { icon: FileText, t: "Board update — Sept", m: "Matched “by plan”" },
      ].map(({ icon: Icon, t, m }, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08 }}
          className="flex items-center gap-3 rounded-xl bg-base-950 p-3 ring-1 ring-base-50/5"
        >
          <Icon className="size-4 text-base-500" />
          <div className="min-w-0">
            <p className="truncate text-sm text-base-200">{t}</p>
            <p className="text-xs text-base-500">{m}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FlowVisual() {
  const steps = ["Form submitted", "Enrich with Clearbit", "Score lead", "Notify #sales"];
  return (
    <div className="flex w-full max-w-xs flex-col items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex w-full flex-col items-center">
          {i > 0 && (
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.25 }}
              className="h-6 w-px origin-top bg-base-700"
            />
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.25 + 0.1, type: "spring", bounce: 0.3 }}
            className="flex w-full items-center gap-3 rounded-xl bg-base-900 px-3.5 py-2.5 text-sm text-base-200 shadow-md shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
          >
            <span className="grid size-6 place-items-center rounded-md bg-base-800 text-[11px] text-base-400 tabular-nums">{i + 1}</span>
            {s}
            <Check className="ml-auto size-3.5 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="relative grid place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-24 rounded-full ring-1 ring-emerald-500/40"
          animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i, ease: "easeOut" }}
        />
      ))}
      <span className="relative grid size-20 place-items-center rounded-3xl bg-linear-to-b from-emerald-400 to-emerald-600 text-neutral-950 shadow-xl shadow-emerald-600/30 inset-shadow-2xs inset-shadow-white/50">
        <Lock className="size-8" />
      </span>
      <p className="relative mt-10 font-mono text-xs text-base-500">AES-256 · zero retention · EU hosted</p>
    </div>
  );
}

const features = [
  {
    icon: Search,
    title: "Search that reads everything",
    body: "PDFs, screenshots, docs and threads. Ask in plain words and jump straight to the paragraph.",
    visual: SearchVisual,
  },
  {
    icon: Workflow,
    title: "Automations without the glue code",
    body: "Chain triggers and actions visually. Every run is logged, replayable and versioned.",
    visual: FlowVisual,
  },
  {
    icon: Sparkles,
    title: "Private by architecture",
    body: "Your data never trains a model. Encryption at rest and in transit, with EU-only hosting.",
    visual: PrivacyVisual,
  },
];

export function FeaturesTabs({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance; the progress bar is the timer, so we listen for its end.
  const Visual = features[active].visual;

  return (
    <section data-slot="features-tabs" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">
            Built for the way teams actually work.
          </h2>
          <div className="mt-10 space-y-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {features.map((f, i) => {
              const Icon = f.icon;
              const on = i === active;
              return (
                <button
                  key={f.title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative w-full overflow-hidden rounded-2xl p-5 text-left transition-colors",
                    on ? "bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5" : "hover:bg-base-950/60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("size-4 transition-colors", on ? "text-blue-600 dark:text-blue-400" : "text-base-500")} />
                    <span className={cn("font-medium transition-colors", on ? "text-base-50" : "text-base-400")}>{f.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="overflow-hidden pl-7 text-sm leading-relaxed text-base-500"
                      >
                        <span className="block pt-2">{f.body}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {on && (
                    <ProgressLine key={active} paused={paused} onDone={() => setActive((a) => (a + 1) % features.length)} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative grid h-[26rem] place-items-center overflow-hidden rounded-3xl bg-base-950 p-8 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-base-800)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.3 }}
              className="relative flex w-full justify-center"
            >
              <Visual />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ProgressLine({ paused, onDone }: { paused: boolean; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (paused) return;
    if (elapsed >= DURATION) {
      onDone();
      return;
    }
    const t = setTimeout(() => setElapsed((e) => e + 0.1), 100);
    return () => clearTimeout(t);
  }, [elapsed, paused, onDone]);

  return (
    <span className="absolute inset-x-5 bottom-0 h-px bg-base-50/5">
      <span
        className="block h-full bg-blue-500 transition-[width] duration-100 ease-linear"
        style={{ width: `${Math.min(elapsed / DURATION, 1) * 100}%` }}
      />
    </span>
  );
}

export default function Block() {
  return <FeaturesTabs />;
}
