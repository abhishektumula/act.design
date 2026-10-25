"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Preview } from "@/registry/previews";
import { getItem } from "@/registry/meta";
import { Fit } from "./fit";

const specimens = [
  { slug: "world-card", hint: "Drag across the sky to scrub the day", verbs: ["Drag", "Switch city"] },
  { slug: "ai-orb", hint: "Switch states, or let it hear your mic", verbs: ["Listen", "Think", "Speak"] },
  { slug: "signal-card", hint: "Scrub the bars to read any hour", verbs: ["Scrub", "Hover"] },
  { slug: "glyph-card", hint: "Move to leave a wake, click to drop a stone", verbs: ["Move", "Click"] },
  { slug: "prompt-input", hint: "Pick a model, type, press send", verbs: ["Type", "Pick", "Send"] },
  { slug: "light-card", hint: "Steer the light with your cursor", verbs: ["Move"] },
];

const DWELL = 8000;

/** Crop marks in each corner, like a print proof. */
function Marks() {
  return (
    <>
      {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
        <span key={c} className={`pointer-events-none absolute size-3 border-base-50/25 ${c}`} />
      ))}
    </>
  );
}

/**
 * The hero's centrepiece: one live component at a time on a proofing table.
 * It rotates on its own, and pauses while you're interacting.
 */
export function SpecimenBench() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const active = specimens[index];
  const item = getItem(active.slug)!;

  useEffect(() => {
    if (held) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % specimens.length), DWELL);
    return () => clearTimeout(t);
  }, [index, held]);

  return (
    <div
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="grid overflow-hidden rounded-[1.75rem] bg-base-950 p-1.5 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 shadow-2xl shadow-shade/30 lg:grid-cols-[240px_minmax(0,1fr)_220px]"
    >
      {/* Index */}
      <ol className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
        {specimens.map((s, i) => {
          const on = i === index;
          const meta = getItem(s.slug)!;
          return (
            <li key={s.slug} className="shrink-0">
              <button
                onClick={() => setIndex(i)}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  on ? "text-base-50" : "text-base-500 hover:text-base-200"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="bench-active"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    className="absolute inset-0 rounded-xl bg-base-900 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
                  />
                )}
                <span className="relative font-mono text-[11px] text-base-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative flex-1 font-medium whitespace-nowrap">{meta.name}</span>
                <span className="relative hidden text-xs text-base-600 lg:inline">{meta.category}</span>
                {/* Dwell timer */}
                {on && (
                  <span className="absolute inset-x-3 bottom-1 h-px overflow-hidden rounded-full bg-base-50/5">
                    <motion.span
                      key={`${index}-${held}`}
                      className="block h-full origin-left bg-base-50/40"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: held ? 0 : 1 }}
                      transition={{ duration: held ? 0.3 : DWELL / 1000, ease: "linear" }}
                    />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Stage */}
      <div className="relative h-[460px] overflow-hidden rounded-[1.375rem] bg-canvas ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/20 sm:h-[540px]">
        <Marks />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center p-10 pb-16"
          >
            <Fit>
              <Preview slug={active.slug} />
            </Fit>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active.hint}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-mono text-[11px] tracking-wide text-base-500"
          >
            {active.hint}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Spec sheet */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.dl
          key={active.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="hidden flex-col gap-6 p-6 text-sm lg:flex"
        >
          <div>
            <dt className="font-mono text-[11px] tracking-wider text-base-600 uppercase">Specimen</dt>
            <dd className="mt-1.5 font-medium text-base-50">{item.name}</dd>
            <dd className="mt-1.5 leading-relaxed text-base-500">{item.description}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-wider text-base-600 uppercase">Interactions</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {active.verbs.map((v) => (
                <span key={v} className="rounded-md bg-base-900 px-2 py-0.5 text-xs text-base-300 ring-1 ring-base-50/10">
                  {v}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-wider text-base-600 uppercase">Depends on</dt>
            <dd className="mt-2 font-mono text-xs leading-6 text-base-400">
              {["react", "tailwindcss", ...item.deps].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </dd>
          </div>
          <Link
            href={`/components/${item.slug}`}
            className="group mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-base-200 transition-colors hover:text-base-50"
          >
            Open specimen
            <ArrowUpRight className="size-4 text-base-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.dl>
      </AnimatePresence>
    </div>
  );
}
