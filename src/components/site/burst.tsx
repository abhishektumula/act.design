"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "motion/react";
import { Preview } from "@/registry/previews";
import { getItem } from "@/registry/meta";
import { Fit } from "./fit";

/* Light, self-contained demos only: nothing fixed to the viewport, no shaders, no global shortcuts. */
const ITEMS = ["layer-text", "dial", "compare-slider", "card-stack", "fader", "trash-bin", "segmented-control", "stepper", "folder-card", "hold-to-confirm", "code-input"];

const RINGS = 4; // rings in flight at once
const PER = 6; // cards per ring
const SPEED = 46; // px per second, outward
const TW = 280;
const TH = 236;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The library spreading out of a single point. Rings of instruments are born at the centre and
 * stream outward in every direction, growing as they travel and fading at the edges, then they
 * are born again. Pointing at it holds everything still so a card can be read or opened.
 */
function Field() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLAnchorElement | null)[]>([]);
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
      const cx = w / 2;
      const cy = h / 2;
      const reach = Math.hypot(w / 2, h / 2) + TW;
      for (let i = 0; i < RINGS; i++) {
        // Each ring is a quarter of the journey behind the one before it
        const d = (t * SPEED + (i * reach) / RINGS) % reach;
        for (let j = 0; j < PER; j++) {
          const tile = tiles.current[i * PER + j];
          if (!tile) continue;
          // Alternate rings sit between the spokes of their neighbours, so the field interleaves
          const a = ((j + (i % 2) * 0.5) / PER) * Math.PI * 2 + 0.3;
          const x = cx + Math.cos(a) * d - TW / 2;
          const y = cy + Math.sin(a) * d * 0.78 - TH / 2;
          const s = 0.22 + 0.78 * smooth(Math.min(1, d / (reach * 0.55)));
          const o = Math.min(1, d / 140) * Math.min(1, (reach - d) / 200);
          tile.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
          tile.style.opacity = o.toFixed(3);
          tile.style.zIndex = String(Math.round(d));
          tile.style.pointerEvents = o > 0.5 ? "auto" : "none";
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
  }, [reduce]);

  return (
    <div
      ref={box}
      onPointerEnter={() => (held.current = true)}
      onPointerLeave={() => (held.current = false)}
      className="absolute inset-0 overflow-hidden"
    >
      {/* The origin */}
      <span aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute -inset-3 animate-ping rounded-full bg-signal/30" />
        <span className="relative block size-2.5 rounded-full bg-signal" />
      </span>
      {Array.from({ length: RINGS * PER }, (_, k) => {
        const slug = ITEMS[(k * 5) % ITEMS.length];
        const item = getItem(slug)!;
        return (
          <Link
            key={k}
            ref={(n) => void (tiles.current[k] = n)}
            href={`/components/${slug}`}
            draggable={false}
            style={{ width: TW, height: TH, opacity: 0 }}
            className="group absolute top-0 left-0 flex origin-center flex-col rounded-2xl bg-base-900 p-2 ring-1 ring-base-50/[0.08] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] transition-[box-shadow] will-change-transform hover:ring-base-50/25"
          >
            <div inert className="pointer-events-none relative min-h-0 flex-1 overflow-hidden rounded-xl bg-canvas p-3 ring-1 ring-base-50/[0.06]">
              <Fit>
                <Preview slug={slug} />
              </Fit>
            </div>
            <span className="flex items-center justify-between px-2 pt-2.5 pb-1 text-sm">
              <span className="font-medium text-base-100">{item.name}</span>
              <span className="text-base-500">{item.category}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Mounts the field once it nears the viewport, so two dozen live demos never load with the page. */
export function Burst() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px 0px" });
  return (
    <div ref={ref} className="absolute inset-0">
      {near && <Field />}
    </div>
  );
}
