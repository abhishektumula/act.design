"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { Dial } from "@/components/ui/dial";
import { Fader } from "@/components/ui/fader";
import { Keycap } from "@/components/ui/keycap";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** [formal][temperature bucket][length] */
const drafts = [
  [
    ["New dashboard ships Monday.", "The new dashboard ships Monday. Same data, fewer clicks, and it loads in half the time."],
    [
      "Monday: a dashboard that finally keeps up with you.",
      "Monday we ship a dashboard that finally keeps up with you. Fewer clicks, faster loads, charts you’ll actually want to open.",
    ],
    [
      "Monday, the dashboard grows wings.",
      "Monday, the dashboard grows wings. It loads before you blink, answers before you ask, and makes standup suspiciously short.",
    ],
  ],
  [
    ["The new dashboard will be released on Monday.", "The new dashboard will be released on Monday. It presents the same data in fewer steps and loads in roughly half the time."],
    [
      "On Monday we introduce a faster, simpler dashboard.",
      "On Monday we introduce a faster, simpler dashboard, designed to remove routine steps and bring key metrics forward.",
    ],
    [
      "Monday marks a new standard for our dashboard.",
      "Monday marks a new standard for how customers see their business: a dashboard that is quicker, clearer and more considered.",
    ],
  ],
];

function Screen({ text, meta }: { text: string; meta: string }) {
  const source = useMotionValue(text);
  const count = useMotionValue(0);
  const shown = useTransform(() => source.get().slice(0, Math.round(count.get())));
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    source.set(text);
    count.set(0);
    const controls = animate(count, text.length, {
      duration: text.length * 0.014,
      ease: "linear",
      onPlay: () => setTyping(true),
      onComplete: () => setTyping(false),
    });
    return () => controls.stop();
  }, [text, source, count]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#17140f] p-5 shadow-[inset_0_2px_6px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.5)] ring-1 ring-black/40 dark:shadow-[inset_0_2px_6px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.06)]">
      {/* Scanlines and glass */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.025)_0px,rgb(255_255_255/0.025)_1px,transparent_1px,transparent_3px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/[0.05] to-transparent" />
      <div className="relative flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[#d8c9a8]/50 uppercase">
        <span className="flex items-center gap-2">
          <span className={cn("size-1.5 rounded-full transition-colors", typing ? "bg-signal shadow-[0_0_8px_var(--signal)]" : "bg-[#d8c9a8]/30")} />
          {typing ? "Writing" : "Ready"}
        </span>
        <span>{meta}</span>
      </div>
      <p className="relative mt-4 min-h-[6.5rem] font-mono text-[15px] leading-relaxed text-[#f3e6c8] [text-shadow:0_0_12px_rgb(255_190_120/0.35)]">
        <motion.span>{shown}</motion.span>
        <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-pulse bg-[#f3e6c8]/80" />
      </p>
    </div>
  );
}

/**
 * A product hero whose visual is a working console: the dial, fader and switch
 * rewrite the sample on the screen as you play with them.
 */
export function HeroInstrument({ className }: { className?: string }) {
  const [temp, setTemp] = useState(0.7);
  const [length, setLength] = useState(30);
  const [formal, setFormal] = useState(false);

  const bucket = temp < 0.5 ? 0 : temp < 1.1 ? 1 : 2;
  const long = length >= 50 ? 1 : 0;
  const text = drafts[formal ? 1 : 0][bucket][long];

  return (
    <section data-slot="hero-instrument" className={cn("relative overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-7xl">
            Tune the voice, <span className="font-serif font-normal tracking-[-0.02em] text-signal italic">not the prompt.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-base-400">
            Margin turns how your AI writes into physical controls everyone on the team can see, share and lock. Try the panel.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Keycap tone="signal" size="lg" legend={<CornerDownLeft />}>
              Start tuning
            </Keycap>
            <Keycap tone="paper" size="lg">
              Watch the film <ArrowRight />
            </Keycap>
          </div>
          <p className="mt-8 text-sm text-base-500">Free for three seats. No card needed.</p>
        </div>

        {/* The device */}
        <div className="relative rounded-[32px] bg-base-950 p-3 shadow-[0_1px_0_white_inset,0_50px_80px_-40px_color-mix(in_oklab,var(--color-shade)_80%,transparent)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_40px_80px_-30px_black]">
          <Screen text={text} meta={`${formal ? "Formal" : "Casual"} · T ${temp.toFixed(2)}`} />
          <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-6 rounded-2xl p-4 ring-1 ring-base-50/[0.07] sm:gap-8 sm:p-5">
            <Dial size="sm" ticks={31} label="Temperature" min={0} max={1.5} step={0.01} value={temp} onValueChange={setTemp} defaultValue={0.7} format={(v) => v.toFixed(2)} />
            <div className="flex flex-col gap-6">
              <Fader label="Length" value={length} onValueChange={setLength} format={(v) => (v >= 50 ? "Paragraph" : "One line")} marks={["Short", "Long"]} ticks={33} />
              <label className="flex cursor-pointer items-center justify-between text-sm font-medium text-base-100">
                <span id="hero-instrument-formal">Formal register</span>
                <Switch size="sm" checked={formal} onCheckedChange={setFormal} aria-labelledby="hero-instrument-formal" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroInstrument />;
}
