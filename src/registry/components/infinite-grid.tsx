"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { cn } from "@/lib/utils";

export type InfiniteGridProps<T> = {
  /** What the grid repeats. The pattern is staggered so the same item rarely sits beside itself. */
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  cellWidth?: number;
  cellHeight?: number;
  gap?: number;
  /** Pan with the wheel and trackpad too. Turn off when the grid sits inside a scrolling page. */
  wheel?: boolean;
  className?: string;
  "aria-label"?: string;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * A canvas that goes on forever in every direction. Drag it and it carries on with
 * momentum; only the cells on screen are rendered, so it costs the same anywhere you go.
 */
export function InfiniteGrid<T>({
  items,
  renderItem,
  cellWidth = 260,
  cellHeight = 200,
  gap = 16,
  wheel = true,
  className,
  "aria-label": label = "Infinite grid. Drag, or use the arrow keys, to move around.",
}: InfiniteGridProps<T>) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const sx = cellWidth + gap;
  const sy = cellHeight + gap;

  const [view, setView] = useState({ w: 0, h: 0 });
  const [origin, setOrigin] = useState({ c: 0, r: 0 });
  const [dragging, setDragging] = useState(false);

  /* Where the world sits relative to the frame. */
  const ox = useMotionValue(0);
  const oy = useMotionValue(0);
  const glide = useRef<AnimationPlaybackControls[]>([]);
  const drag = useRef({ x: 0, y: 0, t: 0, vx: 0, vy: 0, moved: 0 });

  const stop = () => {
    glide.current.forEach((a) => a.stop());
    glide.current = [];
  };

  /* Re-render only when the pan crosses a cell boundary; in between, one transform moves everything. */
  const sync = () => {
    const c = Math.floor(-ox.get() / sx) - 1;
    const r = Math.floor(-oy.get() / sy) - 1;
    setOrigin((o) => (o.c === c && o.r === r ? o : { c, r }));
  };
  useMotionValueEvent(ox, "change", sync);
  useMotionValueEvent(oy, "change", sync);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    // Start with a cell in the middle of the frame.
    ox.set(el.clientWidth / 2 - cellWidth / 2);
    oy.set(el.clientHeight / 2 - cellHeight / 2);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ox, oy, cellWidth, cellHeight]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !wheel) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stop();
      ox.set(ox.get() - e.deltaX);
      oy.set(oy.get() - e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel, ox, oy]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0, moved: 0 };
    setDragging(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const d = drag.current;
    const now = performance.now();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t);
    // Smoothed velocity in px/s, for the throw
    d.vx = d.vx * 0.6 + (dx / dt) * 1000 * 0.4;
    d.vy = d.vy * 0.6 + (dy / dt) * 1000 * 0.4;
    d.moved += Math.abs(dx) + Math.abs(dy);
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
    ox.set(ox.get() + dx);
    oy.set(oy.get() + dy);
  };
  const up = () => {
    if (!dragging) return;
    setDragging(false);
    const { vx, vy } = drag.current;
    if (reduce || performance.now() - drag.current.t > 80) return;
    const throwOpts = { type: "inertia" as const, power: 0.6, timeConstant: 420, restDelta: 0.5 };
    glide.current = [animate(ox, ox.get(), { ...throwOpts, velocity: vx }), animate(oy, oy.get(), { ...throwOpts, velocity: vy })];
  };
  /* A drag that travelled is not a click on whatever it started over. */
  const swallowClick = (e: React.MouseEvent) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const key = (e: KeyboardEvent) => {
    const by: Record<string, [number, number]> = { ArrowLeft: [sx, 0], ArrowRight: [-sx, 0], ArrowUp: [0, sy], ArrowDown: [0, -sy] };
    const step = by[e.key];
    if (!step) return;
    e.preventDefault();
    stop();
    const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 30 };
    glide.current = [animate(ox, ox.get() + step[0], spring), animate(oy, oy.get() + step[1], spring)];
  };

  const cols = Math.ceil(view.w / sx) + 3;
  const rows = Math.ceil(view.h / sy) + 3;
  const n = items.length;
  // A stride that is co-prime-ish with the count keeps neighbours different row to row.
  const skip = Math.max(1, Math.floor(n / 2) + 1);

  const cells: ReactNode[] = [];
  if (n && view.w) {
    for (let r = origin.r; r < origin.r + rows; r++) {
      const shift = mod(r, 2) ? sx / 2 : 0;
      for (let c = origin.c; c < origin.c + cols; c++) {
        const index = mod(c + r * skip, n);
        cells.push(
          <div key={`${c}:${r}`} className="absolute" style={{ left: c * sx + shift, top: r * sy, width: cellWidth, height: cellHeight }}>
            {renderItem(items[index], index)}
          </div>,
        );
      }
    }
  }

  return (
    <div
      ref={ref}
      role="group"
      tabIndex={0}
      aria-label={label}
      aria-roledescription="canvas"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={swallowClick}
      onKeyDown={key}
      className={cn(
        "relative h-[28rem] w-full touch-none overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
    >
      <motion.div className="absolute top-0 left-0" style={{ x: ox, y: oy }}>
        {cells}
      </motion.div>
    </div>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A city skyline at dusk" },
  { src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "Palms around a lagoon at sunset" },
  { src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A breakwater in a stormy sea" },
];

export default function Demo() {
  return (
    <InfiniteGrid
      items={PHOTOS}
      cellWidth={200}
      cellHeight={250}
      className="h-[26rem] rounded-2xl bg-neutral-950 ring-1 ring-black/5 dark:ring-white/10"
      renderItem={(p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} draggable={false} className="size-full rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" />
      )}
    />
  );
}
