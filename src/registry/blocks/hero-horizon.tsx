"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type Range = "24h" | "7d" | "30d";

/** Back row first. Each city's usual orders an hour. */
const REGIONS = [
  { code: "IAD", city: "Virginia", base: 42 },
  { code: "SFO", city: "San Francisco", base: 61 },
  { code: "YYZ", city: "Toronto", base: 55 },
  { code: "GRU", city: "São Paulo", base: 138 },
  { code: "LHR", city: "London", base: 86 },
  { code: "FRA", city: "Frankfurt", base: 90 },
  { code: "AMS", city: "Amsterdam", base: 84 },
  { code: "JNB", city: "Johannesburg", base: 170 },
  { code: "BOM", city: "Mumbai", base: 150 },
  { code: "SIN", city: "Singapore", base: 182 },
  { code: "NRT", city: "Tokyo", base: 120 },
  { code: "SYD", city: "Sydney", base: 205 },
];

/** The rushes worth finding (a drop, a sale, a viral post): which city, where in the range, how tall and how wide. */
const INCIDENTS: Record<
  Range,
  { region: string; at: number; peak: number; width: number }[]
> = {
  "24h": [
    { region: "SIN", at: 47, peak: 720, width: 2.6 },
    { region: "FRA", at: 19, peak: 210, width: 1.8 },
  ],
  "7d": [
    { region: "GRU", at: 30, peak: 560, width: 3.2 },
    { region: "LHR", at: 55, peak: 190, width: 2 },
  ],
  "30d": [
    { region: "SYD", at: 58, peak: 640, width: 2.2 },
    { region: "IAD", at: 12, peak: 260, width: 2.8 },
  ],
};

const N = 72;
const W = 1200;
const H = 350;
const LEFT = 40;
const SPAN = 1120;
const FIRST = 88; // baseline of the back row
const GAP = 24; // between baselines

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Orders an hour for one city over one range, the same on server and client. */
function series(range: Range, k: number) {
  const r = rng(k * 101 + range.length * 7919 + (range === "30d" ? 13 : 0));
  const { base, code } = REGIONS[k];
  const p1 = r() * 6;
  const p2 = r() * 6;
  return Array.from({ length: N }, (_, i) => {
    // 7 days has a daily rhythm; 30 days is averaged, so calmer.
    const daily =
      range === "7d" ? 0.22 * Math.sin((i / N) * 7 * Math.PI * 2 + p1) : 0;
    const calm = range === "30d" ? 0.5 : 1;
    let ms =
      base *
      (1 +
        daily +
        calm *
          (0.3 * Math.sin(i * 0.23 + p1) + 0.14 * Math.sin(i * 0.71 + p2)) +
        calm * (r() - 0.5) * 0.18);
    for (const inc of INCIDENTS[range])
      if (inc.region === code)
        ms += inc.peak * Math.exp(-(((i - inc.at) / inc.width) ** 2));
    return Math.round(ms);
  });
}

const x = (i: number) => LEFT + (i * SPAN) / (N - 1);
const y0 = (k: number) => FIRST + k * GAP;
/** Height eases off as it climbs, so normal hours still have shape and a bad one doesn't leave the frame. */
const top = (k: number, ms: number) =>
  y0(k) - 170 * (Math.min(ms, 1000) / 1000) ** 0.7;
const r1 = (n: number) => Math.round(n * 10) / 10;

function paths(values: number[], k: number) {
  const pts = values.map((ms, i) => `L${r1(x(i))},${r1(top(k, ms))}`).join("");
  return {
    area: `M${x(0)},${y0(k)}${pts}L${x(N - 1)},${y0(k)}Z`,
    line: `M${x(0)},${r1(top(k, values[0]))}${pts.slice(pts.indexOf("L", 1))}`,
  };
}

/** The same shapes flattened onto their baselines, for the horizon to rise from. */
function flat(k: number) {
  return paths(Array(N).fill(0), k);
}

