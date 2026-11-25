"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type ValueBarProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Written inside the bar, on the left. */
  label?: string;
  /** How the readout on the right is written. */
  format?: (value: number) => string;
  /** Hide the readout inside the bar. */
  hideValue?: boolean;
  /** Names for stretches of the range, shown under the bar: ["Low", "Medium", "High"] splits it in three. */
  levels?: string[];
  /** Fine marks along the bar. 0 for none. */
  ticks?: number;
  /** sm and md are slim rows for settings panels; lg is a pill with a knob. */
  size?: "sm" | "md" | "lg";
  /** Fill and thumb colour. Any CSS colour. */
  accent?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const sizes = {
  sm: { bar: "h-10 rounded-[10px] text-[13px]", inset: 6, thumb: "h-[45%] w-1.5" },
  md: { bar: "h-12 rounded-xl text-sm", inset: 7, thumb: "h-1/2 w-1.5" },
  lg: { bar: "h-16 rounded-full text-sm", inset: 10, thumb: "h-[62%] w-6" },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A value as a bar you drag. The fill follows the thumb on a spring, the label and readout sit
 * inside, and pulling past either end stretches the whole bar a little before it lets go.
 */
export function ValueBar({
  value: controlled,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  format = (v) => String(Number(v.toFixed(4))),
  hideValue,
  levels,
  ticks = 9,
  size = "sm",
  accent = "var(--color-neutral-500)",
  disabled,
  className,
  "aria-label": ariaLabel,
}: ValueBarProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const value = clamp(controlled ?? inner, min, max);
  const [dragging, setDragging] = useState(false);
  const s = sizes[size];

  const p = max > min ? (value - min) / (max - min) : 0;
  const pos = useSpring(p, reduce ? { duration: 0 } : { stiffness: 900, damping: 60 });
  useEffect(() => pos.set(p), [p, pos]);
  const left = useTransform(pos, (q) => `calc(${s.inset}px + (100% - ${s.inset * 2}px) * ${q})`);

  /* Rubber band past the ends: the bar stretches toward the pointer and springs back. */
  const pull = useSpring(0, { stiffness: 500, damping: 22 });
  const scaleX = useTransform(pull, (v) => 1 + Math.abs(v) * 0.0009);
  const origin = useTransform(pull, (v) => (v < 0 ? "100% 50%" : "0% 50%"));

  const commit = (next: number) => {
    const snapped = clamp(Math.round((next - min) / step) * step + min, min, max);
    const clean = Number(snapped.toFixed(6));
    if (clean === value) return;
    if (controlled === undefined) setInner(clean);
    onValueChange?.(clean);
  };

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const q = (clientX - r.left - s.inset) / (r.width - s.inset * 2);
    const over = clientX < r.left ? clientX - r.left : clientX > r.right ? clientX - r.right : 0;
    if (!reduce) pull.set(Math.sign(over) * Math.sqrt(Math.abs(over)) * 6);
    commit(min + clamp(q, 0, 1) * (max - min));
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e.clientX);
  };
  const up = () => {
    setDragging(false);
    pull.set(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.shiftKey ? step * 10 : step;
    const to: Record<string, number> = { ArrowRight: value + k, ArrowUp: value + k, ArrowLeft: value - k, ArrowDown: value - k, PageUp: value + (max - min) / 10, PageDown: value - (max - min) / 10, Home: min, End: max };
    if (!(e.key in to)) return;
    e.preventDefault();
    commit(to[e.key]);
  };

  const level = levels?.length ? levels[Math.min(levels.length - 1, Math.floor(p * levels.length))] : undefined;
  const readout = format(value);

  return (
    <div data-slot="value-bar" className={cn("w-full select-none", disabled && "pointer-events-none opacity-40", className)} style={{ "--vb-accent": accent } as CSSProperties}>
      <motion.div
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={level ? `${readout}, ${level}` : readout}
        aria-disabled={disabled || undefined}
        onPointerDown={down}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={() => commit(defaultValue)}
        onKeyDown={onKeyDown}
        style={{ scaleX, transformOrigin: origin }}
        className={cn(
          "group relative isolate flex cursor-ew-resize touch-none items-center overflow-hidden bg-neutral-950/[0.04] ring-1 ring-neutral-950/[0.06] ring-inset outline-none dark:bg-neutral-50/[0.05] dark:ring-neutral-50/[0.06]",
          "focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60",
          s.bar,
        )}
      >
        {/* Fill */}
        <motion.span
          aria-hidden
          style={{ width: left }}
          className={cn(
            "absolute inset-y-0 left-0 -z-10 bg-linear-to-r from-[color-mix(in_oklab,var(--vb-accent)_8%,transparent)] to-[color-mix(in_oklab,var(--vb-accent)_26%,transparent)] transition-[filter] duration-200",
            size === "lg" ? "rounded-l-full" : "rounded-l-[inherit]",
            dragging && "brightness-125",
          )}
        />

        {/* Ticks */}
        {ticks > 0 && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -z-10 flex items-center justify-between" style={{ left: s.inset + 12, right: s.inset + 12 }}>
            {Array.from({ length: ticks }, (_, i) => (
              <span key={i} className={cn("w-px rounded-full bg-neutral-950/20 dark:bg-neutral-50/20", size === "lg" ? "h-1/3" : "h-[30%]")} />
            ))}
          </span>
        )}

        {/* Thumb */}
        <motion.span aria-hidden style={{ left }} className="absolute inset-y-0 flex items-center">
          <motion.span
            animate={{ scaleY: dragging ? 1.18 : 1, scaleX: dragging && size !== "lg" ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            className={cn(
              "block -translate-x-1/2 rounded-full",
              s.thumb,
              size === "lg"
                ? "bg-linear-to-b from-white to-neutral-200 shadow-[0_1px_0_white_inset,0_2px_6px_rgb(0_0_0/0.35)] ring-1 ring-black/20"
                : "bg-[color-mix(in_oklab,var(--vb-accent)_75%,black)] shadow-[0_1px_3px_rgb(0_0_0/0.25)] dark:bg-[color-mix(in_oklab,var(--vb-accent)_45%,white)]",
            )}
          />
        </motion.span>

        {/* Label and readout */}
        {(label || !hideValue) && size !== "lg" && (
          <span className="pointer-events-none flex w-full items-center justify-between gap-3 px-4">
            <span id={`${id}-label`} className="truncate text-neutral-600 dark:text-neutral-400">
              {label}
            </span>
            {!hideValue && <span className="font-medium whitespace-nowrap text-neutral-950 tabular-nums dark:text-neutral-50">{readout}</span>}
          </span>
        )}
        {label && size === "lg" && (
          <span id={`${id}-label`} className="sr-only">
            {label}
          </span>
        )}
      </motion.div>

      {(level || (size === "lg" && !hideValue)) && (
        <div className="relative mt-4 flex h-6 justify-center overflow-hidden text-base font-medium text-neutral-600 dark:text-neutral-400">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={level ?? readout}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="tabular-nums"
            >
              {level ?? readout}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- demo ---------------------------------- */

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <ValueBar aria-label="Strength" size="lg" min={0} max={9} defaultValue={3} ticks={9} levels={["Off", "Low", "Medium", "High", "Max"]} />
    </div>
  );
}
