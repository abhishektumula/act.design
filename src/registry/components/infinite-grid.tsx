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

type Tile = { kind: "stat" | "bars" | "toggle" | "people" | "progress" | "note"; title: string };

const TILES: Tile[] = [
  { kind: "stat", title: "Revenue" },
  { kind: "bars", title: "Traffic" },
  { kind: "toggle", title: "Alerts" },
  { kind: "people", title: "Team" },
  { kind: "progress", title: "Storage" },
  { kind: "note", title: "Notes" },
  { kind: "stat", title: "Signups" },
  { kind: "bars", title: "Latency" },
];

function MiniCard({ tile, index }: { tile: Tile; index: number }) {
  const seed = (index * 37) % 100;
  return (
    <div className="flex size-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <p className="text-xs font-medium text-neutral-500">{tile.title}</p>
      <div className="mt-auto">
        {tile.kind === "stat" && (
          <p className="text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-white">
            {tile.title === "Revenue" ? `$${(24 + seed / 4).toFixed(1)}k` : (1200 + seed * 13).toLocaleString("en-US")}
          </p>
        )}
        {tile.kind === "bars" && (
          <div className="flex h-20 items-end gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={cn("flex-1 rounded-sm", i === 9 ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700")} style={{ height: `${25 + ((i * 29 + seed) % 70)}%` }} />
            ))}
          </div>
        )}
        {tile.kind === "toggle" &&
          ["Email", "Slack", "Phone"].map((t, i) => (
            <div key={t} className="flex items-center justify-between py-1 text-sm text-neutral-700 dark:text-neutral-300">
              {t}
              <span className={cn("flex h-5 w-8 items-center rounded-full p-0.5", i !== 1 ? "justify-end bg-blue-500" : "bg-neutral-300 dark:bg-neutral-700")}>
                <span className="size-4 rounded-full bg-white" />
              </span>
            </div>
          ))}
        {tile.kind === "people" && (
          <div className="flex -space-x-2">
            {["bg-neutral-300", "bg-neutral-400", "bg-neutral-500", "bg-blue-500"].map((c, i) => (
              <span key={i} className={cn("size-9 rounded-full ring-2 ring-white dark:ring-neutral-900", c)} />
            ))}
          </div>
        )}
        {tile.kind === "progress" && (
          <>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{40 + (seed % 50)}% used</p>
            <div className="mt-2 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${40 + (seed % 50)}%` }} />
            </div>
          </>
        )}
        {tile.kind === "note" && (
          <div className="space-y-2">
            {[90, 70, 80, 40].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <InfiniteGrid
      items={TILES}
      renderItem={(tile, i) => <MiniCard tile={tile} index={i} />}
      cellWidth={220}
      cellHeight={170}
      className="h-[26rem] rounded-2xl bg-neutral-100 ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10"
    />
  );
}
