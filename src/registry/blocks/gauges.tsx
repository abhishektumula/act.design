"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

type Gauge = {
  label: string;
  value: number;
  /** Where the needle sits, 0 to 1 across the face. */
  reading: number;
  format?: Intl.NumberFormatOptions;
  suffix?: string;
  caption: string;
  scale: [string, string];
};

const gauges: Gauge[] = [
  { label: "Platform uptime", value: 99.995, reading: 0.95, format: { minimumFractionDigits: 3 }, suffix: "%", caption: "Beacon itself, last 12 months", scale: ["99.9", "100"] },
  { label: "Time to alert", value: 28, reading: 0.23, suffix: "s", caption: "Median, first failed check to page", scale: ["0", "2m"] },
  { label: "Checks a day", value: 41_000_000, reading: 0.68, format: { notation: "compact", maximumFractionDigits: 0 }, caption: "Across 3,200 teams", scale: ["0", "60M"] },
  { label: "Acked within 5 min", value: 87, reading: 0.87, suffix: "%", caption: "Of pages sent last quarter", scale: ["0", "100"] },
];

const SWEEP = 180;

function Face({ g, on, delay }: { g: Gauge; on: boolean; delay: number }) {
  const ticks = 31;
  return (
    <div className="relative mx-auto aspect-[2/1.15] w-full">
      <svg viewBox="0 0 200 115" className="absolute inset-0 size-full overflow-visible">
        {/* Red zone, then ticks */}
        <path d="M 177.9 55 A 90 90 0 0 1 190 100" fill="none" strokeWidth="6" className="stroke-blue-600/25 dark:stroke-blue-500/25" strokeLinecap="round" />
        {Array.from({ length: ticks }, (_, i) => {
          const a = -90 + (i / (ticks - 1)) * SWEEP;
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              x2="100"
              y1={major ? 14 : 19}
              y2="25"
              transform={`rotate(${a} 100 100)`}
              strokeWidth={major ? 1.8 : 1}
              strokeLinecap="round"
              className={major ? "stroke-neutral-700 dark:stroke-neutral-300" : "stroke-neutral-950/25 dark:stroke-neutral-50/25"}
            />
          );
        })}
      </svg>
      {/* Needle: springs past the reading, then settles */}
      <motion.div
        initial={{ rotate: -90 }}
        animate={{ rotate: on ? -90 + g.reading * SWEEP : -90 }}
        transition={{ type: "spring", stiffness: 55, damping: 7, mass: 0.9, delay }}
        className="absolute bottom-[13%] left-1/2 h-[66%] w-0 origin-bottom"
      >
        <span className="absolute bottom-0 left-1/2 h-full w-[2px] -translate-x-1/2 rounded-full bg-linear-to-t from-neutral-950 dark:from-neutral-50 to-blue-600 dark:to-blue-500" />
      </motion.div>
      <span className="absolute bottom-[13%] left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-linear-to-b from-white to-neutral-200 shadow-[0_1px_0_white_inset,0_2px_4px_rgb(0_0_0/0.25)] ring-1 ring-black/10 dark:from-neutral-600 dark:to-neutral-800" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 font-mono text-[9px] tracking-wider text-neutral-500">
        <span>{g.scale[0]}</span>
        <span>{g.scale[1]}</span>
      </div>
    </div>
  );
}

/** A straight meter for the supporting numbers: a tick scale with a needle that swings in. */
function Meter({ g, on, delay }: { g: Gauge; on: boolean; delay: number }) {
  const ticks = 41;
  return (
    <div aria-hidden className="relative mt-5">
      <div className="flex h-5 items-end justify-between">
        {Array.from({ length: ticks }, (_, i) => (
          <span key={i} className={cn("w-px", i % 10 === 0 ? "h-full bg-neutral-950/40 dark:bg-neutral-50/40" : i % 5 === 0 ? "h-3 bg-neutral-950/25 dark:bg-neutral-50/25" : "h-2 bg-neutral-950/15 dark:bg-neutral-50/15")} />
        ))}
      </div>
      <motion.span
        initial={{ left: "0%" }}
        animate={{ left: on ? `${g.reading * 100}%` : "0%" }}
        transition={{ type: "spring", stiffness: 60, damping: 9, mass: 0.9, delay }}
        className="absolute -top-1.5 bottom-0 w-[2px] -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-500"
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] text-neutral-500">
        <span>{g.scale[0]}</span>
        <span>{g.scale[1]}</span>
      </div>
    </div>
  );
}

function Readout({ g, on, size }: { g: Gauge; on: boolean; size: "lg" | "md" }) {
  return (
    <p
      className={cn(
        "inline-flex items-baseline font-semibold whitespace-nowrap text-neutral-950 dark:text-neutral-50",
        size === "lg" ? "text-6xl tracking-[-0.045em] sm:text-7xl" : "text-4xl tracking-[-0.04em]",
      )}
    >
      <NumberTicker value={on ? g.value : 0} format={g.format} />
      {g.suffix && <span className={cn("ml-1 font-medium tracking-normal text-neutral-500", size === "lg" ? "text-3xl" : "text-xl")}>{g.suffix}</span>}
    </p>
  );
}

/**
 * Proof points as instruments. The headline number gets the big analog gauge;
 * the supporting three get straight meters. On scroll the needles swing past
 * their reading and settle while the numbers roll in.
 */
export function Gauges({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, margin: "-80px" });
  const [lead, ...rest] = gauges;

  return (
    <section data-slot="gauges" className={cn("bg-white dark:bg-black px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-6xl">
          Measured, <span className="font-serif font-normal tracking-[-0.02em] italic">not promised.</span>
        </h2>

        <div ref={ref} className="mt-14 grid gap-px overflow-hidden rounded-[20px] bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08] ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] lg:grid-cols-[1.25fr_1fr]">
          {/* The one that matters most */}
          <div className="flex flex-col bg-neutral-50 px-7 pt-8 pb-9 sm:px-10 sm:pt-10 dark:bg-neutral-900">
            <p className="text-[17px] text-neutral-500">
              <span className="font-medium text-neutral-950 dark:text-neutral-50">{lead.label}.</span> {lead.caption}.
            </p>
            <div className="mt-10 w-full max-w-md self-center">
              <Face g={lead} on={on} delay={0.15} />
            </div>
            <div className="mt-8 text-center">
              <Readout g={lead} on={on} size="lg" />
            </div>
          </div>

          {/* The supporting three */}
          <div className="grid gap-px bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08]">
            {rest.map((g, i) => (
              <div key={g.label} className="bg-neutral-50 px-7 py-7 sm:px-8 dark:bg-neutral-900">
                <div className="flex items-end justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-neutral-950 dark:text-neutral-50">{g.label}</p>
                    <p className="mt-0.5 text-sm text-neutral-500">{g.caption}</p>
                  </div>
                  <Readout g={g} on={on} size="md" />
                </div>
                <Meter g={g} on={on} delay={0.35 + i * 0.12} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <Gauges />;
}
