"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Deterministic pseudo-random, so server and client render the same bars. */
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function Meter() {
  return (
    <div className="flex h-12 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 22 }, (_, i) => (
        <motion.span
          key={i}
          className="w-1.5 origin-bottom rounded-[2px] bg-linear-to-t from-base-50 via-base-50 to-signal"
          style={{ height: "100%" }}
          initial={{ scaleY: 0.2 }}
          animate={{ scaleY: [0.15 + rand(i) * 0.3, 0.45 + rand(i + 7) * 0.55, 0.2 + rand(i + 3) * 0.4, 0.6 + rand(i + 11) * 0.4, 0.15 + rand(i) * 0.3] }}
          transition={{ duration: 1.6 + rand(i + 5) * 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Regions() {
  const codes = ["IAD", "SFO", "GRU", "LHR", "FRA", "CDG", "ARN", "BOM", "SIN", "HND", "SYD", "JNB"];
  return (
    <div className="grid grid-cols-6 gap-1.5" aria-hidden>
      {codes.map((c, i) => (
        <motion.span
          key={c}
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          className="rounded-md bg-base-50/[0.06] px-1.5 py-1 text-center font-mono text-[9px] tracking-wider text-base-300 ring-1 ring-base-50/5"
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

function Log() {
  const lines = [
    "12:04:11  ana@  rotated key  prod",
    "12:04:19  bot   deploy  #482  ok",
    "12:05:02  li@   invited  2 seats",
    "12:05:40  bot   cache purge  /docs",
    "12:06:13  sam@  role → editor",
    "12:06:58  bot   backup  14.2 GB",
  ];
  return (
    <div className="h-12 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" aria-hidden>
      <motion.div animate={{ y: ["0%", "-50%"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
        {[...lines, ...lines].map((l, i) => (
          <p key={i} className="font-mono text-[10px] leading-4 whitespace-pre text-base-400">
            {l}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

function Roles() {
  const roles = ["Admin", "Editor", "Viewer"];
  return (
    <div className="flex flex-wrap gap-4">
      {roles.map((r, i) => (
        <label key={r} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-300">
          <Switch size="sm" defaultChecked={i < 2} aria-label={`${r} access`} />
          {r}
        </label>
      ))}
    </div>
  );
}

function Limits() {
  const [rps, setRps] = useState(120);
  return <Stepper label="Requests per second" min={10} max={500} step={10} value={rps} onValueChange={setRps} format={(v) => `${v}/s`} />;
}

const modules: { name: string; body: string; status: string; visual: ReactNode }[] = [
  { name: "Realtime sync", body: "Every client sees the same state within 40 ms, on any connection.", status: "Streaming", visual: <Meter /> },
  { name: "Edge cache", body: "Twelve regions serve your reads from wherever the user happens to be.", status: "12 / 12 up", visual: <Regions /> },
  { name: "Audit log", body: "Every change, by every person and bot, kept for a year and searchable.", status: "Recording", visual: <Log /> },
  { name: "Access control", body: "Roles you can flip per project. Changes apply on the next request.", status: "Enforced", visual: <Roles /> },
  { name: "Rate limits", body: "Protect the API from your own cron jobs. Set it here, not in YAML.", status: "Armed", visual: <Limits /> },
];

function Screw() {
  return (
    <span className="relative size-2.5 shrink-0 rounded-full bg-linear-to-b from-base-800 to-base-700 ring-1 ring-black/10 dark:from-base-700 dark:to-base-800" aria-hidden>
      <span className="absolute inset-x-[2px] top-1/2 h-px -translate-y-1/2 rotate-[30deg] bg-black/25" />
    </span>
  );
}

/**
 * Features as rack-mounted modules. Each one is a 1U panel with its own LED,
 * status and a live readout instead of a stock icon.
 */
export function FeatureRack({ className }: { className?: string }) {
  return (
    <section data-slot="feature-rack" className={cn("bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
              Everything&apos;s on the <span className="font-serif font-normal tracking-[-0.02em] italic">front panel.</span>
            </h2>
          </div>
          <p className="max-w-xs text-base leading-7 text-base-400">No settings buried four menus deep. If it matters, it has a light and a switch.</p>
        </div>

        <div className="mt-14 rounded-[28px] bg-base-50/[0.04] p-2 shadow-[inset_0_2px_6px_rgb(0_0_0/0.08)] ring-1 ring-base-50/[0.06]">
          <div className="space-y-2">
            {modules.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.06 }}
                className="group relative grid items-center gap-6 rounded-[20px] bg-base-950 px-7 py-5 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.06),0_8px_16px_-12px_var(--color-shade)] ring-1 ring-base-50/[0.08] transition-shadow duration-300 hover:ring-base-50/15 sm:grid-cols-[1fr_15rem_7.5rem] sm:px-10 dark:shadow-[0_1px_0_rgb(255_255_255/0.05)_inset]"
              >
                {["top-3 left-3", "bottom-3 left-3", "top-3 right-3", "bottom-3 right-3"].map((p) => (
                  <span key={p} className={cn("absolute hidden sm:block", p)}>
                    <Screw />
                  </span>
                ))}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[17px] font-medium tracking-tight text-base-50">{m.name}</h3>
                  </div>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-base-500">{m.body}</p>
                </div>
                <div className="flex min-h-12 items-center sm:justify-end">{m.visual}</div>
                <span className="flex items-center gap-2 text-xs text-base-400 sm:justify-end">
                  <span className="size-2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
                  {m.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <FeatureRack />;
}
