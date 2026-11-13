"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function Digit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `${-digit}em` }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function NumberTicker({
  value,
  format,
  locale = "en-US",
  className,
}: {
  value: number;
  format?: Intl.NumberFormatOptions;
  locale?: string;
  className?: string;
}) {
  const text = new Intl.NumberFormat(locale, format).format(value);
  const chars = text.split("");
  return (
    <span data-slot="number-ticker" className={cn("inline-flex items-baseline tabular-nums", className)} aria-label={text}>
      {chars.map((c, i) => {
        // key from the right so the ones column stays stable as numbers grow
        const key = chars.length - i;
        return /\d/.test(c) ? (
          <Digit key={key} digit={Number(c)} />
        ) : (
          <span key={key} className="leading-none">
            {c}
          </span>
        );
      })}
    </span>
  );
}

export default function Demo() {
  const [revenue, setRevenue] = useState(48290);
  const [users, setUsers] = useState(1284);

  // A live-feeling wobble that stays in a believable range.
  useEffect(() => {
    const t = setInterval(() => {
      setRevenue((r) => Math.min(52900, Math.max(47100, r + Math.round(Math.random() * 1500 - 600))));
      setUsers((u) => Math.min(1420, Math.max(1190, u + Math.round(Math.random() * 30 - 12))));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "Revenue this month", value: revenue, format: { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const, change: "12.4%" },
    { label: "Active users", value: users, change: "3.1%" },
  ];

  return (
    <div className="grid w-full max-w-md gap-3 @md:grid-cols-2">
      {stats.map((s) => (
        <div key={s.label} className="min-w-0 rounded-2xl bg-base-950 p-5 shadow-[0_1px_2px_rgb(0_0_0/0.05)] ring-1 ring-base-50/10 dark:bg-base-900">
          <p className="text-[13px] text-base-500">{s.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-base-50">
            <NumberTicker value={s.value} format={s.format} />
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" /> {s.change} vs last month
          </p>
        </div>
      ))}
    </div>
  );
}
