"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type PruneRevealProps = {
  /** The generated image. Leave it empty while the image is still being made. */
  src?: string;
  /** Describes the finished image. */
  alt: string;
  /** Shown under "Generating" while the image is made. */
  prompt?: string;
  /** Force the generating state, for example while regenerating over an old image. */
  generating?: boolean;
  /** How long the burn takes to cross the whole picture, in ms. */
  duration?: number;
  onRevealed?: () => void;
  className?: string;
};

/* ------------------------------- noise field ------------------------------- */

/** Smooth value noise, seeded, so every prune burns along a different path. */
function noise2(seed: number) {
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  /** Four octaves: big lobes with ragged detail on top. */
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * value(x * f, y * f);
      f *= 2.03;
      amp *= 0.5;
    }
    return sum / 0.9375;
  };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Smoothstep: a gentle start and finish without rushing the middle. */
const ease = (t: number) => t * t * (3 - 2 * t);
const CELL = 4; // px per cell of the burn field
const CONTACT = 650; // ms the contact glow builds before the burn takes hold
const HEAT = 0.055; // how far ahead of the front the picture glows, in burn time

type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; ash: boolean; hue: number };

/**
 * An AI image that arrives by being pruned into view. While it is made, the frame pulses.
 * When it is ready, that surface is touched at a random spot and burns away from there along
 * a path of its own, a soft glowing edge ahead of it and embers and ash rising off it,
 * revealing the image underneath.
 */
