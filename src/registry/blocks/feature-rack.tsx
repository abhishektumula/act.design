"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Headset, Mail, MessageCircle, Package, Phone, ReceiptText, Smartphone, Ticket, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Feature List's own look: minimal, and wired. Three plain features on the
 * left; on the right a diagram where every channel a customer writes from is
 * wired to the agent and the agent to the tools it acts in. Light pulses run
 * along the wires, each lighting the node it arrives at.
 */

const W = 520;
const H = 400;
const HUB = { x: 260, y: 200 };

type Node = { id: string; label: string; icon: LucideIcon; x: number; y: number };

const IN: Node[] = [
  { id: "chat", label: "Chat", icon: MessageCircle, x: 56, y: 60 },
  { id: "email", label: "Email", icon: Mail, x: 56, y: 150 },
  { id: "phone", label: "Phone", icon: Phone, x: 56, y: 250 },
  { id: "sms", label: "SMS", icon: Smartphone, x: 56, y: 340 },
];
const OUT: Node[] = [
  { id: "orders", label: "Orders", icon: Package, x: 464, y: 100 },
  { id: "refunds", label: "Refunds", icon: ReceiptText, x: 464, y: 200 },
  { id: "helpdesk", label: "Your team", icon: Ticket, x: 464, y: 300 },
];

/** A soft S-curve between two points, leaving and arriving horizontally. */
const wire = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
};

/** A wire: a faint track and a short bright pulse that runs along it on a loop. */
function Wire({ d, delay, duration, reduce }: { d: string; delay: number; duration: number; reduce: boolean | null }) {
  return (
    <g>
      <path d={d} fill="none" strokeWidth="1" className="stroke-neutral-950/10 dark:stroke-neutral-50/10" />
      {!reduce && (
        <motion.path
          d={d}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          stroke="url(#feature-beam)"
          pathLength={1}
          strokeDasharray="0.18 1"
          initial={{ strokeDashoffset: 0.18 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ duration, delay, repeat: Infinity, repeatDelay: 1.6, ease: [0.45, 0, 0.2, 1] }}
        />
      )}
    </g>
  );
}

/** A node on the diagram; it lights briefly each time a pulse arrives. */
function Dot({ node, delay, period, side, reduce }: { node: Node; delay: number; period: number; side: "in" | "out"; reduce: boolean | null }) {
  const Icon = node.icon;
  return (
    <div style={{ left: `${(node.x / W) * 100}%`, top: `${(node.y / H) * 100}%` }} className={cn("absolute flex -translate-y-1/2 items-center gap-2.5", side === "in" ? "-translate-x-[18px]" : "-translate-x-[18px] flex-row")}>
      <span className="relative grid size-9 place-items-center rounded-full bg-white ring-1 ring-neutral-950/10 dark:bg-neutral-900 dark:ring-neutral-50/10">
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-orange-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.7, delay, repeat: Infinity, repeatDelay: period - 0.7, ease: "easeOut" }}
          />
        )}
        <Icon className="size-4 text-neutral-600 dark:text-neutral-300" />
      </span>
      <span className="hidden text-[13px] whitespace-nowrap text-neutral-500 sm:block">{node.label}</span>
    </div>
  );
}

const features = [
  { title: "It does the thing", body: "Refunds, address changes and rebookings, done inside your own tools, not promised in a reply." },
  { title: "Knows when to step back", body: "Angry, unusual or expensive asks go straight to your team, with the whole thread attached." },
  { title: "One agent, every channel", body: "Chat, email, phone and SMS share one memory, so nobody explains twice." },
];

/**
 * The feature section for an AI support agent, kept minimal: three plain
 * features beside a wiring diagram. Every channel is wired to the agent and
 * the agent to the tools it acts in; light pulses run along the wires on a
 * loop, in from the channels and out to the tools, lighting each node they
 * reach. Reduced motion shows the wiring still.
 */
export function FeatureRack({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, margin: "-80px" });
  const RUN = 1.4;
  const PERIOD = RUN + 1.6;

  return (
    <section data-slot="feature-rack" className={cn("bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
      <div ref={ref} className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="max-w-md text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-neutral-950 sm:text-[42px] dark:text-neutral-50">Support that answers, then acts.</h2>
          <dl className="mt-12 space-y-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={on ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.25, 0.8, 0.25, 1] }}
                className="border-l border-neutral-950/10 pl-5 dark:border-neutral-50/10"
              >
                <dt className="text-[15px] font-medium text-neutral-950 dark:text-neutral-50">{f.title}</dt>
                <dd className="mt-1.5 max-w-sm text-[15px] leading-6 text-neutral-500">{f.body}</dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {/* The wiring */}
        <div aria-hidden className="relative mx-auto aspect-[520/400] w-full max-w-[560px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id="feature-beam" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fb923c" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fb923c" />
                <stop offset="1" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            {IN.map((n, i) => (
              <Wire key={n.id} d={wire({ x: n.x + 18, y: n.y }, { x: HUB.x - 34, y: HUB.y })} delay={i * 0.35} duration={RUN} reduce={reduce || !on} />
            ))}
            {OUT.map((n, i) => (
              <Wire key={n.id} d={wire({ x: HUB.x + 34, y: HUB.y }, { x: n.x - 18, y: n.y })} delay={RUN + i * 0.35} duration={RUN} reduce={reduce || !on} />
            ))}
          </svg>

          {IN.map((n, i) => (
            <Dot key={n.id} node={n} side="in" delay={i * 0.35} period={PERIOD} reduce={reduce || !on} />
          ))}
          {OUT.map((n, i) => (
            <Dot key={n.id} node={n} side="out" delay={RUN * 2 + i * 0.35} period={PERIOD} reduce={reduce || !on} />
          ))}

          {/* The agent */}
          <div style={{ left: `${(HUB.x / W) * 100}%`, top: `${(HUB.y / H) * 100}%` }} className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center">
            {!reduce && on && (
              <motion.span
                className="absolute size-[68px] rounded-[20px] ring-1 ring-orange-400/50"
                animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <span className="relative grid size-[68px] place-items-center rounded-[20px] bg-neutral-950 text-white shadow-[0_10px_30px_-10px_rgb(249_115_22/0.6)] dark:bg-neutral-50 dark:text-neutral-950">
              <Headset className="size-7" />
            </span>
            <span className="absolute top-full mt-3 text-[13px] font-medium whitespace-nowrap text-neutral-950 dark:text-neutral-50">Halo</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <FeatureRack />;
}
