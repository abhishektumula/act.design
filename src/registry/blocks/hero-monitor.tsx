"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Hash, Moon, PhoneCall } from "lucide-react";
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

  const last = pages.at(-1);
  const at = (i: number) => {
    const m = Math.floor(i / 2);
    return `14:${String(m).padStart(2, "0")}`;
  };

  return (
    <section data-slot="hero-monitor" className={cn("relative overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.25fr]">
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

        {/* The product: a window that runs off the right edge on wide screens */}
        <div className="relative pb-8">
          <div className="overflow-hidden rounded-[14px] bg-base-950 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-base-50)_8%,transparent),0_30px_60px_-30px_color-mix(in_oklab,var(--color-shade)_55%,transparent)] lg:w-[calc(100%+18rem)] dark:bg-base-900">
            {/* Chrome */}
            <div className="flex h-[38px] items-center gap-[6px] border-b border-base-50/[0.07] px-[14px]">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-3 text-[13px] font-medium text-base-100">Monitors</span>
            </div>

            <div className="max-w-[40rem] px-5 pt-5 pb-6 sm:px-6">
              {/* Endpoint */}
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <span className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[13px] text-base-50">api.northwind.app/health</span>
                </span>
                <span className="flex items-center gap-4 text-xs text-base-500">
                  <span>
                    <span className="font-medium text-base-200 tabular-nums">99.94%</span> 30 days
                  </span>
                  <span>
                    <span className="font-medium text-base-200 tabular-nums">{p50} ms</span> median
                  </span>
                </span>
              </div>

              {/* Last hour of checks */}
              <div className="relative mt-6 h-36">
                <div className="absolute inset-0 flex items-end gap-[2px]">
                  {checks.map((ms, i) => {
                    const paged = pages.some((p) => i >= p.start && i <= p.end);
                    return (
                      <span
                        key={i}
                        style={{ height: `${Math.min(100, (ms / CHART_MAX) * 100)}%` }}
                        className={cn(
                          "flex-1 rounded-t-[2px] transition-colors duration-200",
                          paged ? "bg-signal" : ms > threshold ? "bg-signal/40" : "bg-base-50/15",
                        )}
                      />
                    );
                  })}
                </div>
                <motion.div
                  initial={false}
                  animate={{ top: `${thresholdY}%` }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="absolute inset-x-0 border-t border-dashed border-signal"
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-base-500 tabular-nums">
                <span>14:00</span>
                <span>14:30</span>
                <span>15:00</span>
              </div>

              {/* Alert rule */}
              <div className="mt-7 grid gap-6 border-t border-base-50/[0.07] pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-base-400">
                  You&apos;d have been paged{" "}
                  <motion.span key={pages.length} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold text-base-50 tabular-nums">
                    {pages.length === 0 ? "0 times" : pages.length === 1 ? "once" : `${pages.length} times`}
                  </motion.span>{" "}
                  in the last hour.
                </p>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-base-300">
                  <span id="hero-monitor-call">Phone the on-call</span>
                  <Switch size="sm" checked={call} onCheckedChange={setCall} aria-labelledby="hero-monitor-call" />
                </label>
              </div>
              {/* Room for the notification that straddles the window's foot */}
              <div className="h-12" />
            </div>
          </div>

          {/* The payoff: what the last page actually did */}
          <div aria-live="polite" className="absolute bottom-0 left-4 w-[min(20rem,calc(100%-2rem))] sm:left-6 lg:-left-8">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={!last ? "quiet" : call ? "call" : "slack"}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="flex items-center gap-3 rounded-[14px] bg-base-950 p-3 pr-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-base-50)_10%,transparent),0_14px_32px_-10px_color-mix(in_oklab,var(--color-shade)_55%,transparent)] dark:bg-base-800"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full [&_svg]:size-4",
                    !last ? "bg-base-50/[0.06] text-base-400" : call ? "bg-signal text-white" : "bg-base-50/[0.08] text-base-200",
                  )}
                >
                  {!last ? <Moon /> : call ? <PhoneCall /> : <Hash />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-base-50">
                      {!last ? "A quiet hour" : call ? "Calling Maria Chen" : "Posted to #incidents"}
                    </span>
                    {last && <span className="shrink-0 text-xs text-base-500 tabular-nums">{at(last.start + confirm - 1)}</span>}
                  </span>
                  <span className="block truncate text-xs text-base-500">
                    {!last ? `Nothing stayed over ${threshold} ms for ${confirm} ${confirm === 1 ? "check" : "checks"}` : call ? "On-call, by phone" : "Nobody was woken up"}
                  </span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroMonitor />;
}
