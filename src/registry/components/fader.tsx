"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A slider drawn as a ruler. Ticks swell around the thumb like a magnifier,
 * the readout floats up while you drag, and pulling past either end stretches
 * the thumb on an elastic before it springs home.
 */
export function Fader({
  value: controlled,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ticks = 49,
  label,
  format = (v) => String(Math.round(v)),
  marks,
  className,
}: {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ticks?: number;
  label?: string;
  format?: (value: number) => string;
  /** Labels under the ruler, spread evenly. Defaults to min and max. */
  marks?: string[];
  className?: string;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pull, setPull] = useState(0);

  const pct = ((value - min) / (max - min)) * 100;
  const pos = useSpring(pct, { stiffness: 700, damping: 45 });
  const stretch = useSpring(0, { stiffness: 500, damping: 18 });
  useEffect(() => pos.set(pct + pull), [pct, pull, pos]);
  useEffect(() => stretch.set(Math.abs(pull)), [pull, stretch]);
  const left = useTransform(pos, (p) => `${p}%`);
  const scaleX = useTransform(stretch, (s) => 1 + s / 12);

  const commit = (next: number) => {
    const snapped = Math.min(max, Math.max(min, Math.round((next - min) / step) * step + min));
    const clean = Number(snapped.toFixed(6));
    if (clean === value) return;
    if (controlled === undefined) setInner(clean);
    onValueChange?.(clean);
  };

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const raw = ((clientX - r.left) / r.width) * 100;
    // Past the ends the thumb follows on a square-root leash.
    const over = raw < 0 ? raw : raw > 100 ? raw - 100 : 0;
    setPull(Math.sign(over) * Math.sqrt(Math.abs(over)) * 1.6);
    commit(min + (Math.min(100, Math.max(0, raw)) / 100) * (max - min));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e.clientX);
  };
  const end = () => {
    setDragging(false);
    setPull(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const big = (max - min) / 10;
    const map: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (e.key in map) {
      e.preventDefault();
      commit(map[e.key]);
    }
  };

  const show = dragging || hover || focus;
  const labels = marks ?? [format(min), format(max)];

  return (
    <div data-slot="fader" className={cn("w-full max-w-sm select-none", className)}>
      {label && (
        <div className="mb-3 flex items-baseline justify-between">
          <span id={`${id}-label`} className="text-sm font-medium text-base-100">
            {label}
          </span>
          <span className="font-mono text-sm text-base-400 tabular-nums">{format(value)}</span>
        </div>
      )}

      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={onKeyDown}
        className="group relative h-14 cursor-pointer touch-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-8 focus-visible:ring-offset-base-950"
      >
        {/* Ruler */}
        <div className="absolute inset-x-0 bottom-3 flex h-10 items-end justify-between">
          {Array.from({ length: ticks }, (_, i) => {
            const p = (i / (ticks - 1)) * 100;
            const d = (p - pct) / (show ? 7 : 5);
            const swell = Math.exp(-d * d);
            const major = i % 8 === 0;
            const h = Math.round((major ? 14 : 8) + swell * (show ? 22 : 12));
            return (
              <span
                key={i}
                style={{ height: h }}
                className={cn(
                  "w-px rounded-full transition-[height,background-color,opacity] duration-200 ease-out",
                  p <= pct ? "bg-base-50" : "bg-base-50 opacity-25",
                  major && "w-[1.5px]",
                )}
              />
            );
          })}
        </div>
        {/* Baseline */}
        <div className="absolute inset-x-0 bottom-3 h-px bg-base-50/15" />

        {/* Thumb */}
        <motion.div style={{ left }} className="absolute bottom-0 h-full">
          <motion.div
            style={{ scaleX }}
            animate={{ scaleY: dragging ? 1.04 : 1 }}
            className="absolute bottom-0 left-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-signal shadow-[0_0_12px_color-mix(in_oklab,var(--signal)_70%,transparent)]"
          />
          <span className="absolute bottom-0 left-0 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-signal ring-4 ring-base-950" />
          <AnimatePresence>
            {show && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.85, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 4, scale: 0.9, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute bottom-full left-0 mb-2 -translate-x-1/2 rounded-md bg-base-50 px-2 py-1 font-mono text-[11px] font-medium whitespace-nowrap text-base-950 tabular-nums shadow-lg shadow-shade/30"
              >
                {format(value)}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.12em] text-base-500 uppercase">
        {labels.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export default function Demo() {
  const [speed, setSpeed] = useState(1);
  const [focus, setFocus] = useState(62);

  return (
    <div className="flex w-full max-w-sm flex-col gap-10">
      <Fader
        label="Playback speed"
        min={0.25}
        max={3}
        step={0.05}
        value={speed}
        onValueChange={setSpeed}
        format={(v) => `${v.toFixed(2)}×`}
      />
      <Fader label="Focus" value={focus} onValueChange={setFocus} format={(v) => `${Math.round(v)}%`} marks={["Soft", "Sharp"]} />
    </div>
  );
}
