"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const signalCardVariants = cva(
  "group relative isolate flex w-full max-w-sm flex-col overflow-hidden rounded-3xl shadow-xl",
  {
    variants: {
      tone: {
        // Signature: a deep field you can read at a glance
        midnight:
          "bg-linear-to-b from-indigo-950 via-indigo-900 to-indigo-700 text-white shadow-indigo-950/30 ring-1 ring-white/10 inset-shadow-2xs inset-shadow-white/15 [--bar:var(--color-indigo-300)] [--hot:var(--color-white)] [--muted:var(--color-indigo-200)]",
        forest:
          "bg-linear-to-b from-emerald-950 via-emerald-900 to-teal-700 text-white shadow-emerald-950/30 ring-1 ring-white/10 inset-shadow-2xs inset-shadow-white/15 [--bar:var(--color-emerald-300)] [--hot:var(--color-white)] [--muted:var(--color-emerald-200)]",
        // Follows the light / dark theme
        surface:
          "bg-base-950 text-base-50 shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 [--bar:var(--color-blue-500)] [--hot:var(--color-blue-500)] [--muted:var(--color-base-500)]",
      },
    },
    defaultVariants: { tone: "midnight" },
  },
);

export type SignalPoint = { label: string; value: number };

// 48 hours of plausible traffic: a daily rhythm with a launch spike.
const defaultData: SignalPoint[] = Array.from({ length: 48 }, (_, i) => {
  const hour = i % 24;
  const daily = 0.45 + 0.4 * Math.sin(((hour - 8) / 24) * Math.PI * 2);
  const launch = i > 30 ? Math.exp(-((i - 36) ** 2) / 18) * 0.9 : 0;
  const jitter = Math.abs(Math.sin(i * 12.9898)) * 0.12;
  return {
    label: `${i < 24 ? "Mon" : "Tue"} ${String(hour).padStart(2, "0")}:00`,
    value: Math.round((daily + launch + jitter) * 42_000),
  };
});

function Rolling({ value, format }: { value: number; format: (n: number) => string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { type: "spring", stiffness: 140, damping: 22 });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/**
 * A metric card whose background is the chart. Scrub across it to read any
 * point; let go and it settles back on the total.
 */
export function SignalCard({
  data = defaultData,
  label = "Requests · last 48h",
  title,
  cta,
  href = "#",
  tone,
  locale = "en-US",
  className,
}: VariantProps<typeof signalCardVariants> & {
  data?: SignalPoint[];
  label?: ReactNode;
  title?: ReactNode;
  cta?: ReactNode;
  href?: string;
  locale?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const fmt = (n: number) => new Intl.NumberFormat(locale, { notation: n > 999_999 ? "compact" : "standard" }).format(n);
  const point = active === null ? null : data[active];

  return (
    <div data-slot="signal-card" className={cn(signalCardVariants({ tone }), className)}>
      <div className="p-7 pb-0">
        <p className="text-sm text-(--muted)">{point ? point.label : label}</p>
        <p className="mt-1 text-4xl font-semibold tracking-[-0.03em]">
          <Rolling value={point ? point.value : total} format={fmt} />
        </p>
      </div>

      {/* Chart: every bar is a hit target, the field itself is decoration */}
      <div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
          setActive(Math.min(data.length - 1, Math.max(0, i)));
        }}
        onPointerLeave={() => setActive(null)}
        className="relative mx-7 mt-6 flex h-44 cursor-crosshair items-end justify-between touch-none"
      >
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          const on = active === i;
          const near = active === null ? 0 : Math.max(0, 1 - Math.abs(active - i) / 5);
          return (
            <div key={d.label} className="relative h-full w-[3px]">
              <span
                className={cn("absolute inset-x-[1px] bottom-0 rounded-full transition-[opacity,background-color] duration-200", on ? "bg-(--hot)" : "bg-(--bar)")}
                style={{ height: `${h}%`, opacity: on ? 1 : 0.28 + near * 0.4 }}
              />
              <span
                className={cn("absolute inset-x-0 h-2 rounded-full transition-opacity", on ? "bg-(--hot)" : "bg-(--bar)")}
                style={{ bottom: `${h}%`, marginBottom: -4, opacity: on ? 1 : 0.55 + near * 0.3 }}
              />
              {/* A slow blip rising inside the taller bars */}
              {h > 55 && (
                <motion.span
                  className="absolute inset-x-0 h-3 rounded-full bg-(--hot)"
                  initial={{ bottom: "0%", opacity: 0 }}
                  animate={{ bottom: ["0%", `${h - 6}%`], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 3 + (i % 5) * 0.6, delay: (i % 7) * 0.5, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </div>
          );
        })}
        {active !== null && (
          <motion.span
            layout
            className="pointer-events-none absolute inset-y-0 w-px bg-(--hot)/40"
            style={{ left: `${(active / (data.length - 1)) * 100}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          />
        )}
      </div>

      <div className="mt-6 flex-1 border-t border-current/10 p-7 pt-5">
        {title && <p className="text-lg leading-snug font-medium tracking-[-0.01em] text-balance">{title}</p>}
        {cta && (
          <a href={href} className="group/cta mt-4 inline-flex items-center gap-2 text-sm text-(--muted) transition-colors hover:text-(--hot)">
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Demo() {
  return <SignalCard title="Launch day doubled traffic. Latency didn't move." cta="Read the incident-free report" />;
}
