"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Digits that roll up when the number grows and down when it shrinks. */
export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== prev) {
    const num = (s: string) => Number(s.replace(/[^\d.-]/g, ""));
    setDir(num(value) >= num(prev) ? 1 : -1);
    setPrev(value);
  }
  const chars = value.split("");

  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-label={value}>
      {chars.map((c, i) => (
        <span key={chars.length - i} className="relative inline-block overflow-hidden" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={c}
              custom={dir}
              variants={{
                enter: (d: number) => ({ y: d > 0 ? "70%" : "-70%", opacity: 0, filter: "blur(3px)" }),
                center: { y: 0, opacity: 1, filter: "blur(0px)" },
                exit: (d: number) => ({ y: d > 0 ? "-70%" : "70%", opacity: 0, filter: "blur(3px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="inline-block"
            >
              {c === " " ? "\u00a0" : c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * A number field with − / + keys. Holding a key repeats and accelerates; hitting
 * a limit shakes the readout instead of silently doing nothing.
 */
export function Stepper({
  value: controlled,
  defaultValue = 1,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  format = (v) => String(v),
  label = "Value",
  className,
}: {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  label?: string;
  className?: string;
}) {
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const [scope, animate] = useAnimate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef(value);
  useEffect(() => {
    current.current = value;
  }, [value]);

  const nudge = (dir: 1 | -1) => {
    const next = current.current + dir * step;
    if (next < min || next > max) {
      animate(scope.current, { x: [0, dir * 6, -dir * 4, dir * 2, 0] }, { duration: 0.35 });
      navigator.vibrate?.([6, 30, 6]);
      return false;
    }
    current.current = next;
    if (controlled === undefined) setInner(next);
    onValueChange?.(next);
    return true;
  };

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const start = (dir: 1 | -1) => {
    if (!nudge(dir)) return;
    let delay = 380;
    const tick = () => {
      if (!nudge(dir)) return stop();
      delay = Math.max(45, delay * 0.82);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
  };

  const key = (dir: 1 | -1, disabled: boolean) => (
    <motion.button
      type="button"
      aria-label={dir > 0 ? "Increase" : "Decrease"}
      aria-disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        start(dir);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nudge(dir);
        }
      }}
      className="grid size-9 place-items-center rounded-xl bg-linear-to-b from-white to-neutral-50 text-neutral-800 dark:text-neutral-200 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-black/5 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60 aria-disabled:opacity-40 dark:from-neutral-700 dark:to-neutral-800 dark:shadow-[0_1px_0_rgb(255_255_255/0.1)_inset] dark:ring-white/5 [&_svg]:size-4"
    >
      {dir > 0 ? <Plus /> : <Minus />}
    </motion.button>
  );

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={format(value)}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          e.preventDefault();
          nudge(1);
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          e.preventDefault();
          nudge(-1);
        }
      }}
      data-slot="stepper"
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06] p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-neutral-950/5 dark:ring-neutral-50/5 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:focus-visible:ring-blue-500/50",
        className,
      )}
    >
      {key(-1, value - step < min)}
      <span ref={scope} className="min-w-14 px-2 text-center font-mono text-lg font-medium text-neutral-950 dark:text-neutral-50">
        <RollingNumber value={format(value)} />
      </span>
      {key(1, value + step > max)}
    </div>
  );
}

export default function Demo() {
  const [seats, setSeats] = useState(3);
  const price = seats * 12;
  return (
    <div className="w-full max-w-xs rounded-3xl bg-neutral-50 dark:bg-neutral-950 p-6 shadow-[0_1px_0_white_inset,0_20px_40px_-24px_var(--color-neutral-600)] ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]">
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Team plan</p>
      <div className="mt-3 flex items-baseline gap-1 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
        <RollingNumber value={`$${price}`} />
        <span className="text-sm font-normal tracking-normal text-neutral-500">/ month</span>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Seats</p>
          <p className="text-[13px] text-neutral-500">1 to 10 people</p>
        </div>
        <Stepper label="Seats" value={seats} onValueChange={setSeats} min={1} max={10} />
      </div>
    </div>
  );
}
