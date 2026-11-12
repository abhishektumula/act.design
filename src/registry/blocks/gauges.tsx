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
  { label: "Uptime", value: 99.99, reading: 0.97, format: { minimumFractionDigits: 2 }, suffix: "%", caption: "Rolling 12 months, every region", scale: ["99.0", "100"] },
  { label: "p95 latency", value: 42, reading: 0.18, suffix: "ms", caption: "Edge to origin and back", scale: ["0", "250"] },
  { label: "Deploys / day", value: 1240, reading: 0.72, caption: "Across 3,000 teams", scale: ["0", "2k"] },
  { label: "NPS", value: 72, reading: 0.86, caption: "From 4,100 responses", scale: ["−100", "100"] },
];

const SWEEP = 180;

function Face({ g, on, delay }: { g: Gauge; on: boolean; delay: number }) {
  const ticks = 31;
  return (
    <div className="relative mx-auto aspect-[2/1.15] w-full max-w-[15rem]">
      <svg viewBox="0 0 200 115" className="absolute inset-0 size-full overflow-visible">
        {/* Red zone, then ticks */}
        <path d="M 177.9 55 A 90 90 0 0 1 190 100" fill="none" strokeWidth="6" className="stroke-signal/25" strokeLinecap="round" />
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
              className={major ? "stroke-base-300" : "stroke-base-50/25"}
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
        <span className="absolute bottom-0 left-1/2 h-full w-[2px] -translate-x-1/2 rounded-full bg-linear-to-t from-base-50 to-signal" />
      </motion.div>
      <span className="absolute bottom-[13%] left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-linear-to-b from-white to-base-800 shadow-[0_1px_0_white_inset,0_2px_4px_rgb(0_0_0/0.25)] ring-1 ring-black/10 dark:from-base-600 dark:to-base-800" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 font-mono text-[9px] tracking-wider text-base-500">
        <span>{g.scale[0]}</span>
        <span>{g.scale[1]}</span>
      </div>
    </div>
  );
}

/**
 * Proof points as analog meters. On scroll each needle swings up, overshoots
 * and wobbles to rest while the readout rolls to its number.
 */
export function Gauges({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section data-slot="gauges" className={cn("bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
            Measured, <span className="font-serif font-normal tracking-[-0.02em] italic">not promised.</span>
          </h2>
        </div>

        <div
          ref={ref}
          className="mt-14 grid gap-px overflow-hidden rounded-[32px] bg-base-50/[0.07] shadow-[0_40px_80px_-60px_var(--color-shade)] ring-1 ring-base-50/[0.08] sm:grid-cols-2 lg:grid-cols-4"
        >
          {gauges.map((g, i) => (
            <div key={g.label} className="group bg-base-950 px-6 pt-8 pb-7">
              <Face g={g} on={on} delay={0.15 + i * 0.12} />
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-base-400">{g.label}</p>
                <p className="mt-2 inline-flex items-baseline text-4xl font-semibold tracking-[-0.04em] text-base-50">
                  <NumberTicker value={on ? g.value : 0} format={g.format} />
                  {g.suffix && <span className="ml-1 text-lg font-normal tracking-normal text-base-500">{g.suffix}</span>}
                </p>
                <p className="mt-2 text-sm text-base-500">{g.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <Gauges />;
}
