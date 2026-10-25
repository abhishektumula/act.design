"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "night" | "dawn" | "day" | "dusk";

/** Each phase repaints the sky and the three landscape layers. */
export const phases: Record<Phase, { sky: string; far: string; mid: string; near: string; lit: boolean }> = {
  night: { sky: "from-indigo-950 via-slate-900 to-indigo-900", far: "fill-indigo-900", mid: "fill-slate-950", near: "fill-black", lit: true },
  dawn: { sky: "from-indigo-400 via-rose-300 to-amber-200", far: "fill-rose-400/70", mid: "fill-indigo-900/80", near: "fill-indigo-950", lit: false },
  day: { sky: "from-sky-600 via-sky-400 to-sky-200", far: "fill-sky-700/40", mid: "fill-slate-700", near: "fill-slate-800", lit: false },
  dusk: { sky: "from-violet-900 via-rose-500 to-orange-300", far: "fill-rose-700/60", mid: "fill-violet-950", near: "fill-neutral-950", lit: true },
};

const phaseOf = (h: number): Phase => (h < 5 || h >= 21 ? "night" : h < 8 ? "dawn" : h < 17 ? "day" : "dusk");

const grain =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")]";

// Wall-clock hour and minute in a time zone, as numbers.
function clockIn(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour"), m: get("minute") };
}

function offsetFromHere(timeZone: string, date: Date) {
  const there = clockIn(timeZone, date);
  const here = { h: date.getHours(), m: date.getMinutes() };
  let diff = there.h * 60 + there.m - (here.h * 60 + here.m);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff / 60;
}

const skyline = [
  [0, 26, 70], [22, 18, 110], [38, 30, 84], [66, 14, 150], [78, 24, 120], [100, 36, 96],
  [134, 16, 170], [148, 28, 130], [174, 22, 92], [194, 34, 140], [226, 18, 104], [242, 30, 124], [270, 50, 86],
] as const;

function Landscape({ phase, tilt }: { phase: Phase; tilt: number }) {
  const p = phases[phase];
  return (
    <>
      <motion.svg animate={{ x: tilt * -6 }} viewBox="0 0 320 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        <path d="M-20 290 C 40 250, 90 270, 140 252 S 250 236, 340 262 V 400 H -20 Z" className={cn("transition-[fill] duration-1000", p.far)} />
      </motion.svg>
      <motion.svg animate={{ x: tilt * -12 }} viewBox="0 0 320 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        {skyline.map(([x, w, h], i) => (
          <g key={x}>
            <rect x={x} y={320 - h} width={w - 2} height={h + 80} className={cn("transition-[fill] duration-1000", p.mid)} />
            {Array.from({ length: Math.floor(h / 12) }, (_, r) =>
              Array.from({ length: Math.floor((w - 4) / 7) }, (_, c) =>
                (r * 5 + c * 3 + i) % 4 === 0 ? (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 3 + c * 7}
                    y={326 - h + r * 12}
                    width="3"
                    height="4"
                    className={cn("fill-amber-200 transition-opacity duration-1000", p.lit ? "opacity-90" : "opacity-0")}
                  />
                ) : null,
              ),
            )}
          </g>
        ))}
      </motion.svg>
      <motion.svg animate={{ x: tilt * -20 }} viewBox="0 0 320 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        <path d="M-30 340 C 60 322, 120 344, 200 330 S 300 322, 350 336 V 400 H -30 Z" className={cn("transition-[fill] duration-1000", p.near)} />
      </motion.svg>
    </>
  );
}

export type City = { name: string; timeZone: string };

const defaultCities: City[] = [
  { name: "Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Lisbon", timeZone: "Europe/Lisbon" },
  { name: "New York", timeZone: "America/New_York" },
];

/**
 * A city card painted for the local time there, right now. Drag across the
 * sky to scrub through the day; let go and it returns to the present.
 */
