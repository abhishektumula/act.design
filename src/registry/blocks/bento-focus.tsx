"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, CloudOff, Laptop, Lock, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Meeting Bento's own look: six even tiles, each a small piece of the product
 * floating in the top half, with the copy sitting below. Soft raised surfaces
 * on a quiet ground, one warm accent, and in every tile one thing that moves
 * on its own while the tile is on screen.
 */

const accent = "text-orange-500 dark:text-orange-400";

function Tile({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] bg-neutral-100 p-2 dark:bg-neutral-900">
      <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-[18px] px-6">{children}</div>
      <div className="px-6 pt-4 pb-6">
        <h3 className="text-[17px] font-medium tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">{title}</h3>
        <p className="mt-1.5 max-w-sm text-[15px] leading-6 text-pretty text-neutral-500 dark:text-neutral-400">{body}</p>
      </div>
    </div>
  );
}

/** A raised card inside a tile: the product's own surface. */
const card = "rounded-[16px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_8px_24px_-12px_rgb(0_0_0/0.18)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_8px_24px_-12px_rgb(0_0_0/0.6)]";

/** Steps a counter while the tile is on screen; reduced motion parks it on `rest`. */
function useTicker(steps: number, ms: number, rest: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setN((s) => (s + 1) % steps), ms);
    return () => clearInterval(t);
  }, [inView, reduce, steps, ms]);
  return { ref, n: reduce ? rest : n, reduce };
}

