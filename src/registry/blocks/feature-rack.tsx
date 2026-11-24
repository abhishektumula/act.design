"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { Lock } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* One tile: a run-in title over its picture. Every tile shares the padding and puts its copy on top. */
function Tile({ lead, rest, children, className }: { lead: string; rest: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900", className)}>
      <p className="max-w-md px-7 pt-7 text-[17px] leading-6 text-pretty text-neutral-500 sm:px-8 sm:pt-8">
        <span className="font-medium text-neutral-950 dark:text-neutral-50">{lead}</span> {rest}
      </p>
      <div className="flex flex-1 flex-col px-7 pt-8 pb-7 sm:px-8 sm:pb-8">{children}</div>
    </div>
  );
}

/* Hero: the one window in the grid, an incident told in order. It runs off the tile's foot. */
const events = [
  ["14:41:12", "503 from Frankfurt, London and Stockholm", "fail"],
  ["14:41:42", "Confirmed by 3 regions, incident opened", "fail"],
  ["14:41:43", "Calling Maria Chen, on-call", "call"],
  ["14:43:05", "Acknowledged by Maria", "ok"],
  ["14:58:31", "Recovered after 17 minutes", "ok"],
] as const;

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="-mb-7 sm:-mb-8">
      <div className="overflow-hidden rounded-t-[12px] bg-white shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)] dark:bg-neutral-950">
        <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.07] dark:border-neutral-50/[0.07] px-[14px]">
          {["var(--color-red-400)", "var(--color-amber-400)", "var(--color-green-500)"].map((c) => (
            <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-3 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">checkout-api is down</span>
        </div>
        <ol className="relative px-5 py-4">
          <span aria-hidden className="absolute top-6 bottom-6 left-[1.6rem] w-px bg-neutral-950/10 dark:bg-neutral-50/10" />
          {events.map(([time, text, kind], i) => (
            <motion.li
              key={time}
              initial={{ opacity: 0, y: 6 }}
              animate={on ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.22, ease: [0.25, 0.8, 0.25, 1] }}
              className="relative grid grid-cols-[1.25rem_4.25rem_1fr] items-start gap-3 py-2 text-[13px] leading-5"
            >
              <span
                className={cn(
                  "relative mx-auto mt-1.5 size-2 rounded-full ring-4 ring-white dark:ring-neutral-950",
                  kind === "fail" ? "bg-blue-600 dark:bg-blue-500" : kind === "call" ? "bg-neutral-950 dark:bg-neutral-50" : "bg-emerald-500",
                )}
              />
              <span className="font-mono text-[12px] text-neutral-500 tabular-nums">{time}</span>
              <span className={cn("text-pretty", kind === "ok" && i === events.length - 1 ? "font-medium text-neutral-950 dark:text-neutral-50" : "text-neutral-800 dark:text-neutral-200")}>{text}</span>
            </motion.li>
          ))}
        </ol>
        <div className="h-6" />
      </div>
    </div>
  );
}

/* Stat: one number, and twelve dots of which three agree. */
function Regions() {
  return (
    <div>
      <p className="text-6xl font-semibold tracking-[-0.045em] whitespace-nowrap text-neutral-950 dark:text-neutral-50 lg:text-7xl">
        12 <span className="text-3xl font-medium tracking-[-0.02em] text-neutral-600 dark:text-neutral-400">regions</span>
      </p>
      <div aria-hidden className="mt-6 flex gap-2">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={cn("size-2.5 rounded-full", [2, 3, 4].includes(i) ? "bg-blue-600 dark:bg-blue-500" : "bg-neutral-950/12 dark:bg-neutral-50/12")} />
        ))}
      </div>
    </div>
  );
}

/* Component: the frequency picker at real size, and what it adds up to. */
function Frequency() {
  const [every, setEvery] = useState("30");
  return (
    <div className="mt-auto">
      <SegmentedControl
        aria-label="Check frequency"
        value={every}
        onValueChange={setEvery}
        options={[
          { value: "180", label: "3 min" },
          { value: "60", label: "1 min" },
          { value: "30", label: "30 s" },
          { value: "10", label: "10 s" },
        ]}
      />
      <p className="mt-5 text-sm text-neutral-500">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          <NumberTicker value={86400 / Number(every)} />
        </span>{" "}
        checks a day, per monitor
      </p>
    </div>
  );
}

/* Object: the certificate itself. */
function Certificate() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className="mt-auto rounded-[12px] bg-white p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)] dark:bg-neutral-950">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Lock className="size-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[13px] text-neutral-950 dark:text-neutral-50">*.northwind.app</span>
          <span className="block text-xs text-neutral-500">Let&apos;s Encrypt, renews automatically</span>
        </span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-950/10 dark:bg-neutral-50/10">
        <motion.div
          initial={{ width: "100%" }}
          animate={on ? { width: "25%" } : undefined}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
        />
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Expires in <span className="font-medium text-neutral-900 dark:text-neutral-100">23 days</span>
      </p>
    </div>
  );
}

/* Component: where an alert goes, as switches you can flip. */
function Channels() {
  return (
    <div className="mt-auto divide-y divide-neutral-950/[0.07] dark:divide-neutral-50/[0.07]">
      {[
        ["Slack, #incidents", true],
        ["SMS to on-call", true],
        ["Phone call after 5 min", false],
      ].map(([name, on]) => (
        <label key={name as string} className="flex cursor-pointer items-center justify-between gap-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-200">
          {name}
          <Switch size="sm" defaultChecked={on as boolean} aria-label={name as string} />
        </label>
      ))}
    </div>
  );
}

/**
 * The feature grid for a monitoring product, laid out as a bento: one incident
 * window leads, and the rest are a number, two controls and an object.
 */
export function FeatureRack({ className }: { className?: string }) {
  return (
    <section data-slot="feature-rack" className={cn("bg-white dark:bg-black px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-6xl">
            Built for <span className="font-serif font-normal tracking-[-0.01em] italic">3 a.m.</span>
          </h2>
          <p className="max-w-xs text-base leading-7 text-neutral-600 dark:text-neutral-400">
            Everything that matters when something breaks, and nothing that pages you when it doesn&apos;t.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08] ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] md:grid-cols-2 lg:grid-cols-3">
          <Tile lead="Every incident, in order." rest="Failed checks, pages and recoveries, ready to paste into the postmortem." className="md:col-span-2">
            <Timeline />
          </Tile>
          <Tile lead="Checked from everywhere." rest="An outage only counts when three regions agree.">
            <Regions />
          </Tile>
          <Tile lead="As often as you like." rest="Per monitor, so login can be stricter than the blog.">
            <Frequency />
          </Tile>
          <Tile lead="No surprise expiries." rest="Certificates and domains are checked daily.">
            <Certificate />
          </Tile>
          <Tile lead="Alerts that escalate." rest="Nobody acknowledges, the phone rings." className="md:col-span-2 lg:col-span-1">
            <Channels />
          </Tile>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <FeatureRack />;
}
