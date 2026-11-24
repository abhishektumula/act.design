"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Dial } from "@/components/ui/dial";
import { Fader } from "@/components/ui/fader";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { Chip } from "./fx";
import { btnPrimary, btnSecondary } from "./styles";
import { registry } from "@/registry/meta";
import { Bar, Window } from "./stage/window";
import { useDark } from "./use-dark";
import "./stage/stage.css";
import "./inspector.css";

type Case = "none" | "uppercase" | "lowercase";
const initial = {
  weight: 600,
  tracking: -3.5,
  serif: false,
  outline: false,
  size: 100,
  case: "none" as Case,
};

/** The newest piece, announced above the headline. */
const latest = registry.filter((r) => r.isNew).at(-1);

const enter = [0.22, 1, 0.36, 1] as const;
/** The landing entrance: a soft rise out of a blur, staggered by `delay`. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: enter },
});

/** Design-tool selection marks around the headline: it is the layer the inspector edits. */
function Selection() {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.55, ease: enter }}
      className="pointer-events-none absolute -inset-x-4 -inset-y-3 border border-signal/60"
    >
      {[
        "-top-[4px] -left-[4px]",
        "-top-[4px] -right-[4px]",
        "-bottom-[4px] -left-[4px]",
        "-right-[4px] -bottom-[4px]",
      ].map((p) => (
        <span
          key={p}
          className={`absolute size-[7px] border border-signal bg-canvas ${p}`}
        />
      ))}
    </motion.span>
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
  const set =
    <K extends keyof typeof initial>(k: K) =>
    (v: (typeof initial)[K]) =>
      setS((p) => ({ ...p, [k]: v }));
  const dark = useDark();
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);
  const reset = () => setS(initial);

  const headline: CSSProperties = {
    fontWeight: s.weight,
    textTransform: s.case,
    letterSpacing: `${s.tracking / 100}em`,
    fontSize: `calc(clamp(3rem, 5.4vw, 5rem) * ${s.size / 100})`,
  };

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="relative mx-auto grid max-w-[1400px] gap-y-12 px-6 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-10">
        {/* The headline: the selected layer */}
        <div className="pl-4 lg:col-span-6 lg:row-start-1 lg:self-end">
          {latest && (
            <motion.div {...rise(0)}>
              <Chip
                href={`/components/${latest.slug}`}
                label="New"
                count={
                  <span className="inline-flex items-center gap-1.5 text-base-200">
                    {latest.name}{" "}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                }
                className="mb-9"
              />
            </motion.div>
          )}
          <h1
            style={headline}
            className="relative block w-fit leading-[1.02] text-base-50"
          >
            <Selection />
            {/* Lines rise in one after the other, then the selection settles around them. */}
            <motion.span {...rise(0.05)} className="block">
              Interfaces
            </motion.span>
            <motion.span {...rise(0.15)} className="block">
              that{" "}
              <motion.span
                key={String(s.serif) + s.outline}
                initial={{ opacity: 0, y: "0.15em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={`inline-block pr-[0.08em] ${s.serif ? "font-serif font-normal tracking-[-0.02em] italic" : ""} ${
                  s.outline
                    ? "text-transparent [-webkit-text-stroke:1.5px_var(--signal)]"
                    : "text-signal"
                }`}
              >
                act.
              </motion.span>
            </motion.span>
          </h1>
        </div>

        {/* Copy */}
        <motion.div
          {...rise(0.3)}
          className="lg:col-span-5 lg:row-start-2 lg:pb-32"
        >
          <p className="max-w-[30rem] text-lg leading-8 text-pretty text-base-400">
            React components that act like well-made objects. Dials with
            detents, faders with travel, switches you can throw.{" "}
            <span className="text-base-100">
              Turn any of them and the headline answers.
            </span>
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/components"
              className={`${btnPrimary} group h-11 rounded-lg px-5 text-[15px]`}
            >
              Browse the components{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blocks"
              className={`${btnSecondary} h-11 rounded-lg px-5 text-[15px]`}
            >
              See them in a product
            </Link>
          </div>
          <p className="mt-10 text-[13px] leading-6 text-base-500">
            The inspector is made of the{" "}
            {parts.map(([name, slug], i) => (
              <span key={slug}>
                <Link
                  href={`/components/${slug}`}
                  className="text-base-300 underline decoration-base-700 underline-offset-4 transition-colors hover:text-base-50"
                >
                  {name}
                </Link>
                {i < parts.length - 2
                  ? ", "
                  : i === parts.length - 2
                    ? " and "
                    : "."}
              </span>
            ))}
          </p>
        </motion.div>

        {/*
          Its inspector, made of the components themselves. Framed as a corner
          bleed (Stageshow, references/framing.md): inset at the top and left,
          running off the right edge of the page and the bottom of the hero. The
          crop only ever cuts filler, the panel's other properties; every live
          control stays whole.
        */}
        <motion.div
          {...rise(0.4)}
          className="@container -mb-28 sm:-mb-32 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:-mb-24 lg:self-start"
        >
          <div
            className="ss-stage insp insp--bleed"
            data-theme={dark ? "dark" : "light"}
          >
            <Window
              title="Headline"
              className="insp-window"
              // Reset sits after the title, on the side of the window the crop never
              // reaches. The empty toolbar left-aligns the title, as a unified toolbar does.
              toolbar={<span aria-hidden />}
              lead={
                <Button
                  size="sm"
                  tone="ghost"
                  hotkey="r"
                  disabled={!dirty}
                  onClick={reset}
                >
                  <RotateCcw /> Reset
                </Button>
              }
            >
              <div className="flex">
                <div className="insp-controls min-w-0 shrink-0">
                  <div className="grid border-b border-base-50/[0.07] sm:grid-cols-[auto_1fr]">
                    <div className="flex justify-center px-8 py-7 max-sm:border-b max-sm:border-base-50/[0.07] sm:border-r sm:border-base-50/[0.07]">
                      <Dial
                        label="Weight"
                        min={100}
                        max={900}
                        step={10}
                        value={s.weight}
                        onValueChange={set("weight")}
                        defaultValue={initial.weight}
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-5 px-7 py-7">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-base-200">Size</span>
                        <Stepper
                          min={70}
                          max={110}
                          step={5}
                          value={s.size}
                          onValueChange={set("size")}
                          format={(v) => `${v}%`}
                        />
                      </div>
                      {(
                        [
                          ["serif", "Serif italic"],
                          ["outline", "Outline"],
                        ] as const
                      ).map(([k, l]) => (
                        <label
                          key={k}
                          className="flex cursor-pointer items-center justify-between gap-4 text-sm text-base-200"
                        >
                          <span id={`hero-${k}`}>{l}</span>
                          <Switch
                            checked={s[k]}
                            onCheckedChange={set(k)}
                            aria-labelledby={`hero-${k}`}
                          />
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
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-50/[0.07] px-7 py-4">
                    <span className="text-sm text-base-200">Case</span>
                    <SegmentedControl<Case>
                      aria-label="Case"
                      size="sm"
                      value={s.case}
                      onValueChange={set("case")}
                      options={[
                        { value: "none", label: "Aa" },
                        { value: "uppercase", label: "AA" },
                        { value: "lowercase", label: "aa" },
                      ]}
                    />
                  </div>
                  {/* Filler: the panel's next section, where the hero's crop falls */}
                  <div
                    aria-hidden
                    className="flex flex-col gap-4 px-7 pt-6 pb-16"
                  >
                    <Bar w={56} tone={3} />
                    <div className="flex items-center justify-between gap-6">
                      <Bar w={72} tone={2} />
                      <Bar w={120} h={24} r={6} tone={1} />
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <Bar w={60} tone={2} />
                      <Bar w={120} h={24} r={6} tone={1} />
                    </div>
                  </div>
                </div>

                {/* Filler: the layer's other properties, running off the page (wide desktop only) */}
                <div
                  aria-hidden
                  className="insp-more hidden shrink-0 auto-rows-min grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-10 gap-y-7 border-l border-base-50/[0.07] px-6 py-7 xl:grid"
                >
                  {[
                    [64, [88, 72]],
                    [48, [96, 64, 80]],
                    [56, [76, 92]],
                    [44, [84, 70, 90]],
                    [52, [80, 66]],
                    [60, [74, 90, 68]],
                    [46, [92, 70]],
                    [58, [68, 84, 76]],
                  ].map(([head, rows], i) => (
                    <div key={i} className="flex flex-col gap-3.5">
                      <Bar w={head as number} tone={3} />
                      {(rows as number[]).map((w, j) => (
                        <div key={j} className="flex items-center gap-4">
                          <Bar w={w} tone={2} />
                          <Bar w={56} h={22} r={6} tone={1} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Window>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
