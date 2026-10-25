"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CreditCard, Database, GitBranch, Mail, MessageSquare, MousePointer2, Zap } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

function Cell({
  title,
  body,
  visual,
  className,
}: {
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <SpotlightCard className={cn("h-full", className)} contentClassName="flex h-full flex-col">
      <div className="relative flex h-56 items-center justify-center overflow-hidden">{visual}</div>
      <div className="p-6 pt-0">
        <h3 className="text-base font-medium text-base-100">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-pretty text-base-500">{body}</p>
      </div>
    </SpotlightCard>
  );
}

/* ---------- visuals ---------- */

const dots = Array.from({ length: 22 * 9 }, (_, i) => i);
const live = [27, 52, 80, 101, 125, 148, 160];

function EdgeMap() {
  return (
    <div className="grid grid-cols-[repeat(22,minmax(0,1fr))] gap-2.5 px-6">
      {dots.map((i) => {
        const on = live.includes(i);
        return (
          <span key={i} className="relative grid size-1.5 place-items-center">
            <span className={cn("size-1.5 rounded-full", on ? "bg-blue-500" : "bg-base-800")} />
            {on && (
              <motion.span
                className="absolute size-1.5 rounded-full bg-blue-500"
                animate={{ scale: [1, 4], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: (i % 7) * 0.3, ease: "easeOut" }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

const cursors = [
  { name: "Maya", color: "bg-violet-500", text: "text-violet-500", path: { x: [0, 60, 20, 0], y: [0, 30, 70, 0] }, at: "top-8 left-10" },
  { name: "Leo", color: "bg-amber-500", text: "text-amber-500", path: { x: [0, -50, -20, 0], y: [0, 40, -10, 0] }, at: "top-24 right-14" },
];

function Cursors() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 space-y-2.5">
        {[80, 64, 72, 40].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full bg-base-900" style={{ width: `${w}%` }} />
        ))}
      </div>
      {cursors.map((c) => (
        <motion.div
          key={c.name}
          className={cn("absolute", c.at)}
          animate={c.path}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <MousePointer2 className={cn("size-4 fill-current", c.text)} />
          <span className={cn("ml-3 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white", c.color)}>{c.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

const alerts = [
  { icon: CreditCard, title: "New subscription", meta: "Pro · $49/mo", tone: "from-emerald-400 to-emerald-600" },
  { icon: Mail, title: "Invoice paid", meta: "Acme Inc · $1,200", tone: "from-sky-400 to-sky-600" },
  { icon: Bell, title: "Usage spike", meta: "API · +340% in 5m", tone: "from-amber-300 to-amber-500" },
  { icon: MessageSquare, title: "New reply", meta: "Support · #4821", tone: "from-violet-400 to-violet-600" },
];

function AlertStack() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), 2200);
    return () => clearInterval(t);
  }, []);
  const visible = [0, 1, 2].map((k) => alerts[(i + k) % alerts.length]);

  return (
    <div className="relative h-36 w-64">
      <AnimatePresence initial={false}>
        {visible.map((a, k) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={i + k}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: k * 14, scale: 1 - k * 0.05, zIndex: 3 - k }}
              exit={{ opacity: 0, y: 48, scale: 0.85 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-2xl bg-base-900 p-3 shadow-lg shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
            >
              <span className={cn("grid size-8 place-items-center rounded-lg bg-linear-to-b text-white", a.tone)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-base-100">{a.title}</p>
                <p className="truncate text-xs text-base-500">{a.meta}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const orbit = [Database, GitBranch, Mail, CreditCard, MessageSquare, Bell];

function Integrations() {
  return (
    <div className="relative grid size-48 place-items-center">
      <div className="absolute inset-0 rounded-full ring-1 ring-base-50/5" />
      <div className="absolute inset-8 rounded-full ring-1 ring-base-50/5" />
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {orbit.map((Icon, i) => {
          const a = (i / orbit.length) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute grid size-9 place-items-center rounded-xl bg-base-900 text-base-300 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
              style={{ left: "50%", top: "50%", marginLeft: Math.round(Math.cos(a) * 96) - 18, marginTop: Math.round(Math.sin(a) * 96) - 18 }}
            >
              <Icon className="size-4" />
            </motion.span>
          );
        })}
      </motion.div>
      <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/40">
        <Zap className="size-6 fill-current" />
      </span>
    </div>
  );
}

const uptime = Array.from({ length: 40 }, (_, i) => (i === 23 ? "amber" : i === 31 ? "rose" : "ok"));

function Uptime() {
  return (
    <div className="w-full px-6">
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold tracking-tight text-base-50 tabular-nums">99.99%</span>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 animate-pulse rounded-full bg-current" /> Operational
        </span>
      </div>
      <div className="mt-4 flex h-10 gap-[3px]">
        {uptime.map((s, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.015 }}
            className={cn(
              "flex-1 origin-bottom rounded-sm transition-opacity hover:opacity-70",
              s === "ok" ? "bg-emerald-500" : s === "amber" ? "bg-amber-400" : "bg-rose-500",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-base-600">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export function BentoGrid({
  title = "Everything you need. Nothing you don't.",
  body = "A complete platform that stays out of your way, from the first deploy to the millionth request.",
  className,
}: {
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <section data-slot="bento-grid" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-base-400">{body}</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Cell
            className="md:col-span-2"
            title="On the edge, everywhere"
            body="Requests are served from the closest of 38 regions. Cold starts are a rumour."
            visual={<EdgeMap />}
          />
          <Cell title="Multiplayer by default" body="See who is editing, where, in real time." visual={<Cursors />} />
          <Cell title="Alerts that matter" body="Signal, not noise. Only what changed." visual={<AlertStack />} />
          <Cell title="Plays well with others" body="40+ integrations, one click each." visual={<Integrations />} />
          <Cell title="Boringly reliable" body="Four nines, with a public status history." visual={<Uptime />} />
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <BentoGrid />;
}
