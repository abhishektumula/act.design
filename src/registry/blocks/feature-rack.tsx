"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const regions = [
  { code: "IAD", ms: 42 },
  { code: "SFO", ms: 61 },
  { code: "GRU", ms: 138 },
  { code: "LHR", ms: 88 },
  { code: "FRA", ms: 94 },
  { code: "ARN", ms: 109 },
  { code: "BOM", ms: 172 },
  { code: "SIN", ms: 196 },
  { code: "HND", ms: 151 },
  { code: "SYD", ms: 214 },
  { code: "JNB", ms: 233 },
  { code: "YYZ", ms: 55 },
];

function Regions() {
  return (
    <div className="grid grid-cols-6 gap-1.5" aria-hidden>
      {regions.map((r, i) => (
        <motion.span
          key={r.code}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
          className="rounded-md bg-base-50/[0.05] px-1.5 py-1 text-center ring-1 ring-base-50/5"
        >
          <span className="block font-mono text-[9px] tracking-wider text-base-300">{r.code}</span>
          <span className="block text-[9px] text-base-500 tabular-nums">{r.ms}ms</span>
        </motion.span>
      ))}
    </div>
  );
}

function Timeline() {
  const events = [
    ["14:41:12", "503 from FRA, LHR, ARN"],
    ["14:41:42", "Confirmed by 3 regions, incident opened"],
    ["14:41:43", "Calling Maria Chen (on-call)"],
    ["14:43:05", "Acknowledged by Maria"],
    ["14:44:10", "Status page set to Degraded"],
    ["14:58:31", "Recovered, 17 min downtime"],
  ];
  return (
    <div className="h-14 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]" aria-hidden>
      <motion.div animate={{ y: ["0%", "-50%"] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
        {[...events, ...events].map(([t, e], i) => (
          <p key={i} className="flex gap-3 text-[11px] leading-5 whitespace-nowrap">
            <span className="font-mono text-base-500 tabular-nums">{t}</span>
            <span className="text-base-300">{e}</span>
          </p>
        ))}
      </motion.div>
    </div>
  );
}

function Channels() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3">
      {[
        ["Slack", true],
        ["SMS", true],
        ["Phone call", false],
      ].map(([name, on]) => (
        <label key={name as string} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-base-300">
          <Switch size="sm" defaultChecked={on as boolean} aria-label={`Alert by ${name}`} />
          {name}
        </label>
      ))}
    </div>
  );
}

function Frequency() {
  const [every, setEvery] = useState("30");
  return (
    <SegmentedControl
      aria-label="Check frequency"
      size="sm"
      value={every}
      onValueChange={setEvery}
      options={[
        { value: "180", label: "3m" },
        { value: "60", label: "1m" },
        { value: "30", label: "30s" },
        { value: "10", label: "10s" },
      ]}
    />
  );
}

function Certificate() {
  return (
    <div className="w-full max-w-[15rem]">
      <div className="flex justify-between text-[11px] text-base-400">
        <span className="font-mono">*.northwind.app</span>
        <span className="tabular-nums">23 days left</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-50/10">
        <motion.div
          initial={{ width: "100%" }}
          whileInView={{ width: "25%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-signal"
        />
      </div>
      <p className="mt-1.5 text-[11px] text-base-500">Reminder sent at 30 and 14 days</p>
    </div>
  );
}

const modules: { name: string; body: string; status: string; visual: ReactNode }[] = [
  { name: "Checks from 12 regions", body: "An outage only counts when several regions agree, so one bad route never wakes anyone.", status: "12 of 12 up", visual: <Regions /> },
  { name: "Check frequency", body: "Every 30 seconds on Team, every 10 on Business. Per monitor, so your login page can be stricter than your blog.", status: "Every 30s", visual: <Frequency /> },
  { name: "Incident timeline", body: "Every failed check, page and status update in order, ready to paste into the postmortem.", status: "Recording", visual: <Timeline /> },
  { name: "Alert channels", body: "Slack for the team, SMS for the on-call, a phone call if nobody acknowledges in five minutes.", status: "2 active", visual: <Channels /> },
  { name: "SSL and domain expiry", body: "Certificates and domains are checked daily. You hear about it weeks before the browser warning.", status: "Watching 4", visual: <Certificate /> },
];

/**
 * The feature list for a monitoring product, each row with a live readout
 * instead of a stock icon.
 */
export function FeatureRack({ className }: { className?: string }) {
  return (
    <section data-slot="feature-rack" className={cn("bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-base-50 sm:text-6xl">
            Built for <span className="font-serif font-normal tracking-[-0.01em] italic">3 a.m.</span>
          </h2>
          <p className="max-w-xs text-base leading-7 text-base-400">
            Everything that matters when something breaks, and nothing that pages you when it doesn&apos;t.
          </p>
        </div>

        <div className="mt-14 divide-y divide-base-50/[0.07] overflow-hidden rounded-[28px] bg-base-950 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_30px_60px_-44px_var(--color-shade)] ring-1 ring-base-50/10 dark:bg-base-900">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 260, damping: 30, delay: i * 0.05 }}
              className="grid items-center gap-6 px-6 py-6 sm:grid-cols-[1fr_16rem_6.5rem] sm:px-8"
            >
              <div className="min-w-0">
                <h3 className="text-[17px] font-medium tracking-tight text-base-50">{m.name}</h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-base-500">{m.body}</p>
              </div>
              <div className="flex min-h-14 items-center sm:justify-end">{m.visual}</div>
              <span className="flex items-center gap-2 text-xs text-base-400 sm:justify-end">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {m.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <FeatureRack />;
}
