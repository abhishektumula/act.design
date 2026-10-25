"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

const stats = [
  { value: 99.99, label: "Uptime over the last 12 months", format: { minimumFractionDigits: 2 }, suffix: "%" },
  { value: 38, label: "Edge regions across six continents", suffix: "" },
  { value: 4.2, label: "Seconds from push to production", format: { minimumFractionDigits: 1 }, suffix: "s" },
  { value: 12000, label: "Teams shipping with us every day", format: { notation: "compact" }, suffix: "+" },
] satisfies { value: number; label: string; format?: Intl.NumberFormatOptions; suffix: string }[];

export function Stats({
  title = "Numbers we are quietly proud of.",
  className,
}: {
  title?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section data-slot="stats" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-md text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-4xl">{title}</h2>
        <div
          ref={ref}
          className="mt-14 grid overflow-hidden rounded-3xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: i * 0.08 }}
              className="border-base-50/5 p-8 not-last:border-b sm:nth-[odd]:border-r lg:border-b-0 lg:not-last:border-r"
            >
              <p className="flex items-baseline text-5xl font-semibold tracking-[-0.04em] text-base-50">
                <NumberTicker value={inView ? s.value : 0} format={"format" in s ? s.format : undefined} />
                <span className="text-base-500">{s.suffix}</span>
              </p>
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-base-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <Stats />;
}