export function PruneReveal({ src, alt, prompt, generating, duration = 5600, onRevealed, className }: PruneRevealProps) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const waiting = generating ?? !src;
  const showImage = !!src && ready === src;

  /* Everything the animation loop reads lives here, so the loop never restarts. */
  const s = useRef({
    phase: "generating" as "generating" | "burning" | "revealed",
    since: 0,
    appear: 1,
    prompt: prompt ?? "",
    onRevealed,
    reduce: !!reduce,
    frame: 0,
    w: 0,
    h: 0,
    field: null as Float32Array | null,
    cols: 0,
    rows: 0,
    ox: 0,
    oy: 0,
    motes: [] as Mote[],
    mask: null as HTMLCanvasElement | null,
    heat: null as HTMLCanvasElement | null,
  });

  useEffect(() => {
    s.current.prompt = prompt ?? "";
    s.current.onRevealed = () => {
      setRevealed(true);
      onRevealed?.();
    };
    s.current.reduce = !!reduce;
  });

  /* Load the image before revealing it, so the burn never uncovers a blank. */
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setReady(src);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  const begin = () => {
    const st = s.current;
    const { w, h } = st;
    if (!w || !h) return;
    st.phase = "burning";
    st.since = performance.now();
    st.motes = [];
    // The point of contact: somewhere well inside the picture.
    st.ox = w * (0.2 + Math.random() * 0.6);
    st.oy = h * (0.2 + Math.random() * 0.6);
    // When each cell catches: its distance from contact, bent by noise so the fire takes its own path.
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    const seed = Math.random() * 1000;
    const warp = noise2(seed);
    const grain = noise2(seed + 17);
    const field = new Float32Array(cols * rows);
    let max = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * CELL;
        const y = r * CELL;
        // Domain warp: push the sample point around so the front grows fingers and bays.
        const wx = x + (warp(x / 140, y / 140) - 0.5) * 170;
        const wy = y + (warp(x / 140 + 9.3, y / 140 + 4.1) - 0.5) * 170;
        const dist = Math.hypot(wx - st.ox, wy - st.oy);
        const t = dist * (0.65 + 0.7 * grain(x / 90, y / 90)) + grain(x / 22, y / 22) * 26;
        field[r * cols + c] = t;
        if (t > max) max = t;
      }
    }
    for (let i = 0; i < field.length; i++) field[i] /= max;
    st.field = field;
    st.cols = cols;
    st.rows = rows;
    const make = () => {
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      return c;
    };
    st.mask = make();
    st.heat = make();
  };

  /* Start the burn when the image is in, go back to the pulse when a new one is asked for. */
  useEffect(() => {
    const st = s.current;
    if (waiting) {
      if (st.phase !== "generating") {
        st.phase = "generating";
        st.appear = 0;
        st.motes = [];
        setRevealed(false);
      }
    } else if (showImage && st.phase === "generating") {
      begin();
    }
  }, [waiting, showImage]);

  useLayoutEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const st = s.current;
    const ctx = cv.getContext("2d")!;
    const css = getComputedStyle(el);
    const font = css.fontFamily || "system-ui, sans-serif";
    const c = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    const col = {
      ground: c("--color-neutral-900", "#171717"),
      dot: c("--color-neutral-300", "#d4d4d4"),
      text: c("--color-neutral-100", "#f5f5f5"),
      muted: c("--color-neutral-500", "#737373"),
    };

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      st.w = el.clientWidth;
      st.h = el.clientHeight;
      cv.width = Math.round(st.w * dpr);
      cv.height = Math.round(st.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    /* The generating surface: dots that pulse outward in slow rings, and the prompt. */
    const pulse = (now: number) => {
      const { w, h } = st;
      ctx.fillStyle = col.ground;
      ctx.fillRect(0, 0, w, h);
      const t = now / 1000;
      const cx = w / 2;
      const cy = h / 2;
      const gap = 16;
      ctx.fillStyle = col.dot;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const d = Math.hypot(x - cx, y - cy);
          const ring = Math.max(0, Math.cos(d / 34 - t * 2.4)) ** 8;
          const breathe = 0.5 + 0.5 * Math.sin(t * 1.6);
          ctx.globalAlpha = 0.07 + 0.45 * ring * Math.max(0.15, 1 - d / Math.max(w, h)) + 0.04 * breathe;
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + ring * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = col.text;
      ctx.font = `500 15px ${font}`;
      const dots = ".".repeat(Math.floor(t * 2) % 4);
      ctx.fillText(`Generating${dots.padEnd(3, " ")}`, cx, cy - 10);
      if (st.prompt) {
        ctx.fillStyle = col.muted;
        ctx.font = `400 13px ${font}`;
        let line = st.prompt;
        while (line.length > 4 && ctx.measureText(line).width > w - 64) line = line.slice(0, -2);
        ctx.fillText(line === st.prompt ? line : `${line.trimEnd()}…`, cx, cy + 14);
      }
    };

    const burn = (now: number, dt: number) => {
      const { w, h, cols, rows, field, mask, heat, ox, oy } = st;
      if (!field || !mask || !heat) return true;
      const e = now - st.since;

      if (st.reduce) {
        // No burn: the surface simply fades away.
        const k = clamp(e / 500);
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = k;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        return k >= 1;
      }

      // Burn time: slow to catch, smooth all the way, a little past 1 so the last edge clears.
      const p = ease(clamp((e - CONTACT) / duration)) * (1 + HEAT + 0.02);
      const mctx = mask.getContext("2d")!;
      const hctx = heat.getContext("2d")!;
      const keep = mctx.createImageData(cols, rows);
      const glow = hctx.createImageData(cols, rows);
      const front: number[] = [];
      for (let i = 0; i < field.length; i++) {
        const d = field[i] - p;
        // What is left of the surface: gone behind the front, a soft edge at it.
        keep.data[i * 4 + 3] = Math.round(255 * clamp(d / 0.012 + 0.15));
        if (d > -0.012 && d < HEAT) {
          const j = i * 4;
          if (d < 0.006) {
            // The edge: white-hot at its heart, cooling to amber
            const k = 1 - Math.abs(d - 0.0) / 0.012;
            glow.data[j] = 255;
            glow.data[j + 1] = Math.round(170 + 70 * k);
            glow.data[j + 2] = Math.round(60 + 120 * k * k);
            glow.data[j + 3] = Math.round(255 * clamp(k * 1.2));
            if (d > -0.004 && d < 0.004) front.push(i);
          } else {
            // Ahead of it: the surface heats orange, deeper and fainter further out
            const k = 1 - (d - 0.006) / (HEAT - 0.006);
            glow.data[j] = 249;
            glow.data[j + 1] = Math.round(90 + 40 * k);
            glow.data[j + 2] = 20;
            glow.data[j + 3] = Math.round(200 * k * k);
          }
        }
      }
      mctx.putImageData(keep, 0, 0);
      hctx.putImageData(glow, 0, 0);

      // A few frames out of sync as it is touched
      if (e < CONTACT && Math.random() > 0.7) {
        const shift = (Math.random() - 0.5) * 3;
        ctx.drawImage(cv, shift, 0, w, h);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0, w, h);
      // The glow sits over both the surface and the revealed picture: a soft bloom, then the sharp edge.
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.55;
      ctx.filter = "blur(10px)";
      ctx.drawImage(heat, 0, 0, w, h);
      ctx.filter = "none";
      ctx.globalAlpha = 0.9;
      ctx.drawImage(heat, 0, 0, w, h);
      ctx.globalAlpha = 1;

      // The contact point: a glow that gathers, then hands over to the front.
      if (e < CONTACT + 900) {
        const k = e < CONTACT ? e / CONTACT : 1 - (e - CONTACT) / 900;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10 + 26 * clamp(k));
        g.addColorStop(0, `rgba(255, 244, 214, ${0.95 * clamp(k)})`);
        g.addColorStop(0.35, `rgba(251, 146, 60, ${0.7 * clamp(k)})`);
        g.addColorStop(1, "rgba(234, 88, 12, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Embers off the edge, and now and then a flake of ash.
      if (front.length && p < 1) {
        const n = Math.min(14, 2 + front.length / 40);
        for (let k = 0; k < n && st.motes.length < 900; k++) {
          const i = front[Math.floor(Math.random() * front.length)];
          const x = (i % cols) * CELL + Math.random() * CELL;
          const y = Math.floor(i / cols) * CELL + Math.random() * CELL;
          const ash = Math.random() < 0.12;
          const max = ash ? 1.6 + Math.random() * 1.4 : 0.7 + Math.random() * 1.3;
          st.motes.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 18,
            vy: -(8 + Math.random() * 22),
            life: max,
            max,
            size: ash ? 1.6 + Math.random() * 2 : 0.6 + Math.random() * 1.5,
            ash,
            hue: 18 + Math.random() * 24,
          });
        }
      }
      for (let i = st.motes.length - 1; i >= 0; i--) {
        const m = st.motes[i];
        m.life -= dt;
        if (m.life <= 0) {
          st.motes.splice(i, 1);
          continue;
        }
        // Rising on the heat, swaying as they go; ash floats slower
        m.vy -= (m.ash ? 10 : 26) * dt;
        m.vx += Math.sin((now / 1000) * 3 + m.y * 0.05) * 14 * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        if (m.ash) {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 0.5 * k;
          ctx.fillStyle = "rgb(38, 38, 38)";
          ctx.fillRect(m.x, m.y, m.size, m.size * 0.6);
        } else {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = k * (0.55 + Math.random() * 0.45);
          ctx.fillStyle = `hsl(${m.hue + 18 * k} 100% ${48 + 30 * k}%)`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * (0.6 + 0.4 * k), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      return p >= 1 + HEAT && st.motes.length === 0;
    };

    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const { w, h } = st;
      ctx.clearRect(0, 0, w, h);
      if (st.phase === "generating") {
        st.appear = Math.min(1, st.appear + dt / 0.4);
        ctx.globalAlpha = st.appear;
        pulse(now);
        ctx.globalAlpha = 1;
      } else if (st.phase === "burning") {
        pulse(now);
        if (burn(now, dt)) {
          st.phase = "revealed";
          ctx.clearRect(0, 0, w, h);
          st.onRevealed?.();
        }
      }
      st.frame = requestAnimationFrame(loop);
    };
    st.frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(st.frame);
      ro.disconnect();
    };
  }, [duration]);

  return (
    <div
      ref={box}
      role="img"
      aria-label={revealed ? alt : `Generating${prompt ? `: ${prompt}` : ""}`}
      aria-busy={!revealed}
      className={cn(
        // A soft lift off the page and a hairline outline
        "relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-black/10 shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-24px_rgb(0_0_0/0.45)] dark:ring-white/10 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5),0_24px_48px_-20px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" draggable={false} className={cn("absolute inset-0 size-full object-cover", !showImage && "invisible")} />}
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
      {/* An inner edge over the picture, so it sits in the frame like a print */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/10 ring-inset" />
    </div>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const SHOTS = [
  {
    prompt: "A city skyline at dusk under heavy storm clouds",
    src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
  {
    prompt: "Palm fronds framing a still lagoon at sunset",
    src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
  {
    prompt: "A stone breakwater running out into a stormy sea",
    src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
];

export default function Demo() {
  const [shot, setShot] = useState(0);
  const [src, setSrc] = useState<string | undefined>();
  const [busy, setBusy] = useState(true);
  const timer = useRef(0);

  const generate = (n: number) => {
    window.clearTimeout(timer.current);
    setShot(n);
    setSrc(undefined);
    setBusy(true);
    // Stands in for the model: the image arrives a few seconds later.
    timer.current = window.setTimeout(() => setSrc(SHOTS[n].src), 2600);
  };

  useEffect(() => {
    timer.current = window.setTimeout(() => setSrc(SHOTS[0].src), 2600);
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <div className="w-full max-w-md">
      <PruneReveal
        src={src}
        alt={SHOTS[shot].prompt}
        prompt={SHOTS[shot].prompt}
        onRevealed={() => setBusy(false)}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SHOTS.map((s, i) => (
          <button
            key={s.prompt}
            type="button"
            disabled={busy}
            onClick={() => generate(i)}
            className={cn(
              "max-w-full truncate rounded-lg px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-50",
              i === shot ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white",
            )}
          >
            {s.prompt}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => generate(shot)}
          aria-label="Regenerate"
          className="grid size-8 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}
