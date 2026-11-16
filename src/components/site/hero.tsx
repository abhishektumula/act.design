"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Dial } from "@/components/ui/dial";
import { Fader } from "@/components/ui/fader";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { accents, setAccent, useAccent, type Accent } from "./accent";
import { btnPrimary } from "./styles";
import { Crosses, Eyebrow } from "./frame";



const initial = { weight: 560, tracking: -4.5, serif: true, outline: false, size: 100 };

function Module({ name, slug, children, className = "" }: { name: string; slug: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 p-6 ${className}`}>
      <Link href={`/components/${slug}`} className="group flex w-fit items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase transition-colors hover:text-base-100">
        {name}
        <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

export function Hero() {
  const [s, setS] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K) => (v: (typeof initial)[K]) => setS((p) => ({ ...p, [k]: v }));
  const accent = useAccent();
  const dirty = JSON.stringify(s) !== JSON.stringify(initial) || accent !== "signal";

  const headline: CSSProperties = {
    fontWeight: s.weight,
    letterSpacing: `${s.tracking / 100}em`,
    fontSize: `calc(clamp(3.25rem, 8.6vw, 8.75rem) * ${s.size / 100})`,
  };

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="mx-auto max-w-[1400px] px-6 pt-14 sm:pt-20">
        {/* Headline, wired to the panel below */}
        <Eyebrow className="mb-8">Instruments for the interface</Eyebrow>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1
              style={headline}
              className="min-h-[1.9em] leading-[0.92] text-base-50 transition-[color] duration-300 sm:min-h-[1.95em]"
            >
              <span className="block">Interfaces</span>
              <span className="block">
                with{" "}
                <motion.span
                  key={String(s.serif) + s.outline}
                  initial={{ opacity: 0, y: "0.15em", filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={`inline-block pr-[0.08em] ${s.serif ? "font-serif font-normal tracking-[-0.02em] italic" : ""} ${
                    s.outline ? "text-transparent [-webkit-text-stroke:1.5px_var(--signal)]" : "text-signal"
                  }`}
                >
                  weight.
                </motion.span>
              </span>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-4">
            <p className="max-w-md text-lg leading-8 text-pretty text-base-400">
              A small set of React components that behave like well-made objects: they have weight, travel and detents.{" "}
              <span className="text-base-200">Every control on the panel below is one of them</span>, wired to the headline. Go on.
            </p>
            <Link href="/components" className={`${btnPrimary} group mt-8 h-12 rounded-md px-5 text-[15px]`}>
              Browse the instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* The panel */}
        <div className="relative mt-14 mb-20">
          <Crosses />
          <div className="flex h-10 items-center justify-between border-x border-t border-base-50/[0.08] bg-base-950 px-4 font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase">
            <span>Control panel</span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" /> Live<span className="max-sm:hidden"> · wired to headline</span>
            </span>
          </div>
          <div className="grid divide-y divide-base-50/[0.08] bg-base-950 ring-1 ring-base-50/[0.08] md:grid-cols-2 md:divide-x lg:grid-cols-[1.1fr_1.5fr_1fr_1fr] lg:divide-y-0">
            <Module name="Dial" slug="dial" className="md:row-span-2 lg:row-span-1">
              <Dial label="Weight" min={100} max={900} step={10} value={s.weight} onValueChange={set("weight")} defaultValue={initial.weight} />
            </Module>
            <Module name="Fader" slug="fader">
              <div className="flex w-full flex-col items-center gap-7">
                <Fader
                  label="Tracking"
                  min={-10}
                  max={4}
                  step={0.5}
                  value={s.tracking}
                  onValueChange={set("tracking")}
                  format={(v) => `${(v / 100).toFixed(3)}em`}
                  marks={["Tight", "Loose"]}
                />
                <SegmentedControl<Accent>
                  aria-label="Accent"
                  size="sm"
                  value={accent}
                  onValueChange={setAccent}
                  options={(Object.keys(accents) as Accent[]).map((a) => ({
                    value: a,
                    label: <span className="capitalize max-sm:sr-only">{a}</span>,
                    icon: <span className="block size-2 rounded-full" style={{ background: accents[a] }} />,
                  }))}
                />
              </div>
            </Module>
            <Module name="Switch" slug="switch">
              <div className="w-full max-w-52 space-y-4">
                {(
                  [
                    ["serif", "Serif italic"],
                    ["outline", "Outline"],
                  ] as const
                ).map(([k, l]) => (
                  <label key={k} className="flex cursor-pointer items-center justify-between gap-4 text-sm text-base-200">
                    <span id={`hero-${k}`}>{l}</span>
                    <Switch checked={s[k]} onCheckedChange={set(k)} aria-labelledby={`hero-${k}`} />
                  </label>
                ))}
              </div>
            </Module>
            <Module name="Stepper" slug="stepper">
              <div className="flex flex-col items-center gap-5">
                <Stepper label="Size" min={70} max={110} step={5} value={s.size} onValueChange={set("size")} format={(v) => `${v}%`} />
                <Button size="sm" hotkey="r" disabled={!dirty} onClick={() => {
                    setS(initial);
                    setAccent("signal");
                  }}>
                  <RotateCcw /> Reset
                </Button>
              </div>
            </Module>
          </div>
        </div>
      </div>
    </section>
  );
}
