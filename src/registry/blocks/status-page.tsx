"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type Day = { level: "ok" | "minor" | "major"; note?: string };

/** 90 days per component, newest last. Mostly clean, with the few bad days a real service has. */
const components: { name: string; days: Day[] }[] = [
  { name: "API", incidents: { 61: ["minor", "Elevated latency in Frankfurt, 22 min"], 84: ["major", "Checkout API down, 17 min"] } },
  { name: "Dashboard", incidents: { 33: ["minor", "Slow chart loading, 41 min"] } },
  { name: "Webhooks", incidents: { 84: ["minor", "Deliveries delayed, 25 min"], 12: ["minor", "Retries backed up, 1 h 5 min"] } },
  { name: "Email alerts", incidents: {} },
].map(({ name, incidents }) => ({
  name,
  days: Array.from({ length: 90 }, (_, i): Day => {
    const hit = (incidents as Record<number, [Day["level"], string]>)[i];
    return hit ? { level: hit[0], note: hit[1] } : { level: "ok" };
  }),
}));

/** Uptime for a run of days: a major day costs more than a minor one. */
function uptime(days: Day[]) {
  const lost = days.reduce((m, d) => m + (d.level === "major" ? 17 : d.level === "minor" ? 4 : 0), 0);
  return 100 - (lost / (days.length * 1440)) * 100;
}

const TODAY = new Date(2026, 10, 16);
const dateOf = (index: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - (89 - index));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const updates = [
  ["Resolved", "15:02", "Checkout requests are succeeding again in every region. We'll publish a postmortem tomorrow."],
  ["Monitoring", "14:52", "A fix is deployed and error rates are back to normal. We're watching it."],
  ["Identified", "14:47", "A bad config push took the checkout service offline. Rolling it back now."],
  ["Investigating", "14:42", "Checkout API requests are failing from Frankfurt, London and Stockholm."],
] as const;

/**
 * A public status page: the headline state, each component's daily uptime
 * (hover a day for what happened), a subscribe form and the latest incident
 * written up update by update.
 */
export function StatusPage({ className }: { className?: string }) {
  const [range, setRange] = useState<"30" | "90">("90");
  const [hover, setHover] = useState<{ row: number; day: number } | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const n = Number(range);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (/\S+@\S+\.\S+/.test(email)) setSubscribed(true);
  };

  return (
    <section data-slot="status-page" className={cn("bg-white dark:bg-black px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Northwind status</p>
            <h2 className="mt-3 flex items-center gap-4 text-4xl leading-none font-semibold tracking-[-0.04em] text-neutral-950 dark:text-neutral-50 sm:text-5xl">
              <span className="relative grid size-4 shrink-0 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/40 [animation-duration:2.4s]" />
                <span className="relative size-3 rounded-full bg-emerald-500" />
              </span>
              <span>
                All systems <span className="font-serif font-normal tracking-[-0.01em] italic">operational.</span>
              </span>
            </h2>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-sm items-center gap-2 sm:w-auto">
            <AnimatePresence mode="wait" initial={false}>
              {subscribed ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-10 items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200"
                >
                  <Check className="size-4 text-emerald-500" /> Updates will go to {email}
                </motion.p>
              ) : (
                <motion.div key="form" exit={{ opacity: 0, y: -4 }} className="flex w-full items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    aria-label="Email for status updates"
                    className="h-10 min-w-0 flex-1 rounded-[10px] bg-neutral-50 px-3.5 text-sm text-neutral-950 dark:text-neutral-50 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 outline-none placeholder:text-neutral-500 focus:ring-blue-600/50 dark:focus:ring-blue-500/50 sm:w-56 dark:bg-neutral-900"
                  />
                  <Button type="submit" tone="ink">
                    Subscribe
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Components */}
        <div className="mt-12 overflow-hidden rounded-[20px] bg-neutral-50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)] dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-950/[0.07] dark:border-neutral-50/[0.07] px-5 py-3 sm:px-7">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Uptime, last {n} days</p>
            <SegmentedControl
              aria-label="Range"
              size="sm"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]}
            />
          </div>
          <ul className="divide-y divide-neutral-950/[0.07] dark:divide-neutral-50/[0.07]">
            {components.map((c, row) => {
              const days = c.days.slice(90 - n);
              return (
                <li key={c.name} className="px-5 py-5 sm:px-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="flex items-center gap-2.5 text-[15px] font-medium text-neutral-950 dark:text-neutral-50">
                      {c.name}
                    </span>
                    <span className="text-sm text-neutral-500 tabular-nums">{uptime(days) === 100 ? "100" : uptime(days).toFixed(n === 30 ? 2 : 3)}%</span>
                  </div>
                  <div className="relative mt-3" onPointerLeave={() => setHover(null)}>
                    <div className="flex h-8 gap-[2px]">
                      {days.map((d, i) => {
                        const index = 90 - n + i;
                        const on = hover?.row === row && hover.day === index;
                        return (
                          <span
                            key={index}
                            onPointerEnter={() => setHover({ row, day: index })}
                            className={cn(
                              "flex-1 rounded-[2px] transition-[opacity,transform] duration-150",
                              d.level === "major" ? "bg-blue-600 dark:bg-blue-500" : d.level === "minor" ? "bg-amber-400" : "bg-emerald-500/50",
                              hover?.row === row && !on && "opacity-50",
                              on && "scale-y-110",
                            )}
                          />
                        );
                      })}
                    </div>
                    {/* What happened that day */}
                    <AnimatePresence>
                      {hover?.row === row && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          style={{ left: `${((hover.day - (90 - n) + 0.5) / n) * 100}%` }}
                          className="pointer-events-none absolute bottom-full z-10 mb-2 w-52 -translate-x-1/2 rounded-[10px] bg-neutral-950 dark:bg-neutral-50 px-3 py-2 text-xs text-neutral-50 dark:text-neutral-950 shadow-lg"
                        >
                          <span className="block font-medium">{dateOf(hover.day)}</span>
                          <span className="block opacity-75">{c.days[hover.day].note ?? "No incidents"}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-neutral-500">
                    <span>{n} days ago</span>
                    <span>Today</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The latest incident */}
        <div className="mt-12 grid gap-8 sm:grid-cols-[12rem_1fr]">
          <div>
            <p className="text-sm text-neutral-500">{dateOf(84)}</p>
            <h3 className="mt-1 text-lg font-medium tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">Checkout API down</h3>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Resolved after 17 minutes</p>
          </div>
          <ol className="space-y-5 border-l border-neutral-950/10 dark:border-neutral-50/10 pl-6">
            {updates.map(([state, time, text], i) => (
              <li key={state} className="relative">
                <span className={cn("absolute top-1.5 -left-[1.6rem] size-2 rounded-full ring-4 ring-white dark:ring-black", i === 0 ? "bg-emerald-500" : "bg-neutral-950/25 dark:bg-neutral-50/25")} />
                <p className="text-sm">
                  <span className="font-medium text-neutral-950 dark:text-neutral-50">{state}</span> <span className="text-neutral-500 tabular-nums">{time}</span>
                </p>
                <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-600 dark:text-neutral-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <StatusPage />;
}
