"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  title: string;
  /** A short tag under the title, usually a year. */
  date?: string;
  /** Shown in the card that pops up over the peak. */
  description?: string;
};

/** Gradient stops for the line. Stock Tailwind colours; pass any CSS colours of your own. */
export const timelinePalettes = {
  rainbow: ["var(--color-rose-500)", "var(--color-amber-400)", "var(--color-emerald-500)", "var(--color-sky-500)", "var(--color-violet-500)"],
  sunset: ["var(--color-amber-300)", "var(--color-orange-500)", "var(--color-rose-500)", "var(--color-fuchsia-600)"],
  ocean: ["var(--color-teal-400)", "var(--color-sky-500)", "var(--color-blue-600)", "var(--color-indigo-500)"],
  aurora: ["var(--color-lime-400)", "var(--color-emerald-500)", "var(--color-cyan-500)", "var(--color-violet-500)"],
  mono: ["var(--color-neutral-400)", "var(--color-neutral-600)", "var(--color-neutral-900)"],
} satisfies Record<string, string[]>;

export type TimelinePalette = keyof typeof timelinePalettes;

const CARD = 128; // room above the line for the card
const STEP = 3; // px between sampled points of the curve

/**
 * Milestones on a line that rises into a hill under the one you're on. Move the
 * cursor along it or scroll over it and the hill follows, the nearest
 * milestone's card popping up over the peak; let go and it settles on that
 * milestone. Touch drags it, and the arrow keys step it. The line is a
 * gradient you choose. At either end the wheel hands the page back.
 */
