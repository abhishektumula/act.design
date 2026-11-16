"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Crosses } from "./frame";
import { hairGrid } from "./styles";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** A grey placeholder bar, the building block of every fake UI here. */
function Bone({ className = "" }: { className?: string }) {
  return <span className={cn("block h-2 rounded-[2px] bg-base-50/[0.08]", className)} />;
}

/** A fake application window with a title strip. */
function Window({ title, meta, children, className = "" }: { title: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-md bg-canvas/60 ring-1 ring-base-50/[0.08] ${className}`}>
      <div className="flex items-center justify-between border-b border-base-50/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 rounded-full bg-base-50/[0.12]" />
            ))}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-base-500">{title}</span>
        </div>
        {meta && <span className="font-mono text-[10px] tracking-wider text-base-600">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function Feature({
  index,
  label,
  title,
  body,
  children,
  className = "",
}: {
  index: string;
  label: string;
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`group relative flex flex-col bg-base-950 ${className}`}>
      {/* The illustration */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden px-6 pt-10 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--base-800)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)] bg-[size:14px_14px] opacity-60" />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
      {/* The copy */}
      <div className="mt-auto p-6 pt-8 sm:p-8">
        <p className="font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase">
          <span className="text-signal">{index}</span> / {label}
        </p>
        <h3 className="mt-3 text-xl font-medium tracking-[-0.02em] text-base-50">{title}</h3>
        <p className="mt-2 max-w-md text-[15px] leading-7 text-pretty text-base-500">{body}</p>
      </div>
    </article>
  );
}

/** Ticks forward through `values` on an interval, unless motion is reduced. */
function useCycle<T>(values: T[], ms: number) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % values.length), ms);
    return () => clearInterval(id);
  }, [reduce, values.length, ms]);
  return values[i];
}

/* ------------------------------------------------------------------ */
/* Illustrations                                                       */
/* ------------------------------------------------------------------ */

const SPRING = "M16 104 C 70 104, 92 -6, 150 16 S 214 30, 304 24";
const LINEAR = "M16 104 L 304 24";

function WeightArt() {
  const reduce = useReducedMotion();
  return (
    <Window title="motion.inspect" meta="spring">
      <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
        <svg viewBox="0 0 320 120" className="w-full overflow-visible" aria-hidden>
          {[24, 64, 104].map((y) => (
            <line key={y} x1="16" x2="304" y1={y} y2={y} className="stroke-base-50/[0.06]" strokeDasharray="2 4" />
          ))}
          <path d={LINEAR} fill="none" className="stroke-base-50/15" strokeWidth="1.25" strokeDasharray="3 4" />
          <path d={SPRING} fill="none" stroke="var(--signal)" strokeWidth="1.75" strokeLinecap="round" />
          <circle r="4.5" fill="var(--signal)" cx={reduce ? 304 : undefined} cy={reduce ? 24 : undefined}>
            {!reduce && <animateMotion dur="2.6s" repeatCount="indefinite" path={SPRING} keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="spline" keySplines="0.3 0 0.2 1;0 0 1 1" />}
          </circle>
          <circle r="7" fill="none" stroke="var(--signal)" strokeOpacity="0.35" cx={reduce ? 304 : undefined} cy={reduce ? 24 : undefined}>
            {!reduce && <animateMotion dur="2.6s" repeatCount="indefinite" path={SPRING} keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="spline" keySplines="0.3 0 0.2 1;0 0 1 1" />}
          </circle>
        </svg>
        <dl className="w-24 space-y-3 border-l border-base-50/[0.06] pl-4 font-mono text-[10px] text-base-500 max-sm:hidden">
          {[
            ["stiffness", "260", "w-[72%]"],
            ["damping", "26", "w-[34%]"],
            ["mass", "1.0", "w-[50%]"],
          ].map(([k, v, w]) => (
            <div key={k}>
              <div className="flex justify-between">
                <dt>{k}</dt>
                <dd className="text-base-200">{v}</dd>
              </div>
              <div className="mt-1.5 h-0.5 bg-base-50/[0.06]">
                <div className={`h-full bg-base-400 ${w}`} />
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex gap-4 border-t border-base-50/[0.06] px-4 py-2 font-mono text-[10px] text-base-600">
        <span className="flex items-center gap-1.5">
          <span className="h-px w-3 bg-signal" /> spring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-3 border-t border-dashed border-base-500" /> linear
        </span>
      </div>
    </Window>
  );
}

const TICKS = 41;
const STOPS = [8, 20, 31, 20];

function DetentsArt() {
  const at = useCycle(STOPS, 1400);
  return (
    <Window title="fader.tsx" meta={`${(at / (TICKS - 1)).toFixed(3)}`}>
      <div className="px-4 pt-6 pb-4">
        <div className="relative flex h-14 items-end justify-between">
          {Array.from({ length: TICKS }, (_, i) => {
            const major = i % 10 === 0;
            const d = Math.abs(i - at);
            return (
              <motion.span
                key={i}
                className="w-px origin-bottom rounded-full"
                animate={{
                  height: major ? 26 : 14,
                  scaleY: d === 0 ? 1.9 : d === 1 ? 1.35 : d === 2 ? 1.12 : 1,
                  backgroundColor: i <= at ? "var(--signal)" : "color-mix(in oklab, var(--base-50) 18%, transparent)",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 30, delay: Math.min(d, 6) * 0.012 }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex justify-between font-mono text-[9px] text-base-600">
          {["0", ".25", ".50", ".75", "1"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-base-50/[0.06] px-4 py-2.5">
        <Bone className="w-16" />
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-base-400">
          <span className="size-1 rounded-full bg-signal" /> snap · step 0.025
        </span>
      </div>
    </Window>
  );
}

function QuietArt() {
  const reduce = useReducedMotion();
  return (
    <Window title="settings" meta="3 fields">
      <div className="space-y-4 p-4">
        {[0, 1].map((r) => (
          <div key={r} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Bone className={r ? "w-20" : "w-28"} />
              <Bone className="h-1.5 w-36 opacity-60" />
            </div>
            <span className="h-4 w-7 rounded-full bg-base-50/[0.08]" />
          </div>
        ))}
        <div className="rounded-[4px] p-3 ring-1 ring-signal/30">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-base-300">volume</span>
            <span className="text-signal">in motion</span>
          </div>
          <div className="relative mt-3 h-1 rounded-full bg-base-50/[0.08]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-signal"
              initial={{ width: "62%" }}
              animate={reduce ? undefined : { width: ["28%", "74%", "62%", "28%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 0.55, 1] }}
            >
              <span className="absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-base-50 shadow ring-2 ring-signal" />
            </motion.div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <span className="h-6 w-14 rounded-[4px] ring-1 ring-base-50/10" />
          <span className="h-6 w-14 rounded-[4px] bg-base-50/80" />
        </div>
      </div>
    </Window>
  );
}

const SCALE = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

function RestraintArt() {
  return (
    <Window title="tokens.css" meta="12 vars">
      <div className="p-4">
        <div className="flex gap-1">
          {SCALE.map((s) => (
            <span key={s} className="h-8 flex-1 rounded-[2px] ring-1 ring-base-50/[0.06]" style={{ background: `var(--base-${s})` }} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-base-600">
          <span>base-50</span>
          <span>base-950</span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[4px] p-3 ring-1 ring-base-50/[0.08]">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-[4px] bg-signal">
            <span className="absolute inset-0 rounded-[4px] bg-signal motion-safe:animate-ping motion-safe:[animation-duration:2.4s] opacity-30" />
          </span>
          <div className="flex-1 space-y-1.5">
            <Bone className="w-24" />
            <Bone className="h-1.5 w-full opacity-60" />
          </div>
          <span className="font-mono text-[10px] text-signal">signal</span>
        </div>
      </div>
    </Window>
  );
}

const CODE: [number, string][] = [
  [0, "import { Dial } from \"@/components/ui/dial\""],
  [0, ""],
  [0, "export function Volume() {"],
  [1, "return ("],
  [2, "<Dial label=\"Gain\" min={0} max={100}"],
  [3, "step={1} defaultValue={64} />"],
  [1, ")"],
  [0, "}"],
];

function OwnArt() {
  return (
    <Window title="components/ui/dial.tsx" meta="tsx">
      <div className="grid grid-cols-[auto_1fr] font-mono text-[10.5px] leading-[1.9]">
        <div className="border-r border-base-50/[0.06] px-3 py-3 text-right text-base-700 select-none">
          {CODE.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="overflow-hidden px-3 py-3 text-base-400">
          {CODE.map(([indent, line], i) => (
            <div key={i} style={{ paddingLeft: `${indent}ch` }} className="truncate">
              {line.startsWith("<Dial") ? (
                <>
                  <span className="text-signal">&lt;Dial</span>
                  {line.slice(5)}
                </>
              ) : (
                line || " "
              )}
            </div>
          ))}
        </pre>
      </div>
      <div className="flex items-center justify-between border-t border-base-50/[0.06] px-3 py-2 font-mono text-[10px] text-base-500">
        <span>
          <span className="text-signal">✓</span> copied 1 file · 0 packages
        </span>
        <span className="text-base-600">yours now</span>
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Features() {
  return (
    <div className="relative mt-16">
      <Crosses />
      <div className={`${hairGrid} md:grid-cols-2 lg:grid-cols-3`}>
        <Feature
          index="01"
          label="Weight"
          title="Springs with mass, never linear tweens."
          body="Things should feel like they cost something to move. Every transition is a spring you can tune, so it overshoots a touch and settles."
          className="lg:col-span-2"
        >
          <WeightArt />
        </Feature>
        <Feature
          index="02"
          label="Detents"
          title="Values click into place."
          body="Ticks light up, numbers roll, and limits push back instead of going quiet."
        >
          <DetentsArt />
        </Feature>
        <Feature
          index="03"
          label="Quiet"
          title="Motion where it means something."
          body="Buttons don’t bounce. Movement is saved for the things you drag, turn and fling."
        >
          <QuietArt />
        </Feature>
        <Feature
          index="04"
          label="Restraint"
          title="One accent, warm neutrals."
          body="Eleven greys and a single signal colour. Real whitespace does the rest."
        >
          <RestraintArt />
        </Feature>
        <Feature
          index="05"
          label="Ownership"
          title="Copy it. It’s yours."
          body="No package to fight. Each piece is one file you paste in and change however you like."
        >
          <OwnArt />
        </Feature>
      </div>
    </div>
  );
}
