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
import { Crosses } from "./frame";
import { HeroStage } from "./hero-stage";

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
    fontSize: `calc(clamp(3.5rem, 7vw, 6.75rem) * ${s.size / 100})`,
  };

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="mx-auto max-w-[1400px] px-6 pt-16 sm:pt-24">
        <div className="grid items-center gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          {/* Headline, wired to the panel below */}
          <div className="lg:col-span-5">
            <h1 style={headline} className="leading-[0.94] text-base-50">
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
            <p className="mt-8 max-w-[26rem] text-[17px] leading-7 text-pretty text-base-400">
              React components that act like well-made objects. Dials with detents, faders with travel, switches you can
              throw. <span className="text-base-100">Copy the source and keep the feel.</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/components" className={`${btnPrimary} group h-11 rounded-md px-5 text-[15px]`}>
                Browse the instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/blocks" className="text-[15px] font-medium text-base-200 underline decoration-base-700 underline-offset-[6px] transition-colors hover:text-base-50 hover:decoration-base-400">
                See them in a product
              </Link>
            </div>
          </div>

          {/* The product shot */}
          {/* Runs off the right of the page and fades out at its foot */}
          <div aria-hidden inert className="relative -mx-6 [clip-path:inset(-120px_-100vw_0_-120px)] sm:mx-0 lg:col-span-7">
            <HeroStage />
            <div className="pointer-events-none absolute -right-[100vw] bottom-0 -left-6 h-24 bg-linear-to-b from-transparent to-canvas" />
          </div>
        </div>

        <p className="mt-10 max-w-md text-[15px] leading-6 text-base-400 sm:mt-28">
          <span className="text-base-100">Your turn.</span> Every control below is one of the components, wired to the headline above.
        </p>

        {/* The panel */}
        <div className="relative mt-6 mb-20">
          <Crosses />
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
