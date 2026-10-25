"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, BarChart3, Check, Home, Inbox, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const bars = [38, 52, 44, 68, 58, 76, 64, 88, 72, 94, 82, 100];

function AppMockup() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
        className="overflow-hidden rounded-2xl bg-base-950 shadow-2xl shadow-shade/60 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
      >
        {/* Window chrome */}
        <div className="flex h-10 items-center gap-1.5 border-b border-base-50/5 px-4">
          {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((c) => (
            <span key={c} className={cn("size-2.5 rounded-full", c)} />
          ))}
          <span className="mx-auto h-5 w-40 rounded-md bg-base-900 ring-1 ring-base-50/5" />
        </div>
        <div className="flex">
          <aside className="hidden w-14 flex-col items-center gap-2 border-r border-base-50/5 py-4 sm:flex">
            {[Home, BarChart3, Inbox, Users, Settings].map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  "grid size-9 place-items-center rounded-lg text-base-500",
                  i === 1 && "bg-base-900 text-base-100 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
                )}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </aside>
          <div className="min-w-0 flex-1 p-5">
            <p className="text-xs text-base-500">Monthly revenue</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-base-50 tabular-nums">$48,290</span>
              <span className="flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" /> 12.4%
              </span>
            </div>
            <div className="mt-6 flex h-40 items-end gap-1.5">
              {bars.map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.7, ease }}
                  className={cn(
                    "flex-1 rounded-t-md",
                    i === bars.length - 1
                      ? "bg-linear-to-t from-blue-600 to-blue-400 inset-shadow-2xs inset-shadow-white/40"
                      : "bg-base-800 hover:bg-base-700",
                  )}
                />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Customers", "2,340"],
                ["Churn", "1.2%"],
                ["MRR", "$12.8k"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-base-900/60 p-3 ring-1 ring-base-50/5">
                  <p className="text-[11px] text-base-500">{k}</p>
                  <p className="mt-0.5 text-sm font-medium text-base-100 tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 24, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", bounce: 0.3 }}
        className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-base-900 p-3 pr-5 shadow-xl shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 sm:-left-10"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-linear-to-b from-emerald-400 to-emerald-600 text-neutral-950 inset-shadow-2xs inset-shadow-white/40">
          <Check className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-base-100">Payout sent</p>
          <p className="text-xs text-base-500">$8,240 to Mercury ••42</p>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSplit({
  title = "Revenue analytics your whole team can read.",
  body = "Connect Stripe in a minute. Get a calm dashboard, weekly digests and alerts that only fire when something actually changed.",
  className,
}: {
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <section data-slot="hero-split" className={cn("relative overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            <span className="size-1.5 rounded-full bg-current" /> Now with forecasts
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="mt-5 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-base-50 sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="mt-6 max-w-lg text-lg leading-8 text-pretty text-base-400"
          >
            {body}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a
              href="#"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-b from-blue-500 to-blue-600 px-5 text-sm font-medium text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30 transition-transform active:scale-[0.97]"
            >
              Start free trial <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex h-11 items-center rounded-xl bg-linear-to-b from-base-800 to-base-900 px-5 text-sm font-medium text-base-100 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 transition-transform active:scale-[0.97]"
            >
              Book a demo
            </a>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-500"
          >
            {["No card required", "SOC 2 Type II", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>
        <div className="[perspective:1200px]">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <HeroSplit />;
}