export function WorldCard({ cities = defaultCities, className }: { cities?: City[]; className?: string }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [scrub, setScrub] = useState(0);
  const [tilt, setTilt] = useState(0);

  // Clock starts after mount so server and client agree on the first render.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const city = cities[index];
  const at = now ? new Date(now.getTime() + scrub * 3_600_000) : null;
  const clock = at ? clockIn(city.timeZone, at) : { h: 12, m: 0 };
  const hours = clock.h + clock.m / 60;
  const phase = phaseOf(clock.h);
  const offset = at ? offsetFromHere(city.timeZone, at) : 0;

  // Sun by day (06–20), moon by night, both on the same arc.
  const isDay = hours >= 6 && hours < 20;
  const arc = isDay ? (hours - 6) / 14 : ((hours + 4) % 24) / 10;
  const orb = { left: `${8 + arc * 84}%`, top: `${58 - Math.sin(arc * Math.PI) * 44}%` };

  return (
    <div
      ref={box}
      data-slot="world-card"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        drag.current = { x: e.clientX };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const r = box.current!.getBoundingClientRect();
        setTilt(((e.clientX - r.left) / r.width - 0.5) * 2);
        if (drag.current) setScrub(Math.round(((e.clientX - drag.current.x) / r.width) * 24));
      }}
      onPointerUp={() => {
        drag.current = null;
        setScrub(0);
      }}
      onPointerLeave={() => setTilt(0)}
      className={cn(
        "relative isolate flex aspect-[4/5] w-full max-w-sm cursor-grab touch-none flex-col overflow-hidden rounded-3xl text-white shadow-2xl shadow-shade/40 ring-1 ring-base-50/10 select-none active:cursor-grabbing",
        className,
      )}
    >
      {/* Sky: phases cross-fade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={now ? phase : "loading"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={cn("absolute inset-0 -z-20 bg-linear-to-b", now ? phases[phase].sky : "from-base-800 to-base-900")}
        />
      </AnimatePresence>
      {phase === "night" && now && (
        <div className="absolute inset-0 -z-10">
          {[[12, 10], [30, 22], [48, 8], [66, 18], [84, 12], [22, 34], [74, 30], [56, 26]].map(([x, y]) => (
            <span key={`${x}${y}`} className="absolute size-0.5 animate-pulse rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      )}
      {now && (
        <motion.span
          animate={orb}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          className={cn(
            "absolute -z-10 size-10 -translate-1/2 rounded-full",
            isDay ? "bg-amber-100 shadow-[0_0_60px_12px_var(--color-amber-200)]" : "bg-slate-100 shadow-[0_0_40px_4px_var(--color-indigo-300)]",
          )}
        />
      )}
      <div className="absolute inset-0 -z-10">
        <Landscape phase={now ? phase : "night"} tilt={tilt} />
      </div>
      <div className={cn("pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay", grain)} />

      <div className="flex items-start justify-between p-6 drop-shadow-sm">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={city.name}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              className="text-lg font-medium"
            >
              {city.name}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-white/70">
            {now ? (offset === 0 ? "Same time as you" : `${offset > 0 ? "+" : ""}${offset}h from you`) : " "}
          </p>
        </div>
        <p className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">
          {now ? (
            <>
              {String(clock.h).padStart(2, "0")}
              <span className={cn("transition-opacity", scrub === 0 && now.getSeconds() % 2 ? "opacity-30" : "opacity-100")}>:</span>
              {String(clock.m).padStart(2, "0")}
            </>
          ) : (
            <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-white/10 align-middle" />
          )}
        </p>
      </div>

      <AnimatePresence>
        {scrub !== 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mx-auto rounded-full bg-black/30 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur-md"
          >
            {scrub > 0 ? "+" : ""}
            {scrub}h
          </motion.span>
        )}
      </AnimatePresence>

      <div className="mt-auto p-4">
        <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-white/60">
          <MoveHorizontal className="size-3.5" /> Drag to scrub the day
        </p>
        <div className="flex rounded-2xl bg-black/25 p-1 ring-1 ring-white/10 inset-shadow-2xs inset-shadow-white/10 backdrop-blur-xl">
          {cities.map((c, i) => (
            <button
              key={c.timeZone}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-9 flex-1 rounded-xl text-sm font-medium transition-colors",
                i === index ? "text-neutral-950" : "text-white/75 hover:text-white",
              )}
            >
              {i === index && (
                <motion.span
                  layoutId={`${id}-city`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-md shadow-black/20 inset-shadow-2xs inset-shadow-white"
                />
              )}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  return <WorldCard />;
}
