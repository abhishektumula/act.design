"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CompareSliderProps = {
  /** Shown on the left of the divider. Anything: an image, a screenshot, a component. */
  before: ReactNode;
  /** Shown on the right of the divider. */
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Where the divider starts, 0 to 100. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  "aria-label"?: string;
};

/**
 * Two views of one thing, split by a divider you drag. The divider bends with the speed
 * you move it and springs straight when you stop, and the edge of the top view bends with it.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  defaultValue = 50,
  onValueChange,
  className,
  "aria-label": label = "Compare",
}: CompareSliderProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(defaultValue);

  /* 0 to 1 across the frame. */
  const pos = useMotionValue(defaultValue / 100);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const x = useTransform(() => pos.get() * width.get());
  /* How hard the divider is being moved, in px/s, mapped to how far it bows. Every change of
     position (drag, click, keys) feeds it; it falls back to zero a moment after movement stops. */
  const kick = useMotionValue(0);
  const bend = useSpring(kick, { stiffness: 320, damping: 16 });
  const last = useRef({ p: defaultValue / 100, t: 0 });
  const settle = useRef(0);
  useMotionValueEvent(pos, "change", (p) => {
    const now = performance.now();
    const dt = Math.max(8, now - last.current.t);
    const v = ((p - last.current.p) * width.get() * 1000) / dt;
    last.current = { p, t: now };
    if (reduce) return;
    kick.set(Math.max(-70, Math.min(70, v * 0.028)));
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => kick.set(0), 60);
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      width.set(el.clientWidth);
      height.set(el.clientHeight);
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const clip = useTransform(() => {
    const [x0, b, h] = [x.get(), bend.get(), height.get()];
    return `path("M0 0 L${x0} 0 Q${x0 + b} ${h / 2} ${x0} ${h} L0 ${h} Z")`;
  });
  const line = useTransform(() => {
    const [x0, b, h] = [x.get(), bend.get(), height.get()];
    return `M${x0} 0 Q${x0 + b} ${h / 2} ${x0} ${h}`;
  });
  /* The handle rides the curve's midpoint. */
  const handleX = useTransform(() => x.get() + bend.get() / 2);

  const commit = (p: number) => {
    const v = Math.round(Math.min(1, Math.max(0, p)) * 1000) / 10;
    setValue(v);
    onValueChange?.(v);
  };

  const fromPointer = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const p = Math.min(1, Math.max(0, fromPointer(e)));
    // A click away from the divider glides there; then it follows the pointer exactly.
    animate(pos, p, reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 });
    commit(p);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const p = Math.min(1, Math.max(0, fromPointer(e)));
    pos.set(p);
    commit(p);
  };
  const up = () => setDragging(false);

  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const to: Record<string, number> = { ArrowLeft: pos.get() - step, ArrowRight: pos.get() + step, Home: 0, End: 1 };
    if (!(e.key in to)) return;
    e.preventDefault();
    const p = Math.min(1, Math.max(0, to[e.key]));
    animate(pos, p, reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 });
    commit(p);
  };

  return (
    <div
      ref={ref}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cn(
        "relative isolate aspect-[16/10] w-full touch-none overflow-hidden rounded-2xl bg-neutral-900 select-none ring-1 ring-black/10 dark:ring-white/10",
        dragging ? "cursor-grabbing" : "cursor-ew-resize",
        className,
      )}
    >
      <div className="absolute inset-0">{after}</div>
      <motion.div className="absolute inset-0" style={{ clipPath: size.w ? clip : `inset(0 ${100 - defaultValue}% 0 0)` }}>
        {before}
      </motion.div>

      <Label side="left" text={beforeLabel} hidden={value < 14} />
      <Label side="right" text={afterLabel} hidden={value > 86} />

      {size.w > 0 && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <motion.path d={line} fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={6} />
          <motion.path d={line} fill="none" stroke="white" strokeWidth={2} />
        </svg>
      )}

      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${Math.round(value)}% ${beforeLabel}`}
        onKeyDown={key}
        style={{ x: handleX }}
        animate={{ scale: dragging ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="absolute top-1/2 left-0 grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-white text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0/0.3)] ring-1 ring-black/5 outline-none focus-visible:ring-4 focus-visible:ring-blue-500/60"
      >
        <span className="flex -space-x-1">
          <ChevronLeft className="size-4" />
          <ChevronRight className="size-4" />
        </span>
      </motion.div>
    </div>
  );
}

function Label({ side, text, hidden }: { side: "left" | "right"; text: string; hidden: boolean }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 rounded-md bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur transition-opacity duration-200",
        side === "left" ? "left-3" : "right-3",
        hidden && "opacity-0",
      )}
    >
      {text}
    </span>
  );
}

/* ----------------------------------- demo ---------------------------------- */

/** The same valley twice: once at noon, once at night. Flat colour layers only. */
function Valley({ night }: { night?: boolean }) {
  const c = night
    ? { sky: "var(--color-slate-950)", orb: "var(--color-slate-200)", far: "var(--color-slate-800)", mid: "var(--color-slate-700)", near: "var(--color-slate-900)", lake: "var(--color-slate-800)", glint: "var(--color-slate-400)" }
    : { sky: "var(--color-sky-200)", orb: "var(--color-amber-300)", far: "var(--color-sky-400)", mid: "var(--color-emerald-600)", near: "var(--color-emerald-800)", lake: "var(--color-sky-500)", glint: "var(--color-white)" };
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden>
      <rect width="800" height="500" fill={c.sky} />
      {night &&
        Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={(i * 197) % 800} cy={(i * 89) % 230} r={i % 5 === 0 ? 1.8 : 1} fill="white" opacity={0.4 + (i % 3) * 0.2} />
        ))}
      <circle cx="590" cy="120" r={night ? 34 : 44} fill={c.orb} />
      {night && <circle cx="606" cy="108" r="32" fill={c.sky} />}
      <path d="M0 300 L120 190 L230 270 L360 150 L500 260 L620 180 L800 290 L800 500 L0 500Z" fill={c.far} />
      <path d="M0 340 L150 250 L300 330 L430 240 L590 320 L720 260 L800 300 L800 500 L0 500Z" fill={c.mid} />
      <rect y="380" width="800" height="120" fill={c.lake} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={540 + i * 14 - i * i * 6} y={398 + i * 18} width={100 - i * 22} height="3" rx="1.5" fill={c.glint} opacity={0.5} />
      ))}
      <path d="M0 360 L90 330 L200 375 L0 400Z M800 350 L690 335 L600 380 L800 405Z" fill={c.near} />
    </svg>
  );
}

export default function Demo() {
  return (
    <div className="w-full max-w-xl">
      <CompareSlider before={<Valley />} after={<Valley night />} beforeLabel="Noon" afterLabel="Midnight" aria-label="Noon and midnight" />
    </div>
  );
}