export function Timeline({
  items,
  value: controlled,
  defaultValue = 0,
  onValueChange,
  colors = timelinePalettes.rainbow,
  peak = 84,
  strokeWidth = 2.5,
  wheel = true,
  className,
}: {
  items: TimelineItem[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /** Gradient stops along the line, left to right. Any CSS colours. */
  colors?: string[];
  /** Height of the hill in px. */
  peak?: number;
  strokeWidth?: number;
  /** Slide along the line with the scroll wheel while the pointer is over it. */
  wheel?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const curve = useRef<SVGPathElement>(null);
  const area = useRef<SVGPathElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const [width, setWidth] = useState(0);
  const [inner, setInner] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  // While the cursor or the wheel is steering, the hill sits at a fractional position.
  const steering = useRef(false);
  const aim = useRef(0);

  const n = Math.max(1, items.length);
  const clampIndex = (i: number) => Math.min(n - 1, Math.max(0, Math.round(i)));
  const active = clampIndex(controlled ?? inner);

  const base = peak + 34; // baseline y inside the svg
  const height = base + 14;
  const gap = width / n;
  const xAt = (i: number) => gap / 2 + i * gap;

  const pos = useSpring(active, { stiffness: 260, damping: 30 });
  const peakX = useMotionValue(0);
  const peakY = useMotionValue(base - peak);

  // Latest values for the native wheel listener.
  const live = useRef<{ active: number; n: number; select: (i: number) => void; steer: (f: number) => void; settle: () => void }>(null);
  const select = (i: number) => {
    const next = clampIndex(i);
    if (controlled === undefined) setInner(next);
    if (next !== active) onValueChange?.(next);
  };
  useEffect(() => {
    live.current = { active, n, select, steer, settle };
  });

  // Track the width so the curve is drawn in real pixels.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Glide to the chosen milestone (unless the cursor or wheel is steering).
  useEffect(() => {
    if (steering.current) return;
    if (reduce) pos.jump(active);
    else pos.set(active);
  }, [active, reduce, pos]);

  // Redraw the hill, the dots riding on it and the peak whenever the position moves.
  useEffect(() => {
    if (!width) return;
    const sigma = gap * 0.42;
    const yAt = (x: number, p: number) => {
      const d = x - xAt(p);
      return base - peak * Math.exp(-(d * d) / (2 * sigma * sigma));
    };
    const draw = (p: number) => {
      let d = `M0 ${yAt(0, p).toFixed(2)}`;
      for (let x = STEP; x < width; x += STEP) d += ` L${x} ${yAt(x, p).toFixed(2)}`;
      d += ` L${width} ${yAt(width, p).toFixed(2)}`;
      curve.current?.setAttribute("d", d);
      area.current?.setAttribute("d", `${d} L${width} ${base} L0 ${base} Z`);
      dots.current.forEach((c, i) => c?.setAttribute("cy", yAt(xAt(i), p).toFixed(2)));
      peakX.set(xAt(p));
      peakY.set(yAt(xAt(p), p));
    };
    draw(pos.get());
    return pos.on("change", draw);
    // xAt depends on width and n only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, n, base, peak, gap, pos, peakX, peakY]);

  // Scrolling slides the hill along the line; when the wheel rests it settles on
  // the nearest milestone. At either end the page scrolls on.
  useEffect(() => {
    const el = root.current;
    if (!el || !wheel) return;
    let at = 0;
    let rest: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      const L = live.current;
      if (!L) return;
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const d = e.deltaMode === 1 ? raw * 16 : raw; // lines → px
      if (!steering.current) at = L.active;
      if (!d || (d < 0 && at <= 0) || (d > 0 && at >= L.n - 1)) return;
      e.preventDefault();
      at = Math.min(L.n - 1, Math.max(0, at + d / 160));
      L.steer(at);
      clearTimeout(rest);
      rest = setTimeout(() => live.current?.settle(), 180);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(rest);
      el.removeEventListener("wheel", onWheel);
    };
  }, [wheel]);

  const fromPointer = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    return Math.min(n - 1, Math.max(0, (e.clientX - r.left - gap / 2) / gap));
  };

  /** Put the hill at a fractional position; the nearest milestone becomes active. */
  function steer(f: number) {
    steering.current = true;
    aim.current = f;
    if (reduce) pos.jump(f);
    else pos.set(f);
    select(f);
  }

  /** Stop steering and come to rest on the active milestone. */
  function settle() {
    if (!steering.current) return;
    steering.current = false;
    const to = clampIndex(aim.current);
    if (reduce) pos.jump(to);
    else pos.set(to);
    select(to);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? active + 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? active - 1
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next);
  };

  // The colour of the gradient roughly where milestone i sits.
  const colorAt = (i: number) => colors[Math.round(((i + 0.5) / n) * (colors.length - 1))] ?? colors[0];

  const cardW = Math.min(260, Math.max(0, width - 8));
  const cardX = useTransform(peakX, (x) => Math.min(width - cardW, Math.max(0, x - cardW / 2)));
  const item = items[active];

  return (
    <div
      ref={root}
      role="group"
      aria-roledescription="timeline"
      aria-label={item ? `${item.title}${item.date ? `, ${item.date}` : ""}, ${active + 1} of ${n}` : undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={(e) => {
        // A mouse steers by hovering; touch and pen steer while pressed.
        if (e.pointerType === "mouse" || dragging) steer(fromPointer(e));
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && settle()}
      className={cn("relative w-full rounded-xl outline-none select-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:focus-visible:ring-neutral-50/20", className)}
      style={{ height: CARD + base + 62 }}
    >
      {/* The card over the peak */}
      {width > 0 && item && (
        <motion.div aria-live="polite" className="pointer-events-none absolute top-0 flex items-end" style={{ x: cardX, width: cardW, height: CARD + base - peak - 14 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="w-full origin-bottom rounded-xl bg-white/90 dark:bg-neutral-900/90 p-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_32px_-12px_rgb(0_0_0/0.25)] ring-1 ring-neutral-950/[0.07] dark:ring-neutral-50/[0.08] backdrop-blur"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">{item.title}</span>
                {item.date && (
                  <span className="shrink-0 text-xs font-medium tabular-nums" style={{ color: colorAt(active) }}>
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-pretty text-neutral-600 dark:text-neutral-400">{item.description}</p>}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* The line */}
      {width > 0 && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute left-0 cursor-pointer touch-pan-y overflow-visible"
          style={{ top: CARD }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            steer(fromPointer(e));
          }}
          onPointerUp={(e) => {
            setDragging(false);
            if (e.pointerType !== "mouse") settle();
          }}
          onPointerCancel={() => {
            setDragging(false);
            settle();
          }}
        >
          <defs>
            <linearGradient id={`${uid}-ink`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={width} y2={0}>
              {colors.map((c, i) => (
                <stop key={i} offset={colors.length > 1 ? i / (colors.length - 1) : 0} style={{ stopColor: c }} />
              ))}
            </linearGradient>
            <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={width} y2={0}>
              <stop offset={0} stopColor="white" stopOpacity={0} />
              <stop offset={0.07} stopColor="white" />
              <stop offset={0.93} stopColor="white" />
              <stop offset={1} stopColor="white" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${uid}-fall`} gradientUnits="userSpaceOnUse" x1={0} y1={base - peak} x2={0} y2={base}>
              <stop offset={0} stopColor="white" stopOpacity={0.3} />
              <stop offset={1} stopColor="white" stopOpacity={0} />
            </linearGradient>
            <mask id={`${uid}-edges`} maskUnits="userSpaceOnUse" x={0} y={-20} width={width} height={height + 40}>
              <rect x={0} y={-20} width={width} height={height + 40} fill={`url(#${uid}-edge)`} />
            </mask>
            <mask id={`${uid}-glow`} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={`url(#${uid}-fall)`} />
            </mask>
          </defs>

          <path ref={area} fill={`url(#${uid}-ink)`} mask={`url(#${uid}-glow)`} />
          <path ref={curve} fill="none" stroke={`url(#${uid}-ink)`} strokeWidth={strokeWidth} strokeLinecap="round" mask={`url(#${uid}-edges)`} />

          {items.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                dots.current[i] = el;
              }}
              cx={xAt(i)}
              cy={base}
              r={4.5}
              strokeWidth={1.5}
              stroke={i <= active ? `url(#${uid}-ink)` : undefined}
              className={cn("fill-white dark:fill-neutral-950", i > active && "stroke-neutral-400 dark:stroke-neutral-600")}
            />
          ))}

          {/* You are here */}
          <motion.circle cx={peakX} cy={peakY} r={13} fill={`url(#${uid}-ink)`} opacity={0.22} />
          <motion.circle cx={peakX} cy={peakY} r={6} fill={`url(#${uid}-ink)`} className="stroke-white dark:stroke-neutral-950" strokeWidth={2} />
        </svg>
      )}

      {/* Labels */}
      {width > 0 &&
        items.map((it, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => select(i)}
            className="absolute flex -translate-x-1/2 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-center outline-none"
            style={{ left: xAt(i), top: CARD + base + 12, maxWidth: Math.max(72, gap - 4) }}
          >
            <span
              className={cn(
                "max-w-full truncate text-[15px] font-medium tracking-[-0.01em] transition-colors",
                i === active ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
              )}
            >
              {it.title}
            </span>
            {it.date && (
              <span className="text-[13px] tabular-nums text-neutral-500 transition-colors" style={i === active ? { color: colorAt(i) } : undefined}>
                {it.date}
              </span>
            )}
          </button>
        ))}
    </div>
  );
}

const milestones: TimelineItem[] = [
  { title: "First sketch", date: "2019", description: "A dial drawn on the back of a receipt, and the question of why sliders never feel like anything." },
  { title: "Prototype", date: "2021", description: "Twelve components, rebuilt until each one felt right under a thumb, a trackpad and a keyboard." },
  { title: "Public beta", date: "2023", description: "The library opens up. Every component ships as one file you copy and own." },
  { title: "Blocks", date: "2025", description: "Whole sections assembled from the same parts: heroes, pricing, gauges and status pages." },
  { title: "Now", date: "2026", description: "Still fewer parts, each one finished. Scroll on and the page carries on." },
];

export default function Demo() {
  return <Timeline items={milestones} defaultValue={2} className="max-w-4xl" />;
}