function label(range: Range, i: number) {
  if (range === "24h") {
    const m = Math.round((i / (N - 1)) * 24 * 60);
    return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String((m % 60) - (m % 20)).padStart(2, "0")}`;
  }
  if (range === "7d") {
    const h = (i / (N - 1)) * 7 * 24;
    return `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Math.min(6, Math.floor(h / 24))]} ${String(Math.floor(h % 24)).padStart(2, "0")}:00`;
  }
  return `Nov ${Math.min(30, 1 + Math.floor((i / (N - 1)) * 30))}`;
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * A commerce hero whose horizon is the data: every city's orders an hour drawn
 * as a ridge, stacked back to front and fading into the distance. The rushes
 * stand up as peaks, inside a Tally window that fades out at its foot. Left
 * alone, a hairline glides from rush to rush and the headline reads each one
 * out; hover a ridge (or use the arrow keys) to take over and read any moment
 * off it. Switch the range and the land reshapes.
 */
export function HeroHorizon({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [range, setRange] = useState<Range>("24h");
  const data = useMemo(() => REGIONS.map((_, k) => series(range, k)), [range]);

  // The row in front is the busiest one by default, so the story is visible before anyone hovers.
  const worst = (values: number[][]) =>
    values.reduce(
      (best, v, k) => (Math.max(...v) > Math.max(...values[best]) ? k : best),
      0,
    );
  const [picked, setPicked] = useState<number | null>(null);
  const row = picked ?? worst(data);
  const [scrub, setScrub] = useState<number | null>(null);

  // The tour: a calm hour, each rush in the order it happened, then the latest hour.
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, { margin: "-120px" });
  const [tour, setTour] = useState<{ at: number; row: number } | null>(null);
  const touring = inView && !reduce && picked === null && scrub === null;
  useEffect(() => {
    if (!touring) return;
    const code = (c: string) => REGIONS.findIndex((r) => r.code === c);
    const stops = [
      { at: 6, row: code("LHR") },
      ...[...INCIDENTS[range]]
        .sort((a, b) => a.at - b.at)
        .map((i) => ({ at: i.at, row: code(i.region) })),
      { at: N - 4, row: code("NRT") },
    ];
    let alive = true;
    let pos = stops[0].at;
    // The hairline travels on the ridge it was reading, and the next city comes forward when it arrives.
    let rowNow = stops[0].row;
    const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
    (async () => {
      for (let k = 0; alive; k = (k + 1) % stops.length) {
        const stop = stops[k];
        const from = rowNow;
        await animate(pos, stop.at, {
          duration: Math.min(1.6, 0.5 + Math.abs(stop.at - pos) / 40),
          ease: [0.45, 0, 0.1, 1],
          onUpdate: (v) => alive && setTour({ at: Math.round(v), row: from }),
        });
        pos = stop.at;
        rowNow = stop.row;
        if (alive) setTour({ at: stop.at, row: stop.row });
        await wait(k === 0 ? 1400 : 2400);
      }
    })();
    return () => {
      alive = false;
    };
  }, [touring, range]);

  const shownRow = picked ?? (touring && tour ? tour.row : row);
  const values = data[shownRow];
  const peakAt = values.indexOf(Math.max(...values));
  const at = scrub ?? (touring && tour ? tour.at : peakAt);
  const ms = values[at];
  const sorted = [...values].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const vy = ((e.clientY - r.top) / r.height) * H;
    setScrub(
      Math.max(0, Math.min(N - 1, Math.round(((vx - LEFT) / SPAN) * (N - 1)))),
    );
    // The row whose baseline is the first one below the pointer.
    setPicked(
      Math.max(0, Math.min(REGIONS.length - 1, Math.ceil((vy - FIRST) / GAP))),
    );
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 6 : 1;
    if (e.key === "ArrowUp") setPicked(Math.max(0, shownRow - 1));
    else if (e.key === "ArrowDown")
      setPicked(Math.min(REGIONS.length - 1, shownRow + 1));
    else if (e.key === "ArrowLeft") setScrub(Math.max(0, at - step));
    else if (e.key === "ArrowRight") setScrub(Math.min(N - 1, at + step));
    else return;
    e.preventDefault();
  };

  const region = REGIONS[shownRow];
  const pointY = top(shownRow, ms) - 4;

  return (
    <section
      data-slot="hero-horizon"
      className={cn(
        "relative overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32 dark:bg-black",
        "[--ink:var(--color-neutral-950)] [--paper:var(--color-white)] [--signal:var(--color-blue-600)] dark:[--ink:var(--color-neutral-50)] dark:[--paper:var(--color-neutral-900)] dark:[--signal:var(--color-blue-500)]",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
          Tally · live orders from 12 cities
        </h1>
        {/* The headline is whatever the horizon is showing */}
        <p
          aria-live="polite"
          className="mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-neutral-950 sm:text-[64px] dark:text-neutral-50"
        >
          {region.city} {ms > region.base * 2 ? "rushed to" : "is taking"}{" "}
          <span
            className={cn(
              "inline-flex translate-y-[-0.04em] rounded-[0.22em] px-[0.16em] tabular-nums transition-colors duration-300",
              ms > region.base * 2
                ? "bg-blue-600/[0.08] text-blue-600 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-blue-600)_22%,transparent)] dark:bg-blue-500/10 dark:text-blue-500"
                : "bg-neutral-950/[0.05] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_10%,transparent)] dark:bg-neutral-50/[0.07]",
            )}
          >
            {ms} orders
          </span>{" "}
          <span className="text-neutral-400 dark:text-neutral-500">
            an hour at {label(range, at)}.
          </span>
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <p className="max-w-sm text-base leading-7 text-pretty text-neutral-600 dark:text-neutral-400">
            Every storefront is a ridge, so a rush stands up the moment it
            starts. Hover one and read any hour off it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button tone="signal" size="lg">
              Open your store free
            </Button>
            <Button size="lg">
              See a live store <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      {/* The product: a Tally window, whole across, fading out at its foot. Padded so the fade never clips its shadow. */}
      <div ref={frame} className="relative mx-auto mt-14 flow-root max-w-6xl">
        <div className="-mx-12 -mt-12 h-[560px] p-12 pb-0 [mask-image:linear-gradient(to_bottom,black_70%,transparent)] sm:h-[600px]">
          <div className="h-full overflow-hidden rounded-t-[14px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_30px_60px_-12px_rgb(50_50_93/0.25),0_18px_36px_-18px_rgb(0_0_0/0.3)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_30px_60px_-12px_rgb(0_0_0/0.6)]">
            <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.06] px-[14px] dark:border-neutral-50/[0.07]">
              {["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"].map((c) => (
                <span key={c} className={cn("size-[10px] rounded-full", c)} />
              ))}
              <span className="mx-auto hidden h-[24px] items-center sm:flex rounded-[7px] bg-neutral-950/[0.04] px-3 text-[12px] text-neutral-500 dark:bg-neutral-50/[0.06]">
                app.tally.shop/live
              </span>
              <span className="w-[42px]" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 sm:px-8">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">
                  Orders by city
                </div>
                <div className="mt-1 text-[13px] text-neutral-500">
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {region.city}
                  </span>{" "}
                  · busy hour <span className="tabular-nums">{p95}</span>
                  <span className="hidden sm:inline">
                    {" "}
                    · usually {region.base}
                  </span>
                </div>
              </div>
              <SegmentedControl<Range>
                aria-label="Range"
                size="sm"
                value={range}
                onValueChange={(v) => {
                  setRange(v);
                  setPicked(null);
                  setScrub(null);
                }}
                options={[
                  { value: "24h", label: "24 hours" },
                  { value: "7d", label: "7 days" },
                  { value: "30d", label: "30 days" },
                ]}
              />
            </div>

            {/* The horizon */}
            <div className="px-4 pt-4 sm:px-6">
              <div
                role="group"
                tabIndex={0}
                aria-label="Orders an hour by city. Up and down pick a city, left and right move through time."
                onPointerMove={onMove}
                onPointerLeave={() => {
                  setScrub(null);
                  setPicked(null);
                }}
                onKeyDown={onKey}
                className="relative h-[300px] cursor-crosshair touch-pan-y rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 sm:h-[360px] dark:focus-visible:ring-blue-500/50"
              >
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  aria-hidden
                  className="absolute inset-0 size-full [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
                >
                  {data.map((v, k) => {
                    const p = paths(v, k);
                    const f = flat(k);
                    const on = k === shownRow;
                    // Far rows sit in a haze; near rows are drawn harder.
                    const depth = k / (REGIONS.length - 1);
                    return (
                      <motion.g
                        key={k}
                        initial={false}
                        animate={{ y: on ? -6 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        <motion.path
                          initial={reduce ? false : { d: f.area }}
                          animate={{ d: p.area }}
                          transition={{
                            duration: reduce ? 0 : 0.9,
                            delay: reduce ? 0 : 0.15 + k * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          style={{
                            fill: on
                              ? "color-mix(in oklab, var(--signal) 9%, var(--paper))"
                              : `color-mix(in oklab, var(--ink) ${1 + depth * 3}%, var(--paper))`,
                          }}
                          className="transition-[fill] duration-300"
                        />
                        <motion.path
                          initial={reduce ? false : { d: f.line }}
                          animate={{ d: p.line }}
                          transition={{
                            duration: reduce ? 0 : 0.9,
                            delay: reduce ? 0 : 0.15 + k * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          fill="none"
                          vectorEffect="non-scaling-stroke"
                          strokeWidth={on ? 2 : 1.25}
                          strokeLinejoin="round"
                          style={{
                            stroke: on
                              ? "var(--signal)"
                              : `color-mix(in oklab, var(--ink) ${14 + depth * 46}%, transparent)`,
                          }}
                          className="transition-[stroke] duration-300"
                        />
                      </motion.g>
                    );
                  })}
                </svg>

                {/* City codes along the left, on their baselines */}
                <ul
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                >
                  {REGIONS.map((r, k) => (
                    <li
                      key={r.code}
                      style={{ top: pct(y0(k) - 14, H) }}
                      className={cn(
                        "absolute left-0 font-mono text-[10px] leading-none transition-colors duration-300",
                        k === shownRow
                          ? "font-medium text-blue-600 dark:text-blue-500"
                          : "text-neutral-400 dark:text-neutral-600",
                      )}
                    >
                      {r.code}
                    </li>
                  ))}
                </ul>

                {/* The moment being read */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 w-px border-l border-dashed border-blue-600/40 dark:border-blue-500/40"
                  initial={false}
                  animate={{ left: pct(x(at), W) }}
                  transition={{ type: "spring", stiffness: 700, damping: 50 }}
                />
                <motion.div
                  className="pointer-events-none absolute"
                  initial={false}
                  animate={{ left: pct(x(at), W), top: pct(pointY, H) }}
                  transition={{ type: "spring", stiffness: 700, damping: 50 }}
                >
                  <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 ring-4 ring-blue-600/15 dark:bg-blue-500 dark:ring-blue-500/20" />
                  <div
                    aria-live="polite"
                    className={cn(
                      "absolute bottom-3 w-max rounded-[10px] bg-white px-2.5 py-1.5 text-xs shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_10%,transparent),0_10px_24px_-10px_color-mix(in_oklab,var(--color-neutral-600)_55%,transparent)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_10%,transparent),0_10px_24px_-10px_color-mix(in_oklab,var(--color-black)_70%,transparent)]",
                      // Keep the card on the page at either end.
                      at < N * 0.15
                        ? "left-0 -translate-x-3"
                        : at > N * 0.85
                          ? "right-0 translate-x-3"
                          : "left-0 -translate-x-1/2",
                    )}
                  >
                    <span className="font-medium text-neutral-950 dark:text-neutral-50">
                      {region.city}
                    </span>
                    <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">
                      ·
                    </span>
                    <span className="text-neutral-500 tabular-nums">
                      {label(range, at)}
                    </span>
                    <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">
                      ·
                    </span>
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        ms > region.base * 2.5
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-neutral-800 dark:text-neutral-200",
                      )}
                    >
                      {ms} orders
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* One live fact about the whole store, on the window's corner */}
        <div className="absolute -top-3.5 right-6 flex h-7 items-center gap-2 rounded-full bg-white px-3 text-[12px] text-neutral-600 shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_8px_20px_-6px_rgb(50_50_93/0.22)] sm:right-10 dark:bg-neutral-800 dark:text-neutral-300 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_8px_20px_-6px_rgb(0_0_0/0.7)]">
          <span className="relative grid size-2 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50 [animation-duration:2.4s]" />
            <span className="relative size-1.5 rounded-full bg-emerald-500" />
          </span>
          <span>
            <span className="font-medium text-neutral-950 tabular-nums dark:text-neutral-50">
              18,402
            </span>{" "}
            orders today
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroHorizon />;
}
