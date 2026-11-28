"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

type Day = { level: "ok" | "minor" | "major"; note?: string };

/** 90 days per component, newest last. Mostly clean, with the few bad days a real service has. */
const components: { name: string; days: Day[] }[] = [
  { name: "Chat models", incidents: { 61: ["minor", "Slower first tokens in Europe, 22 min"], 84: ["minor", "Slower answers while traffic moved, 17 min"] } },
  { name: "Image generation", incidents: { 33: ["minor", "Long queue for 4K images, 41 min"], 84: ["major", "Requests failing, 17 min"] } },
  { name: "Fine-tuning", incidents: { 84: ["minor", "Jobs paused, 25 min"], 12: ["minor", "Jobs queued, 1 h 5 min"] } },
  { name: "Console", incidents: {} },
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
  ["Resolved", "15:02", "Image requests are succeeding again for every model. We'll publish a write-up tomorrow."],
  ["Monitoring", "14:52", "Capacity is back and the queue has drained. We're watching it."],
  ["Identified", "14:47", "A bad rollout took a GPU cluster offline. Moving traffic to the others now."],
  ["Investigating", "14:42", "Some image generation requests are failing or timing out."],
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

  const smallButton = "inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-neutral-950/15 px-3 text-[13px] font-medium text-neutral-800 transition-colors outline-none hover:border-neutral-950/35 hover:bg-neutral-950/[0.03] focus-visible:border-emerald-600 dark:border-neutral-50/15 dark:text-neutral-200 dark:hover:border-neutral-50/35 dark:hover:bg-neutral-50/[0.04] [&_svg]:size-3.5";

  return (
    <section data-slot="status-page" className={cn("bg-neutral-50 px-6 py-20 sm:py-24 dark:bg-neutral-950", className)}>
      <div className="mx-auto max-w-3xl">
        {/* Top bar: the product, and the small ways to follow along */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">
            Lumen AI <span className="font-normal text-neutral-500">Status</span>
          </p>
          <form onSubmit={subscribe} className="flex items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
              {subscribed ? (
                <motion.p key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex h-8 items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-300">
                  <Check className="size-3.5 text-emerald-600" /> Updates go to {email}
                </motion.p>
              ) : (
                <motion.div key="form" exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    aria-label="Email for status updates"
                    className="h-8 w-44 rounded-[6px] border border-neutral-950/15 bg-white px-2.5 text-[13px] text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-emerald-600 sm:w-52 dark:border-neutral-50/15 dark:bg-neutral-900 dark:text-neutral-50"
                  />
                  <button type="submit" className={smallButton}>
                    <Bell /> Subscribe
                  </button>
                  <a href="#" className={cn(smallButton, "hidden sm:inline-flex")}>
                    <Rss /> RSS
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* The banner: the whole answer, first */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-emerald-600 px-5 py-4 text-white">
          <h2 className="flex items-center gap-3 text-[17px] font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-white/20">
              <Check className="size-3.5 stroke-[3]" />
            </span>
            All systems operational
          </h2>
          <span className="text-[13px] text-white/80">Checked 40 seconds ago</span>
        </div>

        {/* Components: one dense row each */}
        <div className="mt-6 rounded-[8px] border border-neutral-950/10 bg-white dark:border-neutral-50/10 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-950/10 px-4 py-2.5 dark:border-neutral-50/10">
            <span className="text-[13px] text-neutral-500">Uptime, last {n} days</span>
            <div role="radiogroup" aria-label="Range" className="flex overflow-hidden rounded-[6px] border border-neutral-950/15 dark:border-neutral-50/15">
              {(["30", "90"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={range === r}
                  onClick={() => setRange(r)}
                  className={cn("h-7 px-3 text-[12px] font-medium transition-colors outline-none", range === r ? "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950" : "text-neutral-600 hover:bg-neutral-950/[0.04] dark:text-neutral-400")}
                >
                  {r} days
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-neutral-950/[0.07] dark:divide-neutral-50/[0.07]">
            {components.map((c, row) => {
              const days = c.days.slice(90 - n);
              const worst = days.some((d) => d.level === "major") ? "major" : days.some((d) => d.level === "minor") ? "minor" : "ok";
              return (
                <li key={c.name} className="grid items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[9.5rem_1fr_4.5rem]">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-neutral-950 dark:text-neutral-50">
                    <span className={cn("size-1.5 rounded-full", worst === "ok" ? "bg-emerald-500" : worst === "minor" ? "bg-amber-400" : "bg-rose-500")} />
                    {c.name}
                  </span>
                  <div className="relative" onPointerLeave={() => setHover(null)}>
                    <div className="flex h-6 gap-px">
                      {days.map((d, i) => {
                        const index = 90 - n + i;
                        const on = hover?.row === row && hover.day === index;
                        return (
                          <span
                            key={index}
                            onPointerEnter={() => setHover({ row, day: index })}
                            className={cn(
                              "flex-1 transition-opacity duration-150 first:rounded-l-[3px] last:rounded-r-[3px]",
                              d.level === "major" ? "bg-rose-500" : d.level === "minor" ? "bg-amber-400" : "bg-emerald-500/70",
                              hover?.row === row && !on && "opacity-40",
                            )}
                          />
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {hover?.row === row && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          style={{ left: `${((hover.day - (90 - n) + 0.5) / n) * 100}%` }}
                          className="pointer-events-none absolute bottom-full z-10 mb-2 w-52 -translate-x-1/2 rounded-[6px] border border-neutral-950/10 bg-white px-3 py-2 text-[12px] text-neutral-900 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.2)] dark:border-neutral-50/10 dark:bg-neutral-800 dark:text-neutral-100"
                        >
                          <span className="block font-medium">{dateOf(hover.day)}</span>
                          <span className="block text-neutral-500">{c.days[hover.day].note ?? "No incidents"}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-right text-[13px] text-neutral-600 tabular-nums dark:text-neutral-400">{uptime(days) === 100 ? "100" : uptime(days).toFixed(n === 30 ? 2 : 3)}%</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The latest incident, as a compact log */}
        <div className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-950/10 pb-3 dark:border-neutral-50/10">
            <h3 className="text-[15px] font-semibold text-neutral-950 dark:text-neutral-50">Image generation failing</h3>
            <span className="text-[13px] text-neutral-500">
              {dateOf(84)} · <span className="text-emerald-700 dark:text-emerald-400">resolved in 17 min</span>
            </span>
          </div>
          <ol>
            {updates.map(([state, time, text]) => (
              <li key={state} className="grid gap-1 border-b border-neutral-950/[0.06] py-3 text-[13px] sm:grid-cols-[6.5rem_3.5rem_1fr] sm:gap-4 dark:border-neutral-50/[0.06]">
                <span className="font-medium text-neutral-950 dark:text-neutral-50">{state}</span>
                <span className="text-neutral-500 tabular-nums">{time}</span>
                <span className="leading-5 text-neutral-600 dark:text-neutral-400">{text}</span>
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
