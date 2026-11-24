"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type PruneHandle = {
  /** Prunes the image from a point (in px, relative to the frame) or, without one, a random spot. */
  prune: (at?: { x: number; y: number }) => Promise<void>;
};

export type PruneRevealProps = {
  src: string;
  alt: string;
  /** How long the glowing front takes to cross the whole image, in ms. */
  duration?: number;
  /** Prune from the point you click. */
  pruneOnClick?: boolean;
  onPruned?: () => void;
  className?: string;
  ref?: Ref<PruneHandle>;
};

type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number };

const CONTACT = 260; // ms of spark and jitter before the front starts to spread
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** A wobble around the front, so it spreads like a burning edge rather than a circle. */
const ragged = (a: number, t: number) =>
  0.5 * Math.sin(3 * a + 2.1 + t * 3.2) + 0.3 * Math.sin(7 * a + 1 + t * 7.5) + 0.2 * Math.sin(13 * a + 5 + t * 11);

/** Tailwind palette colours, read from the page so the canvas uses the same tokens. */
function palette(el: Element) {
  const s = getComputedStyle(el);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    heat: v("--color-orange-500", "#f97316"),
    edge: v("--color-orange-300", "#fdba74"),
    core: v("--color-amber-100", "#fef3c7"),
    spark: v("--color-amber-200", "#fde68a"),
  };
}

/**
 * Prune reveal: an image that can be pruned to show what is behind it. It is touched at one spot, flashes and jitters out of sync,
 * then a ragged orange front spreads from that spot, heating the picture just ahead of it.
 * Behind the front there is nothing left: the image comes off the edge as embers that rise
 * and burn out. Whatever sits behind the frame shows through as it goes.
 */
