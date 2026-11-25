"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const switchVariants = cva(
  "group relative inline-flex shrink-0 cursor-pointer touch-none items-center rounded-full bg-neutral-950/10 dark:bg-neutral-50/10 shadow-[inset_0_1px_2px_rgb(0_0_0/0.22),inset_0_0_0_1px_rgb(0_0_0/0.04)] outline-none select-none hover:bg-neutral-950/[0.14] dark:hover:bg-neutral-50/[0.14] focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-6 w-10",
        md: "h-8 w-[54px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const sizes = { sm: { thumb: 18, w: 40 }, md: { thumb: 26, w: 54 } };
const PAD = 3;

/**
 * A toggle with some physics in it. The colour pours in behind the thumb as it travels,
 * the thumb stretches when you press it and smears with its speed, a lamp on it lights
 * when it's on, and switching on sends a ring out from it. Tap it, or drag the thumb and
 * it follows your finger; let go and it springs to the nearer side.
 */
export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  size = "md",
  color = "var(--color-blue-500)",
  className,
  ...aria
}: VariantProps<typeof switchVariants> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** The on colour. Any CSS colour. */
  color?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultChecked);
  const on = controlled ?? inner;
  const s = sizes[size ?? "md"];
  const travel = s.w - s.thumb - PAD * 2;

  /* Where the thumb is headed, and where it is: a spring, so it overshoots a touch. */
  const target = useMotionValue(on ? travel : 0);
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  const x = useSpring(target, reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 30, mass: 0.7 });
  useEffect(() => {
    if (!drag.current?.moved) target.set(on ? travel : 0);
  }, [on, travel, target]);

  const [pressed, setPressed] = useState(false);
  const [rings, setRings] = useState(0);
  const press = useSpring(0, { stiffness: 600, damping: 32 });
  useEffect(() => press.set(pressed && !reduce ? 1 : 0), [pressed, press, reduce]);

  /* The thumb grows on press and smears with its speed, always into the track, never out. */
  const speed = useVelocity(x);
  const extra = useTransform(() => press.get() * 5 + Math.min(9, Math.abs(speed.get()) / 70));
  const progress = useTransform(x, (v) => Math.min(1, Math.max(0, v / travel)));
  const width = useTransform(() => s.thumb + extra.get());
  const left = useTransform(() => x.get() - extra.get() * progress.get());
  /* The fill pours in behind the thumb, its edge riding the thumb's far side. */
  const fill = useTransform(() => left.get() + width.get() + PAD * 2);
  const fillOpacity = useTransform(progress, [0, 0.12, 1], [0, 0.85, 1]);
  const lamp = useTransform(progress, [0.55, 1], [0, 1]);
  const offMark = useTransform(progress, [0, 0.5], [1, 0]);

  const set = (next: boolean) => {
    target.set(next ? travel : 0);
    if (next === on) return;
    navigator.vibrate?.(6);
    if (next && !reduce) setRings((r) => r + 1);
    if (controlled === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  /* ---- Drag: the thumb follows the pointer, and lets go to the nearer side. ---- */
  const skipClick = useRef(false);
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    drag.current = { x: e.clientX, from: target.get(), moved: false };
    setPressed(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
    d.moved = true;
    target.set(Math.min(travel, Math.max(0, d.from + dx)));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setPressed(false);
    if (d?.moved) {
      skipClick.current = true;
      set(target.get() > travel / 2);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      data-state={on ? "on" : "off"}
      data-slot="switch"
      onClick={() => {
        if (skipClick.current) skipClick.current = false;
        else set(!on);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") set(true);
        if (e.key === "ArrowLeft") set(false);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => !drag.current && setPressed(false)}
      style={{ "--switch": color } as CSSProperties}
      className={cn(switchVariants({ size }), className)}
      {...aria}
    >
      {/* Fill */}
      <motion.span aria-hidden style={{ width: fill, opacity: fillOpacity }} className="absolute inset-y-0 left-0 rounded-full bg-(--switch) shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)]" />

      {/* Marks printed on the track: a bar where the thumb leaves when on, a ring where it rests when off */}
      <motion.span aria-hidden style={{ opacity: lamp, left: PAD + s.thumb / 2 }} className="absolute top-1/2 h-[34%] w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
      <motion.span
        aria-hidden
        style={{ opacity: offMark, right: PAD + s.thumb / 2 }}
        className="absolute top-1/2 size-[28%] translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-neutral-950/25 dark:border-neutral-50/30"
      />

      {/* A ring goes out from the thumb when it switches on */}
      <AnimatePresence>
        {rings > 0 && (
          <motion.span
            key={rings}
            aria-hidden
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setRings(0)}
            style={{ width: s.thumb, height: s.thumb, left: PAD + travel }}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-(--switch)"
          />
        )}
      </AnimatePresence>

      {/* Thumb */}
      <motion.span
        aria-hidden
        style={{ width, height: s.thumb, x: left, left: PAD }}
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-linear-to-b from-white to-neutral-100 shadow-[0_1px_0_white_inset,0_1px_1px_rgb(0_0_0/0.14),0_3px_8px_-2px_rgb(0_0_0/0.28)] dark:from-neutral-50 dark:to-neutral-200"
      >
        {/* Lamp */}
        <span className="absolute top-1/2 left-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950/10 shadow-[inset_0_0.5px_1px_rgb(0_0_0/0.25)]" />
        <motion.span
          style={{ opacity: lamp }}
          className="absolute top-1/2 left-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--switch) shadow-[0_0_6px_var(--switch)]"
        />
      </motion.span>
    </button>
  );
}
