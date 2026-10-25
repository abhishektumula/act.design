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

  useEffect(() => {
    const t = setInterval(() => {
      setRevenue((r) => r + Math.round(Math.random() * 900 + 40));
      setUsers((u) => u + Math.round(Math.random() * 12 + 1));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      <div className="rounded-2xl bg-base-900/60 p-5 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
        <p className="text-xs text-base-500">Revenue</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-base-50">
          <NumberTicker value={revenue} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
        </p>
        <p className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" /> 12.4%
        </p>
      </div>
      <div className="rounded-2xl bg-base-900/60 p-5 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
        <p className="text-xs text-base-500">Active users</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-base-50">
          <NumberTicker value={users} />
        </p>
        <p className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" /> 3.1%
        </p>
      </div>
    </div>
  );
}