export function PruneReveal({ src, alt, duration = 1900, pruneOnClick = true, onPruned, className, ref }: PruneRevealProps) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const run = useRef({ busy: false, gone: false, frame: 0 });
  const [busy, setBusy] = useState(false);

  const fit = () => {
    const c = canvas.current;
    const b = box.current;
    if (!c || !b) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = b.clientWidth;
    const h = b.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };

  /* The picture, cropped to fill the frame like object-fit: cover. */
  const cover = (ctx: CanvasRenderingContext2D, w: number, h: number, dx = 0) => {
    const img = image.current;
    if (!img) return;
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * s;
    const ih = img.naturalHeight * s;
    ctx.drawImage(img, (w - iw) / 2 + dx, (h - ih) / 2, iw, ih);
  };

  const still = () => {
    const f = fit();
    if (!f || run.current.busy) return;
    f.ctx.clearRect(0, 0, f.w, f.h);
    if (!run.current.gone) cover(f.ctx, f.w, f.h);
  };

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      image.current = img;
      run.current.gone = false;
      still();
    };
    img.src = src;
    return () => {
      img.onload = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useLayoutEffect(() => {
    const b = box.current;
    if (!b) return;
    const ro = new ResizeObserver(() => still());
    ro.observe(b);
    const frame = run.current;
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prune = (at?: { x: number; y: number }) =>
    new Promise<void>((resolve) => {
      const f = fit();
      if (!f || !image.current || run.current.busy || run.current.gone) return resolve();
      const { ctx, w, h } = f;
      run.current.busy = true;
      setBusy(true);

      const finish = () => {
        run.current.busy = false;
        run.current.gone = true;
        ctx.clearRect(0, 0, w, h);
        setBusy(false);
        onPruned?.();
        resolve();
      };

      if (reduce) {
        // No spreading, no embers: the image simply leaves.
        const start = performance.now();
        const fade = (now: number) => {
          const t = clamp((now - start) / 300);
          ctx.clearRect(0, 0, w, h);
          ctx.globalAlpha = 1 - t;
          cover(ctx, w, h);
          ctx.globalAlpha = 1;
          if (t < 1) run.current.frame = requestAnimationFrame(fade);
          else finish();
        };
        run.current.frame = requestAnimationFrame(fade);
        return;
      }

      const c = palette(box.current!);
      // The point of contact: given, or somewhere well inside the picture.
      const ox = at?.x ?? w * (0.18 + Math.random() * 0.64);
      const oy = at?.y ?? h * (0.18 + Math.random() * 0.64);
      const reach = Math.max(Math.hypot(ox, oy), Math.hypot(w - ox, oy), Math.hypot(ox, h - oy), Math.hypot(w - ox, h - oy)) + 40;
      const embers: Ember[] = [];
      const N = 96;
      const start = performance.now();
      let prev = start;

      const frame = (now: number) => {
        const e = now - start;
        const dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        const t = clamp((e - CONTACT) / duration);
        // Slow to catch, then it runs: the front accelerates across the picture.
        const r = t > 0 ? reach * Math.pow(t, 1.35) : 0;
        const amp = Math.min(r * 0.3, 26);
        const pts: [number, number][] = [];
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          const rr = Math.max(0, r + amp * ragged(a, e / 1000));
          pts.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr]);
        }
        const trace = () => {
          ctx.beginPath();
          pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.closePath();
        };

        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
        // Out of sync for a moment: the picture jumps sideways a few frames as it is touched.
        const jitter = e < CONTACT + 220 && Math.random() > 0.45 ? (Math.random() - 0.5) * 8 : 0;
        cover(ctx, w, h, jitter);

        if (r > 0) {
          // Heat: the picture glows orange in a band just ahead of the front.
          ctx.globalCompositeOperation = "source-atop";
          ctx.lineJoin = "round";
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = c.heat;
          ctx.shadowColor = c.heat;
          ctx.shadowBlur = 28;
          ctx.lineWidth = 34;
          trace();
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;

          // Behind the front: gone.
          ctx.globalCompositeOperation = "destination-out";
          trace();
          ctx.fill();

          // The front itself: a hot line with a glow.
          ctx.globalCompositeOperation = "source-over";
          ctx.shadowColor = c.heat;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = c.edge;
          ctx.lineWidth = 3;
          trace();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = c.core;
          ctx.lineWidth = 1;
          trace();
          ctx.stroke();
        }

        // The contact spark: a flash where it touched, fading as the front takes over.
        if (e < CONTACT + 450) {
          const k = e < CONTACT ? e / CONTACT : 1 - (e - CONTACT) / 450;
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = clamp(k);
          ctx.fillStyle = c.spark;
          ctx.shadowColor = c.heat;
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(ox, oy, 3 + 9 * clamp(k), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

        // Embers peel off the front while it is still crossing the picture.
        if (t > 0 && t < 1) {
          const spawn = Math.min(26, 6 + r / 12);
          for (let i = 0; i < spawn && embers.length < 700; i++) {
            const [x, y] = pts[Math.floor(Math.random() * N)];
            if (x < 0 || y < 0 || x > w || y > h) continue;
            const out = Math.atan2(y - oy, x - ox);
            const speed = 10 + Math.random() * 30;
            const max = 0.6 + Math.random() * 1;
            embers.push({
              x,
              y,
              vx: Math.cos(out) * speed + (Math.random() - 0.5) * 16,
              vy: Math.sin(out) * speed - 20 - Math.random() * 30,
              life: max,
              max,
              size: 0.8 + Math.random() * 2.2,
              hue: 18 + Math.random() * 22,
            });
          }
        }

        ctx.globalCompositeOperation = "lighter";
        for (let i = embers.length - 1; i >= 0; i--) {
          const p = embers[i];
          p.life -= dt;
          if (p.life <= 0) {
            embers.splice(i, 1);
            continue;
          }
          p.vy -= 40 * dt; // they rise
          p.vx += (Math.random() - 0.5) * 60 * dt; // and wander
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const k = p.life / p.max;
          // Hot and yellow when they leave, deep orange as they burn out, with a flicker
          ctx.globalAlpha = k * (0.65 + Math.random() * 0.35);
          ctx.fillStyle = `hsl(${p.hue + 20 * k} 100% ${50 + 25 * k}%)`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        if (t >= 1 && embers.length === 0) finish();
        else run.current.frame = requestAnimationFrame(frame);
      };
      run.current.frame = requestAnimationFrame(frame);
    });

  useImperativeHandle(ref, () => ({ prune }));

  const click = (e: MouseEvent<HTMLDivElement>) => {
    if (!pruneOnClick) return;
    const r = box.current!.getBoundingClientRect();
    void prune({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div ref={box} onClick={click} className={cn("relative aspect-[4/3] w-full", pruneOnClick && !busy && "cursor-crosshair", className)}>
      <canvas ref={canvas} role="img" aria-label={alt} className="absolute inset-0 size-full" />
    </div>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const PHOTOS = [
  { alt: "A city skyline at dusk under storm clouds", src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  { alt: "Palms framing a lagoon at sunset", src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  { alt: "A breakwater running out into a stormy sea", src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
];

export default function Demo() {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const prune = useRef<PruneHandle>(null);
  const current = PHOTOS[index % PHOTOS.length];
  const next = PHOTOS[(index + 1) % PHOTOS.length];

  const go = async () => {
    setBusy(true);
    await prune.current?.prune();
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-950 ring-1 ring-black/10 dark:ring-white/10">
        {/* The next picture waits underneath and shows through as the current one is pruned */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={next.src} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
        <PruneReveal
          key={index}
          ref={prune}
          src={current.src}
          alt={current.alt}
          className="aspect-[4/5]"
          onPruned={() => {
            setBusy(false);
            setIndex((i) => i + 1);
          }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">Click the picture, or prune it from a random spot.</p>
        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="h-9 shrink-0 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-colors hover:bg-orange-500 disabled:opacity-50"
        >
          Prune
        </button>
      </div>
    </div>
  );
}
