"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type DriftCanvasProps<T> = {
  /** What fills the canvas. It repeats forever, staggered so neighbours rarely match. */
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  /** Which way everything drifts, in degrees: 0 is right, 90 down, 180 left, 270 up. */
  angle?: number;
  /** Drift speed, in px per second. */
  speed?: number;
  /** Hold everything still while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Offset every other row by half a card, like bricks. */
  stagger?: boolean;
  className?: string;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * An endless canvas that drifts one way, like a marquee in two dimensions: sideways, up, down or on
 * a diagonal. Only the cards on screen are rendered, so it costs the same however long it runs.
 */
export function DriftCanvas<T>({
  items,
  renderItem,
  itemWidth = 240,
  itemHeight = 300,
  gap = 20,
  angle = 200,
  speed = 28,
  pauseOnHover = true,
  stagger = true,
  className,
}: DriftCanvasProps<T>) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const sx = itemWidth + gap;
  const sy = itemHeight + gap;
  const ox = useMotionValue(0);
  const oy = useMotionValue(0);
  const held = useRef(false);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [origin, setOrigin] = useState({ c: 0, r: 0 });

  /* Re-render only when the drift crosses a cell boundary; between, one transform moves everything. */
  const sync = () => {
    const c = Math.floor(-ox.get() / sx) - 1;
    const r = Math.floor(-oy.get() / sy) - 1;
    setOrigin((o) => (o.c === c && o.r === r ? o : { c, r }));
  };
  useMotionValueEvent(ox, "change", sync);
  useMotionValueEvent(oy, "change", sync);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || reduce) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const rad = (angle * Math.PI) / 180;
    const vx = Math.cos(rad) * speed;
    const vy = Math.sin(rad) * speed;
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !held.current) {
        ox.set(ox.get() + vx * dt);
        oy.set(oy.get() + vy * dt);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [angle, speed, reduce, ox, oy]);

  const n = items.length;
  const skip = Math.max(1, Math.floor(n / 2) + 1);
  const cols = Math.ceil(view.w / sx) + 3;
  const rows = Math.ceil(view.h / sy) + 3;
  const cells: ReactNode[] = [];
  if (n && view.w) {
    for (let r = origin.r; r < origin.r + rows; r++) {
      const shift = stagger && mod(r, 2) ? sx / 2 : 0;
      for (let c = origin.c - 1; c < origin.c + cols; c++) {
        const i = mod(c + r * skip, n);
        cells.push(
          <div key={`${c}:${r}`} className="absolute" style={{ left: c * sx + shift, top: r * sy, width: itemWidth, height: itemHeight }}>
            {renderItem(items[i], i)}
          </div>,
        );
      }
    }
  }

  return (
    <div
      ref={box}
      onPointerEnter={() => pauseOnHover && (held.current = true)}
      onPointerLeave={() => (held.current = false)}
      className={cn(
        "relative isolate h-[32rem] w-full overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent),linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]",
        className,
      )}
    >
      <motion.div className="absolute top-0 left-0 will-change-transform" style={{ x: ox, y: oy }}>
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
    <DriftCanvas
      items={PHOTOS}
      itemWidth={200}
      itemHeight={250}
      angle={215}
      className="h-[28rem] rounded-2xl bg-neutral-950"
      renderItem={(p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} draggable={false} className="size-full rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" />
      )}
    />
  );
}
