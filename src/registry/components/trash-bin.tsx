"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* --------------------------------- geometry --------------------------------- */
/* The sheet is drawn in a 100 × 128 box. Its outline is a ring of points that each have a partner on a
   lumpy ball; crumpling walks every point to its partner, a little out of step with its neighbours. */

type P = [number, number];

const CX = 50;
const CY = 64;
const N = 44;
const SHEET_EDGE: P[] = [[10, 6], [72, 6], [90, 24], [90, 122], [10, 122]];

/** Deterministic noise, so the server and the browser draw the same ball. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** N points spaced evenly along the sheet's outline, clockwise from the top-left corner. */
const SHEET: P[] = (() => {
  const edges = SHEET_EDGE.map((a, i) => {
    const b = SHEET_EDGE[(i + 1) % SHEET_EDGE.length];
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = edges.reduce((sum, e) => sum + e.len, 0);
  const out: P[] = [];
  for (let i = 0; i < N; i++) {
    let d = (i / N) * total;
    const e = edges.find((edge) => (d <= edge.len ? true : ((d -= edge.len), false)))!;
    const t = d / e.len;
    out.push([e.a[0] + (e.b[0] - e.a[0]) * t, e.a[1] + (e.b[1] - e.a[1]) * t]);
  }
  return out;
})();

const BALL: P[] = SHEET.map(([x, y], i) => {
  const a = Math.atan2(y - CY, x - CX);
  const r = 22 + 2.6 * Math.sin(3 * a + 1) + 1.8 * Math.sin(5 * a + 2) + (hash(i) - 0.5) * 4;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
});

/** When each point starts to move: the sheet folds in from a few places at once, not evenly. */
const LAG = SHEET.map((_, i) => hash(i + 7) * 0.35);
/** How far each point buckles in or out on the way. */
const BUCKLE = SHEET.map((_, i) => (hash(i + 5) - 0.35) * 9);

/* Inside the outline is a mesh of triangles laid flat across the sheet. It folds up with the outline, onto
   a disc, and its facets darken as it goes: that is what makes the ball read as crumpled paper. */

const COLS = 6;
const ROWS = 8;
const R = 21;

type Node = { sheet: P; ball: P; lag: number };
const MESH: Node[] = [];
for (let r = 0; r <= ROWS; r++) {
  for (let c = 0; c <= COLS; c++) {
    const k = r * (COLS + 1) + c;
    const inner = r > 0 && r < ROWS && c > 0 && c < COLS;
    const j = (n: number, amount: number) => (inner ? (hash(k * 3 + n) - 0.5) * amount : 0);
    const a = (c / COLS) * 2 - 1;
    const b = (r / ROWS) * 2 - 1;
    MESH.push({
      sheet: [10 + (c / COLS) * 80 + j(1, 4), 6 + (r / ROWS) * 116 + j(2, 4)],
      ball: [CX + a * Math.sqrt(1 - (b * b) / 2) * R + j(3, 7), CY + b * Math.sqrt(1 - (a * a) / 2) * R + j(4, 7)],
      lag: hash(k + 50) * 0.35,
    });
  }
}

/** Each facet: three mesh nodes and a tone. Tone 0 catches the light; 1 to 4 are darker and darker. */
const FACETS: { nodes: [number, number, number]; tone: number }[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const tl = r * (COLS + 1) + c;
    const tr = tl + 1;
    const bl = tl + COLS + 1;
    const br = bl + 1;
    const tris: [number, number, number][] = hash(tl + 90) > 0.5 ? [[tl, tr, br], [tl, br, bl]] : [[tl, tr, bl], [tr, br, bl]];
    for (const nodes of tris) {
      const mx = nodes.reduce((sum, n) => sum + MESH[n].ball[0], 0) / 3 - CX;
      const my = nodes.reduce((sum, n) => sum + MESH[n].ball[1], 0) / 3 - CY;
      const len = Math.hypot(mx, my) || 1;
      const lit = (0.6 * ((mx / len) * -0.6 + (my / len) * -0.8) * Math.min(1, len / 10)) + (hash(FACETS.length + 200) - 0.5) * 1.1;
      FACETS.push({ nodes, tone: lit > 0.3 ? 0 : lit > 0 ? 1 : lit > -0.25 ? 2 : lit > -0.5 ? 3 : 4 });
    }
  }
}
const TONES = ["fill-white/70", "fill-neutral-900/5", "fill-neutral-900/10", "fill-neutral-900/15", "fill-neutral-900/20"];

const f = (p: P) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const step = (c: number, lag: number) => ease(clamp((c - lag) / 0.65));
const mix = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function shape(c: number) {
  const pts = SHEET.map((s, i): P => {
    const l = step(c, LAG[i]);
    const [x, y] = mix(s, BALL[i], l);
    const len = Math.hypot(x - CX, y - CY) || 1;
    const w = Math.sin(Math.PI * l) * BUCKLE[i];
    return [x + ((x - CX) / len) * w, y + ((y - CY) / len) * w];
  });
  const nodes = MESH.map((n) => mix(n.sheet, n.ball, step(c, n.lag)));
  const tones = ["", "", "", "", ""];
  let edges = "";
  for (const { nodes: [a, b, d], tone } of FACETS) {
    const tri = `M${f(nodes[a])}L${f(nodes[b])}L${f(nodes[d])}Z`;
    tones[tone] += tri;
    edges += tri;
  }
  return { outline: `M${pts.map(f).join("L")}Z`, tones, edges };
}

const BALL_SHAPE = shape(1);

/** The soft round shading over the ball, lit from the top left. */
function Roundness({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.36" cy="0.3" r="0.75">
      <stop offset="0" stopColor="white" stopOpacity="0.5" />
      <stop offset="0.55" stopColor="var(--color-neutral-900)" stopOpacity="0" />
      <stop offset="1" stopColor="var(--color-neutral-900)" stopOpacity="0.3" />
    </radialGradient>
  );
}

function Facets({ tones, edges }: { tones: string[] | MotionValue<string>[]; edges: string | MotionValue<string> }) {
  return (
    <>
      {tones.map((d, i) => (
        <motion.path key={i} d={d} className={TONES[i]} />
      ))}
      <motion.path d={edges} className="fill-none stroke-neutral-500/20" strokeWidth={0.35} strokeLinejoin="round" />
    </>
  );
}

/* ----------------------------------- bin ----------------------------------- */
/* The bin is a wire-mesh can drawn in a 100 × 120 box: a rolled rim, a tapered shell punched with rows of
   slots that follow the curve of the can, and a solid foot. What is inside shows through the slots.
   A thrown ball is handed over at MOUTH and falls to a resting slot. */

const MOUTH: P = [50, 2];
const BALL_SCALE = 0.6;
const SLOTS: [number, number, number][] = [
  [41, 99, -20],
  [61, 100, 35],
  [51, 86, 80],
  [35, 85, -60],
  [66, 86, 10],
  [49, 72, 140],
];

const TOP = 24;
const FOOT = 110;
const BODY = `M16 ${TOP}L24 ${FOOT}A26 5 0 0 0 76 ${FOOT}L84 ${TOP}A34 7 0 0 1 16 ${TOP}Z`;
const INSIDE = `M16 -80L16 ${TOP}L24 ${FOOT}A26 5 0 0 0 76 ${FOOT}L84 ${TOP}L84 -80Z`;
const RIM_BACK = `M16 ${TOP}A34 7 0 0 1 84 ${TOP}`;
const RIM_FRONT = `M16 ${TOP}A34 7 0 0 0 84 ${TOP}`;

/** A point on the front of the can: `a` is the angle round it, `y` the height on its centre line. */
const onCan = (a: number, y: number): P => {
  const t = (y - TOP) / (FOOT - TOP);
  return [50 + (34 - 8 * t) * Math.sin(a), y + (7 - 2 * t) * Math.cos(a)];
};

/** Rows of slots, staggered like brickwork, narrowing as they turn away round the side. */
const MESH_SLOTS = (() => {
  let d = "";
  for (let r = 0; r < 5; r++) {
    const y0 = 33 + r * 13;
    const y1 = y0 + 9;
    const shift = r % 2 ? 0.125 : 0;
    for (let a = -1.25 + shift; a <= 1.26; a += 0.25) {
      const w = 0.07;
      const pts = [onCan(a - w, y0), onCan(a + w, y0), onCan(a + w, y1), onCan(a - w, y1)];
      d += `M${pts.map(f).join("L")}Z`;
    }
  }
  return d;
})();
const GROOVE = (() => {
  const pts: P[] = [];
  for (let a = -Math.PI / 2; a <= Math.PI / 2 + 0.01; a += Math.PI / 24) pts.push(onCan(a, 101));
  return `M${pts.map(f).join("L")}`;
})();

function Ball({ id }: { id: string }) {
  return (
    <>
      <path d={BALL_SHAPE.outline} className="fill-neutral-50" />
      <g clipPath={`url(#${id}-ball)`}>
        <Facets tones={BALL_SHAPE.tones} edges={BALL_SHAPE.edges} />
      </g>
      <path d={BALL_SHAPE.outline} fill={`url(#${id}-round)`} />
      <path d={BALL_SHAPE.outline} className="fill-none stroke-neutral-400/70" strokeWidth={0.8} strokeLinejoin="round" />
    </>
  );
}

function Bin({ items, over, id, fling }: { items: number[]; over: boolean; id: string; fling: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={`${id}-in`}>
          <path d={INSIDE} />
        </clipPath>
        <clipPath id={`${id}-ball`}>
          <path d={BALL_SHAPE.outline} />
        </clipPath>
        <mask id={`${id}-mesh`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="120">
          <rect width="100" height="120" fill="white" />
          <path d={MESH_SLOTS} fill="black" stroke="black" strokeWidth={1.1} strokeLinejoin="round" />
        </mask>
        <Roundness id={`${id}-round`} />
        {/* Light round the can: a sheen a third of the way in, shade at both edges. */}
        <linearGradient id={`${id}-shade`} x1="16" x2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="black" stopOpacity="0.22" />
          <stop offset="0.3" stopColor="white" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.28" />
        </linearGradient>
        {/* Inside: the rim throws a shadow down the back wall. */}
        <linearGradient id={`${id}-depth`} x1="0" x2="0" y1={TOP} y2={FOOT} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="black" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="black" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="115" rx="32" ry="3.5" className="fill-black/10 dark:fill-black/50" />

      {/* the inside: back wall and the opening at the top */}
      <path d={BODY} className="fill-neutral-300 dark:fill-neutral-900" />
      <path d={BODY} fill={`url(#${id}-depth)`} />
      <ellipse cx="50" cy={TOP} rx="34" ry="7" className="fill-neutral-400 dark:fill-neutral-950" />
      <motion.ellipse cx="50" cy={TOP} rx="34" ry="7" className="fill-sky-400/30" initial={false} animate={{ opacity: over ? 1 : 0 }} />
      <path d={RIM_BACK} className="fill-none stroke-neutral-300 dark:stroke-neutral-600" strokeWidth={3.2} strokeLinecap="round" />

      <g clipPath={`url(#${id}-in)`}>
        <AnimatePresence custom={fling}>
          {items.map((key, i) => {
            const [rx, ry, rot] = SLOTS[i];
            return (
              <motion.g
                key={key}
                custom={fling}
                initial={{ x: MOUTH[0] - rx, y: MOUTH[1] - ry, rotate: rot - 90 }}
                animate={{
                  x: 0,
                  y: [MOUTH[1] - ry, 0, -3, 0],
                  rotate: rot,
                  transition: {
                    x: { duration: 0.34, ease: [0.2, 0, 0.3, 1] },
                    y: { duration: 0.5, times: [0, 0.62, 0.8, 1], ease: ["easeIn", "easeOut", "easeIn"] },
                    rotate: { duration: 0.5, ease: "easeOut" },
                  },
                }}
                variants={{
                  /* Flung out: the overlay has already taken this ball over, so it just goes. */
                  out: (instant: boolean) =>
                    instant ? { opacity: 0, transition: { duration: 0 } } : { y: 30, opacity: 0, transition: { duration: 0.35, delay: i * 0.03, ease: "easeIn" } },
                }}
                exit="out"
              >
                <g transform={`translate(${rx} ${ry}) scale(${BALL_SCALE}) translate(${-CX} ${-CY})`}>
                  <Ball id={id} />
                </g>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </g>

      {/* the shell, with what is inside showing through its slots */}
      <g mask={`url(#${id}-mesh)`}>
        <path d={BODY} className="fill-neutral-200 dark:fill-neutral-700" />
        <path d={BODY} fill={`url(#${id}-shade)`} className="dark:opacity-60" />
      </g>
      <path d={MESH_SLOTS} className="fill-none stroke-neutral-900/15 dark:stroke-black/40" strokeWidth={0.5} strokeLinejoin="round" />
      <path d={GROOVE} className="fill-none stroke-neutral-900/15 dark:stroke-black/40" strokeWidth={0.8} />
      <path d={BODY} className="fill-none stroke-neutral-400 dark:stroke-neutral-500" strokeWidth={0.8} strokeLinejoin="round" />

      {/* the rolled rim */}
      <path d={RIM_FRONT} className="fill-none stroke-neutral-300 dark:stroke-neutral-500" strokeWidth={3.6} strokeLinecap="round" />
      <path d={RIM_FRONT} className="fill-none stroke-white/90 dark:stroke-white/25" strokeWidth={0.9} strokeLinecap="round" transform="translate(0 -0.9)" />
      <path d={RIM_FRONT} className="fill-none stroke-neutral-900/20 dark:stroke-black/40" strokeWidth={0.6} transform="translate(0 1.9)" />
    </svg>
  );
}

/* -------------------------------- emptying -------------------------------- */
/* Emptying flings every ball out of the bin and down into the bottom-right corner of the screen, where the
   heap is set alight and burns away to ash. It all happens on one canvas laid over the page, drawn from a
   picture of the ball. */

const BALL_SVG = (() => {
  const tones = ["rgb(255 255 255/.7)", "rgb(23 23 23/.05)", "rgb(23 23 23/.1)", "rgb(23 23 23/.15)", "rgb(23 23 23/.2)"];
  const s = BALL_SHAPE;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 128" width="300" height="384">
<defs><clipPath id="c"><path d="${s.outline}"/></clipPath>
<radialGradient id="r" cx="0.36" cy="0.3" r="0.75"><stop offset="0" stop-color="white" stop-opacity="0.5"/><stop offset="0.55" stop-color="#171717" stop-opacity="0"/><stop offset="1" stop-color="#171717" stop-opacity="0.3"/></radialGradient></defs>
<path d="${s.outline}" fill="#fafafa"/>
<g clip-path="url(#c)">${s.tones.map((d, i) => `<path d="${d}" fill="${tones[i]}"/>`).join("")}<path d="${s.edges}" fill="none" stroke="rgb(115 115 115/.2)" stroke-width="0.35" stroke-linejoin="round"/></g>
<path d="${s.outline}" fill="url(#r)"/>
<path d="${s.outline}" fill="none" stroke="rgb(163 163 163/.7)" stroke-width="0.8" stroke-linejoin="round"/></svg>`;
})();

let ballImage: Promise<HTMLImageElement> | null = null;
const loadBall = () =>
  (ballImage ??= new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BALL_SVG)}`;
  }));

/** Smooth value noise, seeded, so every fire takes a different path through the heap. */
function noise2(seed: number) {
  const h = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const sm = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = sm(x - xi);
    const yf = sm(y - yi);
    const a = h(xi, yi);
    const b = h(xi + 1, yi);
    const c = h(xi, yi + 1);
    const d = h(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let fr = 1;
    for (let o = 0; o < 3; o++) {
      sum += amp * value(x * fr, y * fr);
      fr *= 2.03;
      amp *= 0.5;
    }
    return sum / 0.875;
  };
}

type Fling = {
  /** The bin's box on screen, and its scale from bin units to pixels. */
  bin: { left: number; top: number; k: number };
  /** Each ball's resting slot in the bin. */
  balls: [number, number, number][];
};

type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: "ember" | "ash" | "soot"; ground: number };

const CELL = 3;
const HEAT = 0.07;
const smooth = (t: number) => t * t * (3 - 2 * t);

function Ashes({ fling, onDone }: { fling: Fling; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(onDone);
  useLayoutEffect(() => {
    done.current = onDone;
  });

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { bin, balls } = fling;
    const g0 = BALL_SCALE * bin.k; // ball units to px, in the bin
    const g1 = g0 * 1.25; // a touch bigger in the heap, nearer the viewer
    const rr = 22 * g1;
    const ground = H - 18;
    const cx = W - 24 - 2.9 * rr;
    const HEAP: P[] = [
      [cx - 1.9 * rr, ground - rr],
      [cx, ground - rr],
      [cx + 1.9 * rr, ground - rr],
      [cx - 0.95 * rr, ground - 2.6 * rr],
      [cx + 0.95 * rr, ground - 2.6 * rr],
      [cx, ground - 4.2 * rr],
    ];
    const rimY = bin.top + TOP * bin.k;
    const shell = new Path2D();
    shell.rect(0, 0, W, H);
    shell.addPath(new Path2D(BODY), new DOMMatrix().translate(bin.left, bin.top).scale(bin.k));

    /* Each ball's flight: straight up out of the mouth, then a long arc down into its place in the heap. */
    const flights = balls.map(([bx, by, rot], i) => {
      const s: P = [bin.left + bx * bin.k, bin.top + by * bin.k];
      const e = HEAP[i];
      const dist = Math.hypot(e[0] - s[0], e[1] - s[1]);
      const dir = e[0] >= s[0] ? 1 : -1;
      return {
        s,
        e,
        c1: [s[0] + (i - 2.5) * 6, rimY - 110 - (i % 3) * 18] as P,
        c2: [e[0] - dir * Math.min(160, dist * 0.25), Math.min(e[1], rimY) - 150] as P,
        rot0: rot,
        spin: dir * (380 + i * 40),
        delay: i * 0.09,
        dur: 0.75 + Math.min(0.5, dist / 2400),
      };
    });
    const landed = Math.max(...flights.map((fl) => fl.delay + fl.dur)) + 0.2;

    const bez = (a: P, b: P, c: P, d: P, t: number): P => {
      const u = 1 - t;
      return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      ];
    };

    /* The fire: when each cell of the heap catches, by its distance from where it was lit, bent by noise. */
    const left = Math.max(0, cx - 3.4 * rr);
    const top = Math.max(0, ground - 5.6 * rr);
    const rw = Math.min(W, cx + 3.4 * rr) - left;
    const rh = ground + 4 - top;
    const cols = Math.ceil(rw / CELL);
    const rows = Math.ceil(rh / CELL);
    const heap = HEAP.slice(0, balls.length);
    const lit: P = [heap[heap.length - 1][0] + (Math.random() - 0.5) * rr, heap[heap.length - 1][1] + (Math.random() - 0.2) * rr];
    const seed = Math.random() * 1000;
    const warp = noise2(seed);
    const grain = noise2(seed + 17);
    const field = new Float32Array(cols * rows);
    const covered = new Uint8Array(cols * rows);
    let max = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = left + c * CELL;
        const y = top + r * CELL;
        const i = r * cols + c;
        if (!heap.some(([hx, hy]) => Math.hypot(x - hx, y - hy) < rr * 1.2)) {
          field[i] = 2;
          continue;
        }
        covered[i] = 1;
        const wx = x + (warp(x / 45, y / 45) - 0.5) * 50;
        const wy = y + (warp(x / 45 + 9.3, y / 45 + 4.1) - 0.5) * 50;
        const t = Math.hypot(wx - lit[0], wy - lit[1]) * (0.7 + 0.6 * grain(x / 30, y / 30)) + grain(x / 9, y / 9) * 10;
        field[i] = t;
        if (t > max) max = t;
      }
    }
    for (let i = 0; i < field.length; i++) if (covered[i]) field[i] /= max;
    const make = () => {
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      return c;
    };
    const mask = make();
    const heat = make();
    const mctx = mask.getContext("2d")!;
    const hctx = heat.getContext("2d")!;

    const CONTACT = 0.35;
    const BURN = 1.5;
    const lightAt = landed + 0.15;
    const motes: Mote[] = [];
    let burnt = 0; // when the fire went out
    let img: HTMLImageElement | null = null;
    let raf = 0;
    let start = 0;
    let prev = 0;

    const drawBall = (x: number, y: number, rot: number, g: number) => {
      if (!img) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -CX * g, -CY * g, 100 * g, 128 * g);
      ctx.restore();
    };

    const frame = (now: number) => {
      if (!start) start = prev = now;
      const e = (now - start) / 1000;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      ctx.clearRect(0, 0, W, H);

      /* the throw */
      for (const fl of flights) {
        if (e >= lightAt) break;
        const t = clamp((e - fl.delay) / fl.dur);
        const u = 0.45 * t + 0.55 * smooth(t);
        const [x, at] = bez(fl.s, fl.c1, fl.c2, fl.e, u);
        // a little bounce as it lands
        const b = clamp((e - fl.delay - fl.dur) / 0.22);
        const y = at - (b > 0 && b < 1 ? rr * 0.3 * 4 * b * (1 - b) : 0);
        const g = g0 + (g1 - g0) * u;
        const rot = fl.rot0 + fl.spin * u;
        // Still coming out: the front of the can hides it.
        ctx.save();
        if (u < 0.45) ctx.clip(shell, "evenodd");
        drawBall(x, y, rot, g);
        ctx.restore();
      }
      if (e < lightAt) {
        raf = requestAnimationFrame(frame);
        return;
      }

      /* the fire */
      for (const fl of flights) drawBall(fl.e[0], fl.e[1], fl.rot0 + fl.spin, g1);
      const fe = e - lightAt;
      const p = smooth(clamp((fe - CONTACT) / BURN)) * (1 + HEAT + 0.02);
      const keep = mctx.createImageData(cols, rows);
      const glow = hctx.createImageData(cols, rows);
      const front: number[] = [];
      for (let i = 0; i < field.length; i++) {
        const d = field[i] - p;
        keep.data[i * 4 + 3] = Math.round(255 * clamp(d / 0.015 + 0.15));
        if (!covered[i] || d <= -0.015 || d >= HEAT) continue;
        const j = i * 4;
        if (d < 0.008) {
          const k = 1 - Math.abs(d) / 0.015;
          glow.data[j] = 255;
          glow.data[j + 1] = Math.round(170 + 70 * k);
          glow.data[j + 2] = Math.round(60 + 120 * k * k);
          glow.data[j + 3] = Math.round(255 * clamp(k * 1.2));
          if (d > -0.006 && d < 0.006) front.push(i);
        } else {
          // ahead of the edge the paper scorches: orange, then brown, then nothing
          const k = 1 - (d - 0.008) / (HEAT - 0.008);
          glow.data[j] = 234;
          glow.data[j + 1] = Math.round(88 + 40 * k);
          glow.data[j + 2] = 12;
          glow.data[j + 3] = Math.round(210 * k * k);
        }
      }
      mctx.putImageData(keep, 0, 0);
      hctx.putImageData(glow, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, left, top, cols * CELL, rows * CELL);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.6;
      ctx.filter = "blur(8px)";
      ctx.drawImage(heat, left, top, cols * CELL, rows * CELL);
      ctx.filter = "none";
      ctx.globalAlpha = 0.95;
      ctx.drawImage(heat, left, top, cols * CELL, rows * CELL);
      ctx.globalAlpha = 1;

      // where it was lit: a glow that gathers, then hands over to the front
      if (fe < CONTACT + 0.7) {
        const k = clamp(fe < CONTACT ? fe / CONTACT : 1 - (fe - CONTACT) / 0.7);
        const grad = ctx.createRadialGradient(lit[0], lit[1], 0, lit[0], lit[1], 6 + 18 * k);
        grad.addColorStop(0, `rgba(255, 244, 214, ${0.95 * k})`);
        grad.addColorStop(0.35, `rgba(251, 146, 60, ${0.7 * k})`);
        grad.addColorStop(1, "rgba(234, 88, 12, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lit[0], lit[1], 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Off the burning edge: embers that rise, flakes of ash that float, and soot that falls into a little heap.
      if (front.length && p < 1) {
        const n = Math.min(12, 2 + front.length / 12);
        for (let k = 0; k < n && motes.length < 700; k++) {
          const i = front[Math.floor(Math.random() * front.length)];
          const x = left + (i % cols) * CELL + Math.random() * CELL;
          const y = top + Math.floor(i / cols) * CELL + Math.random() * CELL;
          const roll = Math.random();
          const kind = roll < 0.5 ? "ember" : roll < 0.68 ? "ash" : "soot";
          const life = kind === "ember" ? 0.6 + Math.random() * 1.1 : kind === "ash" ? 1.4 + Math.random() * 1.2 : Infinity;
          motes.push({
            x,
            y,
            vx: (Math.random() - 0.5) * (kind === "soot" ? 40 : 18),
            vy: kind === "soot" ? -Math.random() * 30 : -(8 + Math.random() * 22),
            life,
            max: life,
            size: kind === "ember" ? 0.6 + Math.random() * 1.4 : 1.2 + Math.random() * 1.8,
            kind,
            ground: ground - Math.random() * 3 - (1 - Math.min(1, Math.abs(x - cx) / (3 * rr))) * 5,
          });
        }
      }
      if (!burnt && p >= 1 + HEAT && !motes.some((m) => m.kind !== "soot")) burnt = fe;
      const fade = burnt ? clamp((fe - burnt - 0.5) / 0.9) : 0;

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        if (m.kind === "soot") {
          // falls, then lies where it lands
          if (m.y < m.ground) {
            m.vy += 380 * dt;
            m.vx *= 1 - 2 * dt;
            m.x += m.vx * dt;
            m.y = Math.min(m.ground, m.y + m.vy * dt);
          }
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 0.75 * (1 - fade);
          ctx.fillStyle = "rgb(82, 82, 82)";
          ctx.fillRect(m.x, m.y, m.size, m.size * 0.7);
          continue;
        }
        m.life -= dt;
        if (m.life <= 0) {
          motes.splice(i, 1);
          continue;
        }
        m.vy -= (m.kind === "ash" ? 10 : 26) * dt;
        m.vx += Math.sin(now / 330 + m.y * 0.05) * 14 * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        if (m.kind === "ash") {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 0.55 * k;
          ctx.fillStyle = "rgb(64, 64, 64)";
          ctx.fillRect(m.x, m.y, m.size, m.size * 0.6);
        } else {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = k * (0.55 + Math.random() * 0.45);
          ctx.fillStyle = `hsl(${30 + 18 * k} 100% ${48 + 30 * k}%)`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * (0.6 + 0.4 * k), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (fade >= 1) {
        done.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    let cancelled = false;
    void loadBall().then((loaded) => {
      if (cancelled) return;
      img = loaded;
      frame(performance.now());
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [fling]);

  return createPortal(<canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[100] h-screen w-screen" />, document.body);
}

/* ---------------------------------- trash ---------------------------------- */

type Phase = "paper" | "crumpling" | "ball" | "flying" | "gone";

export type TrashBinProps = {
  /** Files that take their turn on the desk. A new one comes up after each is thrown away. */
  files?: string[];
  /** Called with a file's name once it lands in the bin. */
  onTrash?: (name: string) => void;
  className?: string;
};

export function TrashBin({ files = ["notes.txt", "draft-v2.md", "invoice.pdf", "todo.txt"], onTrash, className }: TrashBinProps) {
  const reduce = useReducedMotion();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  const [phase, setPhase] = useState<Phase>("paper");
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [over, setOver] = useState(false);
  const [fling, setFling] = useState<Fling | null>(null);

  const ballRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const overRef = useRef(false);
  const nextKey = useRef(0);

  const wobble = useAnimationControls();

  /* 0 = flat sheet, 1 = ball. Everything about the paper's look is read off this one value. */
  const crush = useMotionValue(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lift = useMotionValue(1);
  const tilt = useSpring(useTransform(useVelocity(x), [-1600, 1600], [-28, 28], { clamp: true }), { stiffness: 260, damping: 26 });
  const rotate = useTransform(() => crush.get() * -14 + tilt.get());

  const paths = useTransform(crush, shape);
  const outline = useTransform(paths, (s) => s.outline);
  const tone0 = useTransform(paths, (s) => s.tones[0]);
  const tone1 = useTransform(paths, (s) => s.tones[1]);
  const tone2 = useTransform(paths, (s) => s.tones[2]);
  const tone3 = useTransform(paths, (s) => s.tones[3]);
  const tone4 = useTransform(paths, (s) => s.tones[4]);
  const edges = useTransform(paths, (s) => s.edges);
  const facets = useTransform(crush, [0.04, 0.6], [0, 1]);
  const round = useTransform(crush, [0.45, 1], [0, 1]);
  const ink = useTransform(crush, [0, 0.5], [1, 0]);
  const fold = useTransform(crush, [0, 0.25], [1, 0]);
  const label = useTransform(crush, [0, 0.2], [1, 0]);

  const name = files[index % files.length];
  const time = (s: number) => (reduce ? 0 : s);

  const setHover = (value: boolean) => {
    if (overRef.current === value) return;
    overRef.current = value;
    setOver(value);
  };

  const nextFile = () => {
    x.jump(0);
    y.jump(0);
    tilt.jump(0);
    lift.jump(1);
    crush.jump(0);
    setIndex((i) => i + 1);
    setPhase("paper");
  };

  /** Flies the ball to the bin's mouth, where the bin takes it over and lets it fall in. */
  const throwIn = async (arc: number) => {
    const ball = ballRef.current;
    const bin = binRef.current;
    if (!ball || !bin) return;
    setPhase("flying");
    setHover(false);

    const b = ball.getBoundingClientRect();
    const r = bin.getBoundingClientRect();
    const k = r.width / 100;
    const tx = r.left + MOUTH[0] * k - (b.left + b.width / 2) + x.get();
    const ty = r.top + MOUTH[1] * k - (b.top + b.height / 2) + y.get();
    const peak = Math.min(y.get(), ty) - arc;
    const d = time(arc ? 0.5 : 0.24);

    await Promise.all([
      animate(x, tx, { duration: d, ease: arc ? "linear" : [0.3, 0, 0.2, 1] }),
      arc
        ? animate(y, [y.get(), peak, ty], { duration: d, times: [0, 0.42, 1], ease: ["easeOut", "easeIn"] })
        : animate(y, ty, { duration: d, ease: [0.3, 0, 0.2, 1] }),
      /* Shrink to exactly the size the bin draws its balls at, so the handover is seamless. */
      animate(lift, (BALL_SCALE * bin.offsetWidth) / ball.offsetWidth, { duration: d }),
    ]);

    setPhase("gone");
    setTotal((t) => t + 1);
    setItems((list) => (list.length < SLOTS.length ? [...list, nextKey.current++] : list));
    onTrash?.(name);
    if (!reduce) wobble.start({ rotate: [0, -5, 3.5, -1.5, 0], scaleY: [1, 0.95, 1.02, 1, 1], transition: { duration: 0.6, delay: 0.22 } });
    window.setTimeout(nextFile, reduce ? 150 : 700);
  };

  /** Let go away from the bin: the ball rolls home and opens back up into the sheet. */
  const goHome = async () => {
    setPhase("flying");
    setHover(false);
    await Promise.all([
      animate(x, 0, { type: "spring", stiffness: 320, damping: 30 }),
      animate(y, 0, { type: "spring", stiffness: 320, damping: 30 }),
      animate(lift, 1, { duration: time(0.3) }),
    ]);
    await animate(crush, 0, { duration: time(0.55), ease: [0.3, 0, 0.2, 1] });
    setPhase("paper");
  };

  const release = () => {
    if (crush.get() < 1) {
      /* Let go mid-crumple: the sheet opens back up where it started. */
      setHover(false);
      const spring = { type: "spring", stiffness: 320, damping: 26 } as const;
      animate(crush, 0, { type: "spring", stiffness: 320, damping: 24 });
      animate(x, 0, spring);
      animate(y, 0, spring);
      setPhase("paper");
    } else if (overRef.current) {
      void throwIn(0);
    } else {
      void goHome();
    }
  };

  const checkHover = (px: number, py: number) => {
    const r = binRef.current?.getBoundingClientRect();
    if (!r) return;
    const pad = 18;
    setHover(px > r.left - pad && px < r.right + pad && py > r.top - pad * 2 && py < r.bottom + pad);
  };

  /* The sheet is held from the moment of the press: it follows the pointer 1:1, and as it crumples the
     grab point slides to the middle, so the finished ball sits right under the finger. */
  const press = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ballRef.current;
    if (event.button !== 0 || phase !== "paper" || !el) return;
    event.preventDefault();
    x.stop();
    y.stop();
    setPhase("crumpling");

    const pointerId = event.pointerId;
    const rect = el.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    /* Where the sheet's centre would be with no offset, and where on the sheet it was grabbed. */
    const homeX = midX - x.get();
    const homeY = midY - y.get();
    const grabX = event.clientX - midX;
    const grabY = event.clientY - midY;
    let px = event.clientX;
    let py = event.clientY;
    let held = true;

    const follow = () => {
      const k = 1 - crush.get();
      x.set(px - grabX * k - homeX);
      y.set(py - grabY * k - homeY);
    };
    const unfollow = crush.on("change", follow);

    const run = animate(crush, 1, { duration: time(0.6), ease: [0.45, 0, 0.2, 1] });
    run.then(() => {
      if (!held) return;
      follow();
      setPhase("ball");
      animate(lift, [1, 1.14, 1.06], { duration: time(0.36), ease: "easeOut" });
      checkHover(px, py);
    });

    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      px = e.clientX;
      py = e.clientY;
      follow();
      if (crush.get() >= 1) checkHover(px, py);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      held = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      unfollow();
      run.stop();
      release();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
    if (phase !== "paper" || !["Delete", "Backspace", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    setPhase("crumpling");
    await animate(crush, 1, { duration: time(0.6), ease: [0.45, 0, 0.2, 1] });
    await animate(lift, [1, 1.14, 1], { duration: time(0.3), ease: "easeOut" });
    void throwIn(70);
  };

  /* Have the ball picture ready before anything is emptied, so the handover from the bin is seamless. */
  useEffect(() => {
    void loadBall();
  }, []);

  /** Fling everything out to burn in the corner. The bin itself stays put. */
  const empty = () => {
    if (fling) return;
    const r = binRef.current?.getBoundingClientRect();
    if (!reduce && r && items.length) setFling({ bin: { left: r.left, top: r.top, k: r.width / 100 }, balls: SLOTS.slice(0, items.length) });
    setItems([]);
    setTotal(0);
  };

  const hint =
    phase === "ball" || phase === "flying" ? (over ? "Let go" : "Drop it in the bin") : phase === "crumpling" ? "Crumpling" : "Hold the file to crumple it";

  return (
    <div className={cn("relative flex w-full max-w-md items-end justify-between gap-6 px-4 select-none sm:px-8", className)}>
      <p aria-live="polite" className="absolute inset-x-0 -top-12 text-center font-mono text-[10px] tracking-[0.16em] text-neutral-500 uppercase">
        {hint}
      </p>

      {/* desk */}
      <div className="relative z-10 flex w-28 flex-col items-center">
        <motion.div
          ref={ballRef}
          role="button"
          tabIndex={phase === "paper" ? 0 : -1}
          aria-label={`${name}. Press Delete to move it to the bin, or hold it and drag it there.`}
          onPointerDown={press}
          onKeyDown={onKeyDown}
          style={{ x, y, rotate, scale: lift, touchAction: "none" }}
          className={cn(
            "relative w-28 rounded-md outline-none",
            phase === "paper" && "focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
            phase === "paper" && "cursor-grab",
            (phase === "ball" || phase === "crumpling") && "cursor-grabbing",
            phase === "gone" && "invisible",
          )}
        >
          <motion.div
            key={index}
            initial={index === 0 ? false : { opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <svg viewBox="0 0 100 128" className="block w-full overflow-visible drop-shadow-[0_6px_10px_rgb(0_0_0/0.18)]" aria-hidden>
              <defs>
                <clipPath id={`${id}-sheet`}>
                  <motion.path d={outline} />
                </clipPath>
                <Roundness id={`${id}-round`} />
              </defs>
              <motion.path d={outline} className="fill-neutral-50" />
              <motion.g style={{ opacity: facets }} clipPath={`url(#${id}-sheet)`}>
                <Facets tones={[tone0, tone1, tone2, tone3, tone4]} edges={edges} />
              </motion.g>
              <motion.g style={{ opacity: ink }} clipPath={`url(#${id}-sheet)`}>
                <rect x="20" y="22" width="34" height="4.5" rx="2.25" className="fill-neutral-800/70" />
                {[36, 45, 54, 63, 72, 86, 95, 104].map((ly, i) => (
                  <rect key={ly} x="20" y={ly} width={[60, 56, 60, 44, 52, 60, 58, 30][i]} height="2.6" rx="1.3" className="fill-neutral-800/15" />
                ))}
              </motion.g>
              <motion.path style={{ opacity: fold }} d="M72 6L72 20Q72 24 76 24L90 24Z" className="fill-neutral-200 stroke-neutral-300" strokeWidth={0.6} strokeLinejoin="round" />
              <motion.path d={outline} style={{ opacity: round }} fill={`url(#${id}-round)`} />
              <motion.path d={outline} className="fill-none stroke-neutral-300" strokeWidth={0.8} strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.span style={{ opacity: label }} className={cn("mt-3 max-w-full truncate text-xs text-neutral-600 dark:text-neutral-400", phase === "gone" && "invisible")}>
          {name}
        </motion.span>
      </div>

      {/* bin */}
      <div className="flex w-28 flex-col items-center">
        <motion.div ref={binRef} animate={{ scale: over ? 1.07 : 1 }} transition={{ type: "spring", stiffness: 420, damping: 22 }} className="w-full">
          <motion.div animate={wobble} style={{ originY: 1 }}>
            <Bin items={items} over={over} id={id} fling={!!fling} />
          </motion.div>
        </motion.div>
        <div className="mt-3 flex h-4 items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="tabular-nums">{total ? `${total} item${total > 1 ? "s" : ""}` : "Trash"}</span>
          <AnimatePresence>
            {total > 0 && (
              <motion.button
                type="button"
                onClick={empty}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="rounded px-1 text-neutral-500 underline-offset-2 hover:text-neutral-950 dark:hover:text-neutral-50 hover:underline focus-visible:outline-2 focus-visible:outline-sky-500"
              >
                Empty
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {fling && <Ashes fling={fling} onDone={() => setFling(null)} />}
    </div>
  );
}

export default function Demo() {
  return (
    <div className="flex h-[22rem] w-full items-center justify-center pt-12">
      <TrashBin />
    </div>
  );
}
