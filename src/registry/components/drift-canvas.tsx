"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
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
  /** Grab and move the canvas in any direction; it carries on with momentum, then drifts again. */
  draggable?: boolean;
  /** Hold everything still while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Offset every other row by half a card, like bricks. */
  stagger?: boolean;
  className?: string;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * An endless canvas that drifts one way, like a marquee in two dimensions: sideways, up, down or on
 * a diagonal. Grab it and move it anywhere; let go and it carries on with momentum before easing back
 * into its drift. Only the cards on screen are rendered, so it costs the same however long it runs.
 */
export function DriftCanvas<T>({
  items,
  renderItem,
  itemWidth = 240,
  itemHeight = 300,
  gap = 20,
  angle = 200,
  speed = 28,
  draggable = true,
  pauseOnHover = false,
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
  /* Drag state, and the momentum a throw leaves behind, in px per second. */
  const drag = useRef({ pressed: false, active: false, id: 0, x: 0, y: 0, t: 0, moved: 0 });
  const fling = useRef({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
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
      if (visible && !drag.current.active) {
        // The drift, unless held by hover, plus whatever a throw left, fading away
        const k = Math.exp(-dt / 0.45);
        const f = fling.current;
        const d = held.current ? 0 : 1;
        ox.set(ox.get() + (vx * d + f.x) * dt);
        oy.set(oy.get() + (vy * d + f.y) * dt);
        f.x *= k;
        f.y *= k;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [angle, speed, reduce, ox, oy]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    // Not a drag yet: a press that never moves stays a click on whatever is under it.
    drag.current = { pressed: true, active: false, id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.pressed) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      // It moved: from here on it is a drag, and the canvas takes the pointer.
      d.active = true;
      e.currentTarget.setPointerCapture(d.id);
      fling.current = { x: 0, y: 0 };
      setGrabbing(true);
    }
    const now = performance.now();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t) / 1000;
    // Smoothed throw velocity
    fling.current = { x: fling.current.x * 0.6 + (dx / dt) * 0.4, y: fling.current.y * 0.6 + (dy / dt) * 0.4 };
    d.moved += Math.abs(dx) + Math.abs(dy);
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
    ox.set(ox.get() + dx);
    oy.set(oy.get() + dy);
  };
  const up = () => {
    const d = drag.current;
    d.pressed = false;
    if (!d.active) return;
    d.active = false;
    setGrabbing(false);
    // A pause before letting go means no throw
    if (reduce || performance.now() - d.t > 90) fling.current = { x: 0, y: 0 };
  };
  /* A drag that travelled is not a click on whatever it started over. */
  const swallow = (e: MouseEvent) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

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
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={swallow}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        "relative isolate h-[32rem] w-full overflow-hidden select-none",
        draggable && (grabbing ? "cursor-grabbing touch-none" : "cursor-grab touch-none"),
        " [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent),linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]",
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
