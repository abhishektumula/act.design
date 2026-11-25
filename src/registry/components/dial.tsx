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
 * The level tone's scale, like a volume meter: cool blue at rest, green through the
 * comfortable range, a short amber warning, then red from the danger point on.
 * `d` is where danger starts, as a fraction of the sweep.
 */
function levelStops(d: number): [number, string][] {
  return [
    [0, "var(--color-blue-500)"],
    [d * 0.62, "var(--color-emerald-500)"],
    [Math.max(d * 0.62, d - 0.1), "var(--color-amber-400)"],
    [d, "var(--color-red-500)"],
    [1, "var(--color-red-600)"],
  ];
}

/** The colour at fraction `p` along the stops, mixed in OKLCH so the hues pass cleanly. */
function colorAt(stops: [number, string][], p: number) {
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    if (p <= p1 || i === stops.length - 1) {
      const [p0, c0] = stops[i - 1];
      const t = p1 === p0 ? 1 : Math.min(1, Math.max(0, (p - p0) / (p1 - p0)));
      return `color-mix(in oklch, ${c1} ${Math.round(t * 100)}%, ${c0})`;
    }
  }
  return stops[0][1];
}

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
  tone = "signal",
  danger,
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
  /** `signal` lights the scale in the accent. `level` runs it blue → green → red, like a volume meter. */
  tone?: "signal" | "level";
  /** With `tone="level"`: the value where the red zone starts. Defaults to 85% of the range. */
  danger?: number;
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

  const level = tone === "level";
  const d = Math.min(1, Math.max(0, ((danger ?? min + (max - min) * 0.85) - min) / (max - min)));
  const stops = levelStops(d);
  const hot = level && pct > d + 1e-6;
  const tint = useTransform(spring, (p) => (level ? colorAt(stops, p) : "var(--color-blue-500)"));
  const pointerGlow = useTransform(tint, (c) => `0 0 10px ${c}`);

  const C = 2 * Math.PI * 92;
  const arc = useTransform(spring, (p) => `${p * (SWEEP / 360) * C} ${C}`);

  const commit = (next: number) => {
    const snapped = Math.min(max, Math.max(min, Math.round((next - min) / step) * step + min));
    const clean = Number(snapped.toFixed(6));
    if (clean === value) return;
    // A soft haptic tick on every major detent.
    const major = Math.round(((clean - min) / (max - min)) * ((ticks - 1) / 5));
    if (lastMajor.current !== null && major !== lastMajor.current) navigator.vibrate?.(4);
    // Crossing into the red zone gets a firmer knock.
    if (level && (clean - min) / (max - min) > d && (value - min) / (max - min) <= d) navigator.vibrate?.(14);
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
          "cursor-grab rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-950",
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
            style={{ strokeDasharray: arc, stroke: tint }}
            animate={{ opacity: hot ? [0.35, 0.6, 0.35] : 0.25 }}
            transition={hot ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            className="blur-[6px]"
          />
          {Array.from({ length: ticks }, (_, i) => {
            const a = START + (i / (ticks - 1)) * SWEEP;
            const major = i % 5 === 0;
            const lit = i <= litUntil + 1e-6;
            const head = Math.abs(i - litUntil) < 0.5;
            // On the level scale every tick keeps its zone colour, faintly when unlit,
            // so the red zone is visible before you reach it.
            const zone = level ? colorAt(stops, i / (ticks - 1)) : undefined;
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
                style={zone ? { stroke: zone, opacity: lit ? 1 : 0.22 } : undefined}
                className={cn(
                  "transition-[stroke,opacity] duration-150",
                  !zone && (lit ? "stroke-blue-600 dark:stroke-blue-500" : "stroke-neutral-950 dark:stroke-neutral-50 opacity-20"),
                )}
              />
            );
          })}
        </svg>

        {/* Knob */}
        <motion.div
          animate={{ scale: active ? 0.97 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute inset-[16%] rounded-full bg-linear-to-b from-white to-neutral-200 shadow-[0_1px_0_white_inset,0_-1px_0_rgb(0_0_0/0.08)_inset,0_2px_3px_rgb(0_0_0/0.12),0_12px_24px_-6px_color-mix(in_oklab,var(--color-neutral-600)_55%,transparent)] ring-1 ring-black/10 dark:from-neutral-700 dark:to-neutral-900 dark:shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_2px_3px_rgb(0_0_0/0.4),0_14px_28px_-6px_rgb(0_0_0/0.7)] dark:ring-white/5"
        >
          <motion.div style={{ rotate: angle }} className="absolute inset-0 rounded-full">
            {/* Knurled rim */}
            <div className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(rgb(0_0_0/0.07)_0deg_1.5deg,transparent_1.5deg_6deg)] [mask-image:radial-gradient(circle,transparent_62%,black_64%)] dark:bg-[repeating-conic-gradient(rgb(255_255_255/0.06)_0deg_1.5deg,transparent_1.5deg_6deg)]" />
            {/* Pointer */}
            <motion.span
              style={{ backgroundColor: tint, boxShadow: pointerGlow }}
              className="absolute top-[7%] left-1/2 h-[18%] w-[5%] min-w-1 -translate-x-1/2 rounded-full"
            />
          </motion.div>
          {/* Machined face */}
          <div className="absolute inset-[24%] rounded-full bg-linear-to-b from-neutral-100 to-white shadow-[0_1px_1px_rgb(0_0_0/0.08)_inset] ring-1 ring-black/5 dark:from-neutral-900 dark:to-neutral-700 dark:ring-white/5" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        {label && (
          <span id={`${id}-label`} className="font-mono text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
            {label}
          </span>
        )}
        <span className={cn("font-mono text-sm font-medium tabular-nums transition-colors duration-200", hot ? "text-red-500" : "text-neutral-900 dark:text-neutral-100")}>{format(value)}</span>
      </div>
    </div>
  );
}

export default function Demo() {
  const [temp, setTemp] = useState(0.7);
  return <Dial size="lg" label="Temperature" min={0} max={2} step={0.01} value={temp} onValueChange={setTemp} defaultValue={0.7} format={(v) => v.toFixed(2)} />;
}