/* 1. One shortcut: the combo presses itself, key by key, then lets go. */
function Shortcut() {
  const { ref, n } = useTicker(5, 650, 3);
  const keys = [
    { label: "⌘", sub: "command", w: "w-[76px]" },
    { label: "⇧", sub: "shift", w: "w-[76px]" },
    { label: "N", sub: "", w: "w-14" },
  ];
  return (
    <div ref={ref} className="flex items-end gap-2.5">
      {keys.map((k, i) => {
        const down = n > i && n < 4;
        return (
          <motion.span
            key={k.label}
            animate={{ y: down ? 3 : 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            className={cn(
              "flex h-14 flex-col justify-between rounded-[10px] px-2.5 py-2 text-left transition-[box-shadow,color] duration-150",
              k.w,
              down
                ? "bg-orange-50 text-orange-600 shadow-[0_0_0_1px_rgb(249_115_22/0.5),0_1px_0_rgb(249_115_22/0.4)] dark:bg-orange-500/10 dark:text-orange-400"
                : "bg-white text-neutral-700 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_3px_0_rgb(0_0_0/0.08)] dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_3px_0_rgb(0_0_0/0.5)]",
            )}
          >
            <span className="self-end text-[15px] leading-none">{k.label}</span>
            <span className="text-[10px] leading-none opacity-70">{k.sub}</span>
          </motion.span>
        );
      })}
    </div>
  );
}

/* 2. Joins the call: a live card with a waveform that never sits still. */
function LiveCall() {
  const reduce = useReducedMotion();
  const bars = [0.3, 0.6, 0.45, 0.9, 0.5, 0.75, 0.35, 0.8, 0.55, 0.4, 0.7, 0.5, 0.85, 0.3, 0.6, 0.45, 0.7, 0.35];
  return (
    <div className={cn(card, "w-full max-w-[300px] p-4")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] text-neutral-500">Now listening</p>
          <p className="mt-0.5 text-[14px] font-medium text-neutral-950 dark:text-neutral-50">Weekly product sync</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-[12px] font-medium text-orange-600 dark:text-orange-400">
          <span className="size-1.5 animate-pulse rounded-full bg-current" /> Live
        </span>
      </div>
      <div className="mt-4 flex h-8 items-center justify-between">
        {bars.map((b, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-neutral-300 dark:bg-neutral-600"
            initial={{ height: `${b * 100}%` }}
            animate={reduce ? undefined : { height: [`${b * 100}%`, `${(1 - b) * 80 + 20}%`, `${b * 100}%`] }}
            transition={{ duration: 0.9 + (i % 4) * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-950/[0.06] pt-3 dark:border-neutral-50/[0.07]">
        {["Zoom", "Meet", "Teams", "Huddles"].map((app, i) => (
          <span key={app} className={cn("rounded-full px-2.5 py-1 text-[11px]", i === 1 ? "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950" : "bg-neutral-950/[0.04] text-neutral-500 dark:bg-neutral-50/[0.06]")}>
            {app}
          </span>
        ))}
      </div>
    </div>
  );
}

/* 3. Knows who is who: the speaking marker moves from person to person. */
function Speakers() {
  const { ref, n } = useTicker(3, 1500, 0);
  const people = [
    { name: "Dana Alvarez", tone: "bg-amber-500", w: [78, 52] },
    { name: "Priya Shah", tone: "bg-sky-500", w: [64, 40] },
    { name: "Sam Okoro", tone: "bg-emerald-500", w: [70, 46] },
  ];
  return (
    <div ref={ref} className={cn(card, "w-full max-w-[300px] p-4")}>
      {people.map((p, i) => (
        <div key={p.name} className="flex items-start gap-3 py-2">
          <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white", p.tone)}>
            {p.name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{p.name}</span>
              <AnimatePresence>
                {n === i && (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={cn("flex items-end gap-[2px]", accent)}>
                    {[0, 1, 2].map((b) => (
                      <motion.span key={b} className="w-[2px] rounded-full bg-current" animate={{ height: [3, 9, 3] }} transition={{ duration: 0.6, repeat: Infinity, delay: b * 0.12 }} />
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span style={{ width: `${p.w[0]}%` }} className="mt-2 block h-[5px] rounded-full bg-neutral-950/[0.07] dark:bg-neutral-50/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* 4. Tasks with owners: the action items tick off one after another. */
function Tasks() {
  const { ref, n } = useTicker(5, 900, 3);
  const items = [
    { task: "Send the recap", who: "Dana", due: "Fri" },
    { task: "Share the roadmap draft", who: "Priya", due: "Thu" },
    { task: "Book the design review", who: "Sam", due: "Mon" },
  ];
  const done = Math.min(n, 3);
  return (
    <div ref={ref} className={cn(card, "w-full max-w-[300px] p-3")}>
      <div className="flex items-center justify-between px-1.5 pb-2 text-[12px]">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">Action items</span>
        <span className="text-neutral-500 tabular-nums">{done} of 3 done</span>
      </div>
      {items.map((it, i) => {
        const on = i < done;
        return (
          <div key={it.task} className="flex items-center gap-2.5 rounded-[10px] px-1.5 py-2">
            <motion.span animate={{ scale: on ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }} className={cn("grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-colors", on ? "bg-orange-500 text-white" : "ring-1 ring-neutral-950/20 dark:ring-neutral-50/20")}>
              {on && <Check className="size-3 stroke-[3]" />}
            </motion.span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-800 dark:text-neutral-200">
              <span className="relative">
                <span className={cn("transition-colors", on && "text-neutral-400")}>{it.task}</span>
                <motion.span className="absolute top-1/2 left-0 h-px bg-neutral-400" initial={false} animate={{ width: on ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
              </span>
            </span>
            <span className="text-[11px] text-neutral-500">
              {it.who} · {it.due}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* 5. Private by default: data sets off from the device and stops at the lock, every time. */
function Private() {
  const reduce = useReducedMotion();
  return (
    <div className="w-full max-w-[300px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <span className={cn(card, "grid size-14 place-items-center")}>
            <Laptop className="size-6 text-neutral-700 dark:text-neutral-200" />
          </span>
          <span className="text-[12px] text-neutral-700 dark:text-neutral-300">This device</span>
        </div>

        {/* The path: dots travel out and stop at the lock */}
        <div className="relative mx-2 -mt-6 h-6 flex-1">
          <svg aria-hidden viewBox="0 0 120 24" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <line x1="0" y1="12" x2="120" y2="12" strokeDasharray="2 4" className="stroke-neutral-950/20 dark:stroke-neutral-50/20" />
          </svg>
          {!reduce &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-orange-500"
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: ["0%", "46%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.53, ease: "easeIn", times: [0, 0.2, 0.85, 1] }}
              />
            ))}
          <span className="absolute top-1/2 left-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/30 dark:text-orange-400">
            <Lock className="size-3.5" />
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="grid size-14 place-items-center rounded-[16px] border border-dashed border-neutral-950/20 dark:border-neutral-50/20">
            <CloudOff className="size-6 text-neutral-400" />
          </span>
          <span className="text-[12px] text-neutral-500">Cloud</span>
        </div>
      </div>
      <div className={cn(card, "mt-6 flex items-center justify-between px-4 py-3 text-[13px]")}>
        <span className="text-neutral-500">Sent this month</span>
        <span className="font-medium text-neutral-950 dark:text-neutral-50">0 bytes</span>
      </div>
    </div>
  );
}

/* 6. Instant search: the query types itself, the matches light up. */
function Find() {
  const QUERY = "launch date";
  const { ref, n } = useTicker(QUERY.length + 8, 110, QUERY.length + 7);
  const typed = QUERY.slice(0, Math.min(n, QUERY.length));
  const found = n >= QUERY.length;
  const results = [
    ["Product sync", "Aug 14", "we moved the", "launch date", "to the 28th"],
    ["Team standup", "Jul 29", "confirm the", "launch", "checklist by Friday"],
  ];
  return (
    <div ref={ref} className={cn(card, "w-full max-w-[300px] p-2")}>
      <div className="flex h-10 items-center gap-2.5 rounded-[10px] bg-neutral-950/[0.04] px-3 dark:bg-neutral-50/[0.06]">
        <Search className="size-4 text-neutral-400" />
        <span className="flex-1 text-[13px] text-neutral-950 dark:text-neutral-50">
          {typed}
          <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-current" />
        </span>
        <kbd className="rounded-[5px] bg-white px-1.5 py-0.5 text-[10px] text-neutral-500 shadow-[0_0_0_1px_rgb(0_0_0/0.08)] dark:bg-neutral-700">⌘K</kbd>
      </div>
      <div className="px-2 pt-2 pb-1">
        {results.map(([title, date, before, hit, after], i) => (
          <motion.div key={title} initial={false} animate={{ opacity: found ? 1 : 0.35 }} transition={{ duration: 0.3, delay: found ? i * 0.1 : 0 }} className="py-2 text-[12px] leading-5">
            <p>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{title}</span> <span className="text-neutral-400">{date}</span>
            </p>
            <p className="truncate text-neutral-500">
              {before} <span className={cn("rounded-[4px] px-0.5 transition-colors duration-300", found ? "bg-orange-500/15 text-orange-700 dark:text-orange-300" : "")}>{hit}</span> {after}
            </p>
          </motion.div>
        ))}
        <p className="pt-1 text-[11px] text-neutral-400">{found ? "38 results · 0.2 seconds" : "Searching…"}</p>
      </div>
    </div>
  );
}

/**
 * A six-tile bento for an AI meeting notetaker. Each tile floats one small
 * piece of the product above its copy and runs one micro-animation while it's
 * on screen: a shortcut pressing itself, a live waveform, the speaking marker
 * moving between people, action items ticking off, data stopping at a lock on
 * its way out, and a search typing itself and lighting its matches.
 */
export function BentoFocus({ className }: { className?: string }) {
  return (
    <section data-slot="bento-focus" className={cn("bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-neutral-950 sm:text-[42px] dark:text-neutral-50">Every meeting, written down for you.</h2>
          <p className="mt-4 text-[16px] leading-7 text-pretty text-neutral-500">Murmur listens in, keeps the notes and chases the follow-ups, without leaving your laptop.</p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Tile title="One shortcut" body="Start from anywhere with a single key combo. No window to find.">
            <Shortcut />
          </Tile>
          <Tile title="Joins any call" body="Works with the meeting apps your team already uses, nothing to install.">
            <LiveCall />
          </Tile>
          <Tile title="Knows who is who" body="Voices are matched to your calendar, so names are right the first time.">
            <Speakers />
          </Tile>
          <Tile title="Tasks with owners" body="Every follow-up gets a person and a due date, linked back to the moment it came from.">
            <Tasks />
          </Tile>
          <Tile title="Private by default" body="Recordings stay on your device. Nothing leaves unless you share it.">
            <Private />
          </Tile>
          <Tile title="Instant search" body="Find a number, a name or a decision across every meeting in seconds.">
            <Find />
          </Tile>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <BentoFocus />;
}
