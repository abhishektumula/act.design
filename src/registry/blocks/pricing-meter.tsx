"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Pricing's own look: an architect's drawing. Dashed construction lines frame
 * every column and run off past the block's edges, the featured plan has a
 * point of light travelling round its border, prices blur in when the billing
 * pill slides, and the buttons are flat: white on the featured plan, outline
 * for the rest.
 */

type Billing = "monthly" | "yearly";

const plans = [
  {
    id: "free",
    name: "Free",
    blurb: "For trying it on a weekend.",
    price: { monthly: 0, yearly: 0 },
    features: ["10 videos a month", "720p", "Every voice and style"],
    cta: "Start free",
  },
  {
    id: "team",
    name: "Team",
    blurb: "For a team shipping every week.",
    price: { monthly: 29, yearly: 24 },
    features: ["50 videos a month", "Up to 4K", "3 seats included", "Brand kit", "No watermark"],
    cta: "Start a 14-day trial",
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    blurb: "For brands at volume.",
    price: { monthly: 119, yearly: 99 },
    features: ["250 videos a month", "Up to 8K", "10 seats included", "API access", "Priority renders"],
    cta: "Talk to sales",
  },
];

/** A dashed construction line. Horizontal ones run past both edges of the block. */
function Rule({ vertical, className }: { vertical?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute text-neutral-950/15 dark:text-neutral-50/15",
        vertical
          ? "-top-24 -bottom-24 w-px bg-[linear-gradient(to_bottom,currentColor_50%,transparent_0)] bg-[length:1px_8px] [mask-image:linear-gradient(to_bottom,transparent,black_6rem,black_calc(100%-6rem),transparent)]"
          : "-right-[50vw] -left-[50vw] h-px bg-[linear-gradient(to_right,currentColor_50%,transparent_0)] bg-[length:8px_1px] [mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)]",
        className,
      )}
    />
  );
}

/** A soft point of light that travels round the featured card's border, forever. */
function Beam() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <defs>
        <linearGradient id="pricing-beam" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="calc(100% - 1.5px)" height="calc(100% - 1.5px)" rx="15.5" pathLength={100} fill="none" stroke="url(#pricing-beam)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="12 88" className="[animation:pricing-beam_7s_linear_infinite]" />
      <style>{`@keyframes pricing-beam { to { stroke-dashoffset: -100; } }`}</style>
    </svg>
  );
}

/** The price: digits blur in from below when they change; the currency sign hangs outside. */
function Price({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[1em] items-baseline leading-none">
      <span className="absolute top-[0.1em] right-full mr-0.5 text-[0.4em] font-medium opacity-50">$</span>
      <span className="inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "45%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-45%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/**
 * Three plans for an AI video tool, drawn like a blueprint: dashed
 * construction lines frame the columns and run off the page, a sliding pill
 * switches billing and the prices blur over, and the featured plan has light
 * travelling round its edge. A studio row underneath covers everything bigger.
 */
export function PricingMeter({ className }: { className?: string }) {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <section data-slot="pricing-meter" className={cn("overflow-hidden bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-[36px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-neutral-950 sm:text-[48px] dark:text-neutral-50">Render as much as you like.</h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-7 text-pretty text-neutral-500">Every voice, style and avatar on every plan. Commercial rights to everything you make.</p>

          {/* Billing: a pill with a sliding thumb */}
          <div role="radiogroup" aria-label="Billing" className="mt-9 inline-flex rounded-full bg-neutral-100 p-1 dark:bg-neutral-900">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={billing === b}
                onClick={() => setBilling(b)}
                className={cn("relative h-9 rounded-full px-5 text-[14px] font-medium capitalize transition-colors outline-none", billing === b ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200")}
              >
                {billing === b && <motion.span layoutId="pricing-billing" transition={{ type: "spring", stiffness: 500, damping: 38 }} className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)] dark:bg-neutral-800" />}
                <span className="relative">
                  {b}
                  {b === "yearly" && <span className="ml-1.5 text-[12px] text-sky-600 dark:text-sky-400">−17%</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* The plans, inside their construction lines */}
        <div className="relative mt-16">
          <Rule className="top-0" />
          <Rule className="bottom-0" />
          <Rule vertical className="left-0" />
          <Rule vertical className="right-0" />
          <Rule vertical className="left-1/3 hidden md:block" />
          <Rule vertical className="left-2/3 hidden md:block" />

          <div className="grid md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} className="relative p-3">
                <div className={cn("relative flex h-full flex-col rounded-[16px] p-6", p.featured ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-900" : "text-neutral-950 dark:text-neutral-50")}>
                  {p.featured && <Beam />}
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold">{p.name}</span>
                    {p.featured && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[12px] text-neutral-300">Most teams</span>}
                  </div>
                  <p className={cn("mt-1 text-[14px]", p.featured ? "text-neutral-400" : "text-neutral-500")}>{p.blurb}</p>
                  <p className="mt-8 flex items-baseline gap-2 pl-3 text-[52px] font-semibold tracking-[-0.04em]">
                    <Price value={p.price[billing]} />
                    <span className={cn("text-[14px] font-normal tracking-normal", p.featured ? "text-neutral-400" : "text-neutral-500")}>/ month</span>
                  </p>
                  <ul className="mt-8 mb-10 space-y-3 text-[14px]">
                    {p.features.map((f) => (
                      <li key={f} className={cn("flex items-center gap-2.5", p.featured ? "text-neutral-200" : "text-neutral-700 dark:text-neutral-300")}>
                        <Check className={cn("size-4 shrink-0", p.featured ? "text-sky-400" : "text-neutral-400")} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={cn(
                      "mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
                      
                      p.featured ? "bg-white text-neutral-950 hover:bg-neutral-200" : "border border-neutral-950/15 text-neutral-900 hover:border-neutral-950/40 dark:border-neutral-50/15 dark:text-neutral-100 dark:hover:border-neutral-50/40",
                    )}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Everything bigger, as one line */}
        <div className="relative flex flex-col gap-5 px-9 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Rule className="bottom-0" />
          <div>
            <p className="text-[15px] font-semibold text-neutral-950 dark:text-neutral-50">Studio</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-neutral-500">
              Unlimited renders <Plus className="size-3 text-neutral-400" /> custom voices <Plus className="size-3 text-neutral-400" /> on-prem rendering
            </p>
          </div>
          <a href="#" className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-950 dark:text-neutral-50">
            Talk to us <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <PricingMeter />;
}
