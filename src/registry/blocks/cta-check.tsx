"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Globe, LoaderCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REGIONS = [
  { code: "IAD", city: "Virginia", base: 38 },
  { code: "FRA", city: "Frankfurt", base: 92 },
  { code: "SIN", city: "Singapore", base: 188 },
  { code: "GRU", city: "São Paulo", base: 141 },
];

/** A stable pseudo-random number from a string, so the same domain always reads the same. */
function seed(text: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

type Result = { domain: string; regions: { code: string; city: string; ms: number }[]; tlsDays: number };

function check(raw: string): Result {
  const domain = raw.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  return {
    domain,
    regions: REGIONS.map((r, i) => ({ ...r, ms: Math.round(r.base * (0.8 + seed(domain, i) * 0.7)) })),
    tlsDays: 12 + Math.round(seed(domain, 9) * 76),
  };
}

/**
 * A closing call to action people actually use: type a domain, get an instant
 * check from four regions, then start monitoring it.
 */
export function CtaCheck({ className }: { className?: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  // Opens on a finished check, so the block shows what it does before anyone types.
  const [result, setResult] = useState<Result | null>(() => check("northwind.app"));
  const [sample, setSample] = useState(true);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy || !/\w+\.\w+/.test(url)) return;
    setBusy(true);
    setSample(false);
    setResult(null);
    setTimeout(() => {
      setResult(check(url));
      setBusy(false);
    }, 1100);
  };

  return (
    <section data-slot="cta-check" className={cn("relative overflow-hidden bg-white dark:bg-black px-6 py-28 sm:py-36", className)}>
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-6xl">
          Is your site up <span className="font-serif font-normal tracking-[-0.01em] italic">right now?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
          Check it from four continents in a second. If you like what you see, Beacon will keep checking every 30 seconds.
        </p>

        <form
          onSubmit={submit}
          className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-[18px] bg-neutral-50 p-1.5 pl-4 shadow-[0_1px_2px_rgb(0_0_0/0.05)] ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 transition-shadow focus-within:ring-blue-600/50 dark:focus-within:ring-blue-500/50 dark:bg-neutral-900"
        >
          <Globe className="size-4 shrink-0 text-neutral-500" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourcompany.com"
            aria-label="Website address"
            inputMode="url"
            className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-neutral-950 dark:text-neutral-50 outline-none placeholder:text-neutral-500"
          />
          <Button type="submit" tone="signal" disabled={busy} className="min-w-28">
            {busy ? <LoaderCircle className="animate-spin" /> : "Check"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-neutral-500">Free for 10 monitors. No card needed.</p>

        <div className="mx-auto mt-10 max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {result && (
              <motion.div
                key={result.domain}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-[20px] bg-neutral-50 text-left shadow-[0_1px_2px_rgb(0_0_0/0.05),0_24px_48px_-36px_var(--color-neutral-600)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.05),0_24px_48px_-36px_var(--color-black)] ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-950 dark:text-neutral-50">
                    <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--color-emerald-500)]" />
                    {result.domain} is up
                  </span>
                  <span className="text-xs text-neutral-500">{sample ? "Example check" : "200 OK"}</span>
                </div>
                <ul className="divide-y divide-neutral-950/[0.06] dark:divide-neutral-50/[0.06] border-y border-neutral-950/[0.06] dark:border-neutral-50/[0.06]">
                  {result.regions.map((r, i) => (
                    <motion.li
                      key={r.code}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.08 * i }}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm"
                    >
                      <span className="w-9 font-mono text-xs text-neutral-500">{r.code}</span>
                      <span className="flex-1 text-neutral-700 dark:text-neutral-300">{r.city}</span>
                      <span className="h-1 w-20 overflow-hidden rounded-full bg-neutral-950/10 dark:bg-neutral-50/10">
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (r.ms / 300) * 100)}%` }}
                          transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="block h-full rounded-full bg-neutral-950/50 dark:bg-neutral-50/50"
                        />
                      </span>
                      <span className="w-14 text-right text-neutral-900 dark:text-neutral-100 tabular-nums">{r.ms} ms</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <span className="flex items-center gap-2 text-xs text-neutral-500">
                    <Lock className="size-3.5" />
                    <span>
                      Certificate expires in{" "}
                      <span className={cn("font-medium", result.tlsDays < 30 ? "text-blue-600 dark:text-blue-500" : "text-neutral-800 dark:text-neutral-200")}>{result.tlsDays} days</span>
                    </span>
                  </span>
                  <Button size="sm" tone="ink">
                    Monitor it every 30s <ArrowRight />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <CtaCheck />;
}
