"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
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
import { Window } from "./stage/window";
import "./stage/stage.css";
import "./inspector.css";

const initial = { weight: 560, tracking: -4.5, serif: true, outline: false, size: 100 };

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const useDark = () =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

/** Design-tool selection marks around the headline: it is the layer the inspector edits. */
function Selection() {
  return (
    <span aria-hidden className="pointer-events-none absolute -inset-x-4 -inset-y-3 border border-signal/60">
      {["-top-[4px] -left-[4px]", "-top-[4px] -right-[4px]", "-bottom-[4px] -left-[4px]", "-right-[4px] -bottom-[4px]"].map((p) => (
        <span key={p} className={`absolute size-[7px] border border-signal bg-canvas ${p}`} />
      ))}
    </span>
  );
}

const parts = [
  ["Dial", "dial"],
  ["Fader", "fader"],
  ["Stepper", "stepper"],
  ["Switch", "switch"],
  ["Segmented Control", "segmented-control"],
] as const;

export function Hero() {
  const [s, setS] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K) => (v: (typeof initial)[K]) => setS((p) => ({ ...p, [k]: v }));
  const accent = useAccent();
  const dark = useDark();
  const dirty = JSON.stringify(s) !== JSON.stringify(initial) || accent !== "signal";
  const reset = () => {
    setS(initial);
    setAccent("signal");
  };

  const headline: CSSProperties = {
    fontWeight: s.weight,
    letterSpacing: `${s.tracking / 100}em`,
    fontSize: `calc(clamp(3.25rem, 6.6vw, 6.25rem) * ${s.size / 100})`,
  };

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="mx-auto grid max-w-[1400px] gap-y-12 px-6 pt-14 pb-24 sm:pt-20 sm:pb-32 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-10">
        {/* The headline: the selected layer */}
        <div className="pl-4 lg:col-span-6 lg:row-start-1 lg:self-end">
          <h1 style={headline} className="relative inline-block leading-[0.94] text-base-50">
            <Selection />
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

        {/* Its inspector, made of the components themselves */}
        <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="ss-stage insp" data-theme={dark ? "dark" : "light"}>
            <Window
              title="Headline"
              className="insp-window"
              toolbar={
                <Button size="sm" tone="ghost" hotkey="r" disabled={!dirty} onClick={reset}>
                  <RotateCcw /> Reset
                </Button>
              }
            >
              <div className="grid border-b border-base-50/[0.07] sm:grid-cols-[auto_1fr]">
                <div className="flex justify-center px-8 py-7 max-sm:border-b max-sm:border-base-50/[0.07] sm:border-r sm:border-base-50/[0.07]">
                  <Dial label="Weight" min={100} max={900} step={10} value={s.weight} onValueChange={set("weight")} defaultValue={initial.weight} />
                </div>
                <div className="flex flex-col justify-center gap-5 px-7 py-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-base-200">Size</span>
                    <Stepper min={70} max={110} step={5} value={s.size} onValueChange={set("size")} format={(v) => `${v}%`} />
                  </div>
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
              </div>
              <div className="border-b border-base-50/[0.07] px-7 py-6">
                <Fader
                  label="Tracking"
                  min={-10}
                  max={4}
                  step={0.5}
                  value={s.tracking}
                  onValueChange={set("tracking")}
                  format={(v) => `${(v / 100).toFixed(3)}em`}
                  marks={["Tight", "Loose"]}
                  className="max-w-none"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-4">
                <span className="text-sm text-base-200">Accent</span>
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
            </Window>
          </div>
          <p className="mt-4 text-[13px] leading-6 text-base-500">
            Made of the{" "}
            {parts.map(([name, slug], i) => (
              <span key={slug}>
                <Link href={`/components/${slug}`} className="text-base-300 underline decoration-base-700 underline-offset-4 transition-colors hover:text-base-50">
                  {name}
                </Link>
                {i < parts.length - 2 ? ", " : i === parts.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
        </div>

        {/* Copy */}
        <div className="lg:col-span-5 lg:row-start-2">
          <p className="max-w-[28rem] text-[17px] leading-7 text-pretty text-base-400">
            React components that act like well-made objects. Dials with detents, faders with travel, switches you can
            throw. <span className="text-base-100">Turn any of them and the headline answers.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/components" className={`${btnPrimary} group h-11 rounded-md px-5 text-[15px]`}>
              Browse the instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blocks"
              className="text-[15px] font-medium text-base-200 underline decoration-base-700 underline-offset-[6px] transition-colors hover:text-base-50 hover:decoration-base-400"
            >
              See them in a product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
