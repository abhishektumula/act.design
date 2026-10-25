"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanStep = { title: string; detail?: string };
type Status = "pending" | "active" | "done";

function StatusIcon({ status }: { status: Status }) {
  return (
    <span className="relative grid size-5 shrink-0 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "pending" && (
          <motion.span
            key="pending"
            exit={{ scale: 0.5, opacity: 0 }}
            className="size-4 rounded-full border border-dashed border-base-600"
          />
        )}
        {status === "active" && (
          <motion.span
            key="active"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ rotate: { duration: 0.9, repeat: Infinity, ease: "linear" } }}
            className="size-4 rounded-full border-2 border-blue-500/25 border-t-blue-400"
          />
        )}
        {status === "done" && (
          <motion.span
            key="done"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="grid size-4 place-items-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 inset-shadow-2xs inset-shadow-white/30"
          >
            <svg viewBox="0 0 12 12" className="size-2.5 text-neutral-950">
              <motion.path
                d="M2.5 6.2 5 8.5l4.5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function AgentPlan({
  steps,
  current,
  title = "Plan",
  className,
}: {
  steps: PlanStep[];
  current: number;
  title?: string;
  className?: string;
}) {
  const done = Math.min(current, steps.length);

  return (
    <div data-slot="agent-plan" className={cn("w-full rounded-2xl bg-base-900 p-1 shadow-xl shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5", className)}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
        <span className="text-sm font-medium text-base-100">{title}</span>
        <span className="font-mono text-xs text-base-500 tabular-nums">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mx-4 mb-2 h-0.5 overflow-hidden rounded-full bg-base-800">
        <motion.div
          className="h-full rounded-full bg-base-200"
          animate={{ width: `${(done / steps.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <ul className="rounded-xl bg-base-950/60 p-2 ring-1 ring-base-50/5">
        {steps.map((step, i) => {
          const status: Status = i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li key={step.title} className="flex gap-3 rounded-lg px-2 py-2">
              <StatusIcon status={status} />
              <div className="min-w-0">
                <p
                  className={`text-[13px] leading-5 transition-colors duration-300 ${
                    status === "done" ? "text-base-500" : status === "active" ? "text-base-50" : "text-base-400"
                  }`}
                >
                  {step.title}
                </p>
                <AnimatePresence initial={false}>
                  {status === "active" && step.detail && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden font-mono text-xs text-base-500"
                    >
                      <span className="block pt-1">{step.detail}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const steps: PlanStep[] = [
  { title: "Read the existing settings page", detail: "src/app/settings/page.tsx" },
  { title: "Add a theme preference to the store", detail: "src/lib/store.ts +12 −2" },
  { title: "Build the appearance switch", detail: "src/components/theme-switch.tsx" },
  { title: "Persist the choice in a cookie", detail: "src/middleware.ts" },
  { title: "Run type check and tests", detail: "bun run check · 48 passed" },
];

export default function Demo() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current > steps.length) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), current === 0 ? 900 : 1500);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <AgentPlan steps={steps} current={current} />
      <button
        onClick={() => setCurrent(0)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-100"
      >
        <RotateCcw className="size-3" /> Replay
      </button>
    </div>
  );
}
