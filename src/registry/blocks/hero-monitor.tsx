"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fader } from "@/components/ui/fader";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** The last hour of 30-second checks: steady around 180 ms, one slow spell at 14:19 and a short outage at 14:41. */
const checks = Array.from({ length: 120 }, (_, i) => {
  const noise = Math.sin(i * 1.7) * 18 + Math.sin(i * 0.37) * 22 + Math.cos(i * 3.1) * 9;
  const slow = i >= 38 && i <= 43 ? 260 + Math.sin(i) * 40 : 0;
  const outage = i >= 82 && i <= 87 ? 820 - Math.abs(i - 84.5) * 40 : 0;
  const blip = i === 64 ? 390 : i === 101 ? 340 : 0;
  return Math.round(176 + noise + slow + outage + blip);
});

const CHART_MAX = 1000;

/** Runs of `confirm` or more consecutive checks over the threshold, each one a page. */
function incidents(threshold: number, confirm: number) {
  const out: { start: number; end: number }[] = [];
  let run = 0;
  checks.forEach((ms, i) => {
    run = ms > threshold ? run + 1 : 0;
    if (run === confirm) out.push({ start: i - confirm + 1, end: i });
    else if (run > confirm) out[out.length - 1].end = i;
  });
  return out;
}

/**
 * A monitoring hero whose visual is the product: a real endpoint's last hour of
 * checks. Move the alert threshold or the confirmations and it shows how many
 * times you would have been paged.
 */
export function HeroMonitor({ className }: { className?: string }) {
  const [threshold, setThreshold] = useState(400);
  const [confirm, setConfirm] = useState(2);
  const [call, setCall] = useState(true);
  const pages = incidents(threshold, confirm);
  const p50 = [...checks].sort((a, b) => a - b)[60];
  const thresholdY = 100 - (threshold / CHART_MAX) * 100;

  return (
    <section data-slot="hero-monitor" className={cn("relative overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-base-50 sm:text-6xl">
            Know it&apos;s down <span className="font-serif font-normal tracking-[-0.01em] italic">before your customers do.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-base-400">
            Beacon checks your site and APIs from 12 regions every 30 seconds, and calls the right person the moment something breaks.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button tone="signal" size="lg">
              Start monitoring free
            </Button>
            <Button size="lg">
              See a live status page <ArrowRight />
            </Button>
          </div>
          <p className="mt-6 text-sm text-base-500">Free for 10 monitors. No card needed.</p>
        </div>

        {/* The monitor */}
        <div className="rounded-[28px] bg-base-950 p-2 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_30px_60px_-40px_var(--color-shade)] ring-1 ring-base-50/10 dark:bg-base-900">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--color-emerald-500)]" />
              <span className="font-mono text-sm text-base-100">api.northwind.app/health</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-base-500">
              <span>
                <span className="font-medium text-base-200 tabular-nums">99.94%</span> last 30 days
              </span>
              <span>
                <span className="font-medium text-base-200 tabular-nums">{p50} ms</span> median
              </span>
            </div>
          </div>

          {/* Last hour of checks */}
          <div className="rounded-[20px] bg-base-50/[0.03] px-4 pt-4 pb-3 ring-1 ring-base-50/[0.06]">
            <div className="relative h-40">
              <div className="absolute inset-0 flex items-end gap-[2px]">
                {checks.map((ms, i) => {
                  const paged = pages.some((p) => i >= p.start && i <= p.end);
                  return (
                    <span
                      key={i}
                      style={{ height: `${Math.min(100, (ms / CHART_MAX) * 100)}%` }}
                      className={cn(
                        "flex-1 rounded-t-[2px] transition-colors duration-200",
                        paged ? "bg-signal" : ms > threshold ? "bg-signal/40" : "bg-base-50/20",
                      )}
                    />
                  );
                })}
              </div>
              {/* Threshold */}
              <motion.div
                initial={false}
                animate={{ top: `${thresholdY}%` }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-x-0 border-t border-dashed border-signal"
              >
                <span className="absolute -top-2.5 right-0 rounded-md bg-signal px-1.5 py-0.5 text-[10px] font-medium text-white tabular-nums">
                  {threshold} ms
                </span>
              </motion.div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-base-500 tabular-nums">
              <span>14:00</span>
              <span>14:30</span>
              <span>15:00</span>
            </div>
          </div>

          {/* Alert rule */}
          <div className="grid gap-6 px-4 pt-6 pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Fader
              label="Alert when response time is over"
              min={200}
              max={900}
              step={25}
              ticks={29}
              value={threshold}
              onValueChange={setThreshold}
              format={(v) => `${v} ms`}
              marks={["200 ms", "900 ms"]}
              className="max-w-none"
            />
            <div>
              <p className="mb-2 text-sm font-medium text-base-100">for</p>
              <Stepper label="Consecutive failed checks" min={1} max={5} value={confirm} onValueChange={setConfirm} format={(v) => `${v} ${v === 1 ? "check" : "checks"}`} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-base-50/[0.03] px-4 py-3.5 ring-1 ring-base-50/[0.06]">
            <p className="flex items-center gap-2.5 text-sm text-base-300">
              <BellRing className="size-4 text-signal" />
              <span>
                You&apos;d have been paged{" "}
                <motion.span key={pages.length} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold text-base-50 tabular-nums">
                  {pages.length === 0 ? "0 times" : pages.length === 1 ? "once" : `${pages.length} times`}
                </motion.span>{" "}
                in the last hour.
              </span>
            </p>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-base-300">
              <span id="hero-monitor-call">Phone the on-call</span>
              <Switch size="sm" checked={call} onCheckedChange={setCall} aria-labelledby="hero-monitor-call" />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroMonitor />;
}
