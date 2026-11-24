"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
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
/* The bin is drawn in a 100 × 120 box. A thrown ball is handed over at MOUTH and falls to a resting slot. */

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
const BODY = "M16 24L24 105Q24.7 112 31 112L69 112Q75.3 112 76 105L84 24Z";
const RIBS = Array.from({ length: 7 }, (_, k) => {
  const t = (k + 1) / 8;
  return `M${16 + 68 * t} 31L${24 + 52 * t} 107`;
}).join("");

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

function Bin({ items, over, id }: { items: number[]; over: boolean; id: string }) {
  return (
    <svg viewBox="0 0 100 120" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={`${id}-in`}>
          <path d="M16 -80L16 24L24 105Q24.7 112 31 112L69 112Q75.3 112 76 105L84 24L84 -80Z" />
        </clipPath>
        <clipPath id={`${id}-ball`}>
          <path d={BALL_SHAPE.outline} />
        </clipPath>
        <Roundness id={`${id}-round`} />
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.45" />
          <stop offset="0.35" stopColor="white" stopOpacity="0.05" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="114" rx="30" ry="3" className="fill-black/10 dark:fill-black/50" />
      <ellipse cx="50" cy="24" rx="34" ry="6" className="fill-neutral-400/50 dark:fill-neutral-900/80" />

      <g clipPath={`url(#${id}-in)`}>
        <AnimatePresence>
          {items.map((key, i) => {
            const [rx, ry, rot] = SLOTS[i];
            return (
              <motion.g
                key={key}
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
                exit={{ y: 30, opacity: 0, transition: { duration: 0.35, delay: i * 0.03, ease: "easeIn" } }}
              >
                <g transform={`translate(${rx} ${ry}) scale(${BALL_SCALE}) translate(${-CX} ${-CY})`}>
                  <Ball id={id} />
                </g>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </g>

      <path d={BODY} className="fill-neutral-300/40 stroke-neutral-400/80 dark:fill-neutral-600/30 dark:stroke-neutral-500/80" strokeWidth={1.2} />
      <path d={BODY} fill={`url(#${id}-glass)`} />
      <path d={RIBS} className="stroke-neutral-500/30 dark:stroke-neutral-300/20" strokeWidth={1.6} strokeLinecap="round" />

      <motion.g animate={{ y: over ? -3 : 0, scale: over ? 1.04 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 24 }}>
        <ellipse cx="50" cy="24" rx="35" ry="6.5" className="fill-none stroke-neutral-300 dark:stroke-neutral-500" strokeWidth={4} />
        <path d="M18 22.5Q50 14 82 22.5" className="fill-none stroke-white/80 dark:stroke-white/25" strokeWidth={1} strokeLinecap="round" />
      </motion.g>
    </svg>
  );
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

  const ballRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const holding = useRef<ReactPointerEvent | null>(null);
  const overRef = useRef(false);
  const nextKey = useRef(0);

  const drag = useDragControls();
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
    holding.current = null;
    if (crush.get() < 1) {
      animate(crush, 0, { type: "spring", stiffness: 320, damping: 24 });
      setPhase("paper");
    } else if (overRef.current) {
      void throwIn(0);
    } else {
      void goHome();
    }
  };

  const press = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || phase !== "paper") return;
    event.preventDefault();
    holding.current = event;
    setPhase("crumpling");

    const run = animate(crush, 1, { duration: time(0.6), ease: [0.45, 0, 0.2, 1] });
    run.then(() => {
      if (holding.current !== event) return;
      setPhase("ball");
      animate(lift, [1, 1.14, 1.06], { duration: time(0.36), ease: "easeOut" });
      drag.start(event);
    });

    const up = () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      run.stop();
      release();
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onDrag = (_: unknown, info: { point: { x: number; y: number } }) => {
    const r = binRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = info.point.x - window.scrollX;
    const py = info.point.y - window.scrollY;
    const pad = 18;
    setHover(px > r.left - pad && px < r.right + pad && py > r.top - pad * 2 && py < r.bottom + pad);
  };

  const onKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
    if (phase !== "paper" || !["Delete", "Backspace", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    setPhase("crumpling");
    await animate(crush, 1, { duration: time(0.6), ease: [0.45, 0, 0.2, 1] });
    await animate(lift, [1, 1.14, 1], { duration: time(0.3), ease: "easeOut" });
    void throwIn(70);
  };

  const empty = () => {
    setItems([]);
    setTotal(0);
    if (!reduce) wobble.start({ rotate: [0, 6, -6, 4, -2, 0], transition: { duration: 0.5 } });
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
          drag
          dragControls={drag}
          dragListener={false}
          dragMomentum={false}
          onDrag={onDrag}
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
            <Bin items={items} over={over} id={id} />
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
