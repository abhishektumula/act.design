"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export const dialVariants = cva("relative select-none touch-none", {
  variants: {
    size: {
      sm: "size-28",
      md: "size-40",
      lg: "size-52",
    },
  },
  defaultVariants: { size: "md" },
});

const SWEEP = 270;
const START = -135;

/**
 * A rotary control. Drag up / right to turn it up, scroll over it, or use the
 * arrow keys. Hold Shift for fine control and double-click to reset. Ticks
 * light up as it turns and each major detent sends a tiny haptic tick on phones.
 */
export function Dial({
  value: controlled,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ticks = 41,
  label,
  format = (v) => String(Math.round(v)),
  size,
  className,
}: VariantProps<typeof dialVariants> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Number of ticks on the scale; every fifth one is a major detent. */
  ticks?: number;
  label?: string;
  format?: (value: number) => string;
  className?: string;
}) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const [active, setActive] = useState(false);
  const drag = useRef<{ y: number; x: number; start: number } | null>(null);
  const lastMajor = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const pct = (value - min) / (max - min);
  const spring = useSpring(pct, { stiffness: 380, damping: 32, mass: 0.6 });
  useEffect(() => spring.set(pct), [pct, spring]);
  const angle = useTransform(spring, (p) => START + p * SWEEP);

  const C = 2 * Math.PI * 92;
  const arc = useTransform(spring, (p) => `${p * (SWEEP / 360) * C} ${C}`);

  const commit = (next: number) => {
    const snapped = Math.min(max, Math.max(min, Math.round((next - min) / step) * step + min));
    const clean = Number(snapped.toFixed(6));
    if (clean === value) return;
    // A soft haptic tick on every major detent.
    const major = Math.round(((clean - min) / (max - min)) * ((ticks - 1) / 5));
    if (lastMajor.current !== null && major !== lastMajor.current) navigator.vibrate?.(4);
    lastMajor.current = major;
    if (controlled === undefined) setInner(clean);
    onValueChange?.(clean);
  };

  // Wheel needs a non-passive listener to stop the page from scrolling.
  const latest = useRef({ value, commit, step, range: max - min });
  useEffect(() => {
    latest.current = { value, commit, step, range: max - min };
  });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { value, commit, step, range } = latest.current;
      commit(value - Math.sign(e.deltaY) * Math.max(step, range / 100));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: value };
    setActive(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const travel = drag.current.y - e.clientY + (e.clientX - drag.current.x);
    const per = (max - min) / (e.shiftKey ? 900 : 220);
    commit(drag.current.start + travel * per);
  };
  const end = () => {
    drag.current = null;
    setActive(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const big = (max - min) / 10;
    const map: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
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

  const litUntil = pct * (ticks - 1);

  return (
    <div data-slot="dial" className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        ref={root}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={() => commit(defaultValue)}
        onKeyDown={onKeyDown}
        className={cn(
          dialVariants({ size }),
          "cursor-grab rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-4 focus-visible:ring-offset-base-950",
        )}
      >
        {/* Scale */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible">
          <motion.circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            transform="rotate(135 100 100)"
            style={{ strokeDasharray: arc }}
            className="stroke-signal opacity-25 blur-[6px]"
          />
          {Array.from({ length: ticks }, (_, i) => {
            const a = START + (i / (ticks - 1)) * SWEEP;
            const major = i % 5 === 0;
            const lit = i <= litUntil + 1e-6;
            const head = Math.abs(i - litUntil) < 0.5;
            return (
              <line
                key={i}
                x1="100"
                x2="100"
                y1={head ? 2 : major ? 6 : 9}
                y2="15"
                transform={`rotate(${a} 100 100)`}
                strokeWidth={major || head ? 2.2 : 1.4}
                strokeLinecap="round"
                className={cn(
                  "transition-[stroke,opacity] duration-150",
                  lit ? "stroke-signal" : "stroke-base-50 opacity-20",
                )}
              />
            );
          })}
        </svg>

        {/* Knob */}
        <motion.div
          animate={{ scale: active ? 0.97 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute inset-[16%] rounded-full bg-linear-to-b from-white to-base-800 shadow-[0_1px_0_white_inset,0_-1px_0_rgb(0_0_0/0.08)_inset,0_2px_3px_rgb(0_0_0/0.12),0_12px_24px_-6px_color-mix(in_oklab,var(--color-shade)_55%,transparent)] ring-1 ring-black/10 dark:from-base-700 dark:to-base-900 dark:shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_2px_3px_rgb(0_0_0/0.4),0_14px_28px_-6px_rgb(0_0_0/0.7)] dark:ring-white/5"
        >
          <motion.div style={{ rotate: angle }} className="absolute inset-0 rounded-full">
            {/* Knurled rim */}
            <div className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(rgb(0_0_0/0.07)_0deg_1.5deg,transparent_1.5deg_6deg)] [mask-image:radial-gradient(circle,transparent_62%,black_64%)] dark:bg-[repeating-conic-gradient(rgb(255_255_255/0.06)_0deg_1.5deg,transparent_1.5deg_6deg)]" />
            {/* Pointer */}
            <span className="absolute top-[7%] left-1/2 h-[18%] w-[5%] min-w-1 -translate-x-1/2 rounded-full bg-signal shadow-[0_0_10px_var(--signal)]" />
          </motion.div>
          {/* Machined face */}
          <div className="absolute inset-[24%] rounded-full bg-linear-to-b from-base-900 to-white shadow-[0_1px_1px_rgb(0_0_0/0.08)_inset] ring-1 ring-black/5 dark:from-base-900 dark:to-base-700 dark:ring-white/5" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        {label && (
          <span id={`${id}-label`} className="font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase">
            {label}
          </span>
        )}
        <span className="font-mono text-sm font-medium text-base-100 tabular-nums">{format(value)}</span>
      </div>
    </div>
  );
}

export default function Demo() {
  const [temp, setTemp] = useState(0.7);
  const [gain, setGain] = useState(-6);
  const [mix, setMix] = useState(40);

  return (
    <div className="relative flex items-end gap-6 rounded-[28px] bg-base-950 px-8 pt-8 pb-6 shadow-[0_1px_0_white_inset,0_20px_40px_-20px_color-mix(in_oklab,var(--color-shade)_60%,transparent)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_20px_40px_-20px_black] @sm:gap-8">
      {[
        "top-3 left-3",
        "top-3 right-3",
        "bottom-3 left-3",
        "bottom-3 right-3",
      ].map((p) => (
        <span key={p} className={cn("absolute size-1.5 rounded-full bg-base-800 ring-1 ring-black/5 dark:bg-base-800", p)} />
      ))}
      <Dial size="sm" ticks={31} label="Gain" min={-24} max={12} step={0.5} value={gain} onValueChange={setGain} defaultValue={-6} format={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} dB`} />
      <Dial size="lg" label="Temperature" min={0} max={2} step={0.01} value={temp} onValueChange={setTemp} defaultValue={0.7} format={(v) => v.toFixed(2)} />
      <Dial size="sm" ticks={31} label="Mix" value={mix} onValueChange={setMix} defaultValue={40} format={(v) => `${Math.round(v)}%`} />
    </div>
  );
}
