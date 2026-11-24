"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type BurstProps<T> = {
  /** What streams out of the origin. Items repeat when there are more cards in flight than items. */
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Rings in flight at once. */
  rings?: number;
  /** Cards thrown out per ring. */
  perRing?: number;
  /** Outward speed, in px per second. */
  speed?: number;
  /** Card size at full scale, in px. */
  itemWidth?: number;
  itemHeight?: number;
  /** Hold everything still while the pointer is over it. */
  pauseOnHover?: boolean;
  /** A pulsing dot where everything is born. */
  showOrigin?: boolean;
  className?: string;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Everything spreading out of a single point. Rings of cards are thrown from the centre in every
 * direction, growing as they travel while the gaps between them widen, then fade at the edges and
 * are thrown again. Neighbouring rings sit between each other's spokes, so the field interleaves.
 */
export function Burst<T>({
  items,
  renderItem,
  rings = 4,
  perRing = 6,
  speed = 46,
  itemWidth = 220,
  itemHeight = 180,
  pauseOnHover = true,
  showOrigin = true,
  className,
}: BurstProps<T>) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const held = useRef(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    // Start part-way through, so the field is already spread when it first appears
    let t = 7;
    let last = performance.now();
    let raf = 0;

    const place = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const reach = Math.hypot(w / 2, h / 2) + itemWidth;
      for (let i = 0; i < rings; i++) {
        // Each ring is one step of the journey behind the one before it
        const d = (t * speed + (i * reach) / rings) % reach;
        for (let j = 0; j < perRing; j++) {
          const card = cards.current[i * perRing + j];
          if (!card) continue;
          const a = ((j + (i % 2) * 0.5) / perRing) * Math.PI * 2 + 0.3;
          const x = w / 2 + Math.cos(a) * d - itemWidth / 2;
          const y = h / 2 + Math.sin(a) * d * 0.78 - itemHeight / 2;
          const s = 0.22 + 0.78 * smooth(Math.min(1, d / (reach * 0.55)));
          const o = Math.min(1, d / 140) * Math.min(1, (reach - d) / 200);
          card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
          card.style.opacity = o.toFixed(3);
          card.style.zIndex = String(Math.round(d));
          card.style.pointerEvents = o > 0.5 ? "auto" : "none";
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!held.current && visible) {
        t += dt;
        place();
      }
      raf = requestAnimationFrame(frame);
    };

    place();
    if (!reduce) raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduce, rings, perRing, speed, itemWidth, itemHeight]);

  const count = rings * perRing;
  return (
    <div
      ref={box}
      onPointerEnter={() => pauseOnHover && (held.current = true)}
      onPointerLeave={() => (held.current = false)}
      className={cn("relative isolate h-[30rem] w-full overflow-hidden", className)}
    >
      {showOrigin && (
        <span aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-3 animate-ping rounded-full bg-blue-500/30 motion-reduce:animate-none" />
          <span className="relative block size-2.5 rounded-full bg-blue-500" />
        </span>
      )}
      {items.length > 0 &&
        Array.from({ length: count }, (_, k) => {
          // Spread the items across the rings so neighbours rarely repeat
          const index = (k * 5) % items.length;
          return (
            <div
              key={k}
              ref={(n) => void (cards.current[k] = n)}
              className="absolute top-0 left-0 origin-center will-change-transform"
              style={{ width: itemWidth, height: itemHeight, opacity: 0 }}
            >
              {renderItem(items[index], index)}
            </div>
          );
        })}
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
    <Burst
      items={PHOTOS}
      itemWidth={160}
      itemHeight={200}
      className="h-[28rem] rounded-2xl bg-neutral-950"
      renderItem={(p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} draggable={false} className="size-full rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" />
      )}
    />
  );
}
