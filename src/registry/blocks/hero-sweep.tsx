"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollingNumber } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ the data */

/**
 * Where each city sits on the scope. The bearing follows longitude (London at
 * the top, the Americas to the left, Asia to the right), nudged apart where
 * cities crowd; the distance from the centre is how many mentions a minute it
 * usually makes.
 */
const CITIES = [
  { code: "SFO", bearing: -122, base: 80, left: true },
  { code: "IAD", bearing: -86, base: 58, left: true },
  { code: "YYZ", bearing: -64, base: 104, left: true },
  { code: "GRU", bearing: -40, base: 134, left: true },
  { code: "LHR", bearing: -14, base: 72, left: true },
  { code: "AMS", bearing: 6, base: 112 },
  { code: "FRA", bearing: 30, base: 64 },
  { code: "JNB", bearing: 52, base: 140 },
  { code: "BOM", bearing: 78, base: 108 },
  { code: "SIN", bearing: 108, base: 150 },
  { code: "NRT", bearing: 136, base: 96 },
  { code: "SYD", bearing: 160, base: 160 },
];
/** São Paulo is the city that trends. */
const HOT = 3;

/** Seconds for one turn of the beam, and turns in one loop of the story. */
const TURN = 3.6;
const TURNS = 4;
/** In which turn of the loop São Paulo is trending, and where it stands. */
const spike = (turn: number) => (turn === 1 ? 218 : turn === 2 ? 206 : 0);
const trending = (turn: number) => turn === 1 || turn === 2;

const R = 150;
const PER = (R - 18) / 220;
const RINGS = [50, 100, 150, 200];
const round = (n: number) => Math.round(n * 100) / 100;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

function place(bearing: number, v: number) {
  const d = Math.min(R - 16, 12 + v * PER);
  const a = ((bearing - 90) * Math.PI) / 180;
  return { x: round(170 + Math.cos(a) * d), y: round(170 + Math.sin(a) * d) };
}

/** A small, stable wobble so a city's answer is never quite the same twice. */
const wobble = (k: number, n: number) => Math.round(CITIES[k].base * (0.9 + 0.2 * ((Math.sin(n * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) / 2));

type Mention = { id: number; who: string; tone: string; text: string; city: string };

const POOL: Omit<Mention, "id">[] = [
  { who: "Luiza Mendes", tone: "bg-amber-500", text: "Northwind saved our launch week. The whole team moved over in a day.", city: "São Paulo" },
  { who: "Rafael Costa", tone: "bg-emerald-600", text: "Ok, the new Northwind boards are genuinely good.", city: "São Paulo" },
  { who: "Beatriz Lima", tone: "bg-sky-600", text: "Who else is at the Northwind meetup in Pinheiros tonight?", city: "São Paulo" },
];
const FIRST: Mention[] = [
  { id: -1, who: "Tom Becker", tone: "bg-violet-600", text: "Northwind's changelog is the only one I actually read.", city: "London" },
  { id: -2, who: "Ana Ruiz", tone: "bg-rose-500", text: "Switched from spreadsheets to Northwind. Not going back.", city: "Toronto" },
];
const AGO = ["Just now", "6 min ago", "14 min ago"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

function Filler({ w, className }: { w: number; className?: string }) {
  return <span style={{ width: w }} className={cn("block h-[7px] max-w-full rounded-full bg-neutral-950/[0.07] dark:bg-neutral-50/[0.08]", className)} />;
}

/* ---------------------------------------------------------------- the hero */

/**
 * A social listening hero shot like a product page. The Echo window runs off
 * the page: a scope on the left where the beam sweeps the world and each city
 * answers with a ping (bearing is where, distance is mentions a minute), and
 * the mentions themselves on the right. Every loop São Paulo starts talking:
 * its dot drifts to the rim, the mention lands in the feed and a trending card
 * crosses the window's edge, until a later sweep finds it back to usual.
 */
export function HeroSweep({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-80px" });
  const playing = inView && !reduce;

  // Last answer from each city, how often the beam has passed it, and the feed.
  const [last, setLast] = useState<number[]>(() => CITIES.map((c) => c.base));
  const [hits, setHits] = useState<number[]>(() => CITIES.map(() => 0));
  const [turn, setTurn] = useState(0);
  const [feed, setFeed] = useState<Mention[]>(FIRST);
  const [today, setToday] = useState(1204);

  const angle = useMotionValue(0);
  const rotate = useTransform(angle, (a) => `${a}deg`);
  const turns = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!playing) return;
    const from = angle.get();
    const step = (Math.min(delta, 64) / 1000) * (360 / TURN);
    let to = from + step;
    if (to >= 360) {
      to -= 360;
      turns.current += 1;
      setTurn(turns.current % TURNS);
      setToday((n) => n + 18 + (turns.current % 3) * 7);
    }
    angle.set(to);
    const loop = turns.current % TURNS;
    const crossed = CITIES.flatMap((c, k) => (norm(c.bearing - from) < step ? [k] : []));
    if (!crossed.length) return;
    setHits((h) => h.map((v, k) => (crossed.includes(k) ? v + 1 : v)));
    setLast((prev) => prev.map((v, k) => (crossed.includes(k) ? (k === HOT && spike(loop) ? spike(loop) : wobble(k, turns.current)) : v)));
    if (crossed.includes(HOT) && loop === 1) {
      const n = Math.floor(turns.current / TURNS);
      setFeed((f) => [{ id: turns.current, ...POOL[n % POOL.length] }, ...f].slice(0, 3));
      setToday((v) => v + 340);
    }
  });

  // Reduced motion: São Paulo mid-trend, the mention in, the card up, no beam.
  const values = reduce ? CITIES.map((c, k) => (k === HOT ? spike(1) : c.base)) : last;
  const shownFeed = reduce ? [{ id: 0, ...POOL[0] }, ...FIRST] : feed;
  const hot = reduce || (trending(turn) && last[HOT] > CITIES[HOT].base * 1.5);
  const count = reduce ? 1544 : today;

  return (
    <section
      data-slot="hero-sweep"
      className={cn(
        "relative overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 dark:bg-black",
        "[--ink:var(--color-neutral-950)] [--signal:var(--color-blue-600)] dark:[--ink:var(--color-neutral-50)] dark:[--signal:var(--color-blue-500)]",
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 sm:text-6xl dark:text-neutral-50">
            Hear it the minute <span className="text-neutral-400 dark:text-neutral-500">you start trending.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
            Echo listens for your brand in 12 cities, all day. When one of them starts talking about you, it&apos;s on your screen before the thread peaks.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button tone="signal" size="lg">
              Start listening free
            </Button>
            <Button size="lg">
              How listening works <ArrowRight />
            </Button>
          </div>
          <p className="mt-6 text-sm text-neutral-500">Free for 3 brands. No card needed.</p>
        </div>

        {/* The stage: the window bleeds off the right and fades at its foot; the trending card straddles its left edge. */}
        <div ref={stage} aria-hidden className="relative h-[620px] sm:h-[500px]">
          <div className="absolute -top-12 -right-12 bottom-0 -left-12 p-12 pb-0 [mask-image:linear-gradient(to_bottom,black_64%,transparent)] sm:-right-48 lg:left-[-1.5rem] lg:-right-72">
            <div className="relative h-full w-full overflow-hidden rounded-t-[14px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_30px_60px_-12px_rgb(50_50_93/0.25),0_18px_36px_-18px_rgb(0_0_0/0.3)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_30px_60px_-12px_rgb(0_0_0/0.6)]">
              {/* Chrome */}
              <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.06] px-[14px] dark:border-neutral-50/[0.07]">
                {["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"].map((c) => (
                  <span key={c} className={cn("size-[10px] rounded-full", c)} />
                ))}
                <span className="ml-5 flex h-[24px] items-center rounded-[7px] bg-neutral-950/[0.04] px-3 text-[12px] text-neutral-500 dark:bg-neutral-50/[0.06]">app.echo.so/northwind/live</span>
              </div>

              <div className="flex flex-col sm:flex-row">
                {/* The scope */}
                <div className="relative shrink-0 border-b border-neutral-950/[0.06] p-5 sm:w-[280px] sm:border-r sm:border-b-0 dark:border-neutral-50/[0.07]">
                  <div className="relative mx-auto aspect-square w-full max-w-[250px] sm:mt-2">
                    {!reduce && (
                      <div className="absolute inset-[6%] overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            rotate,
                            background: "conic-gradient(from 0deg, transparent 0deg 290deg, color-mix(in oklab, var(--signal) 6%, transparent) 320deg, color-mix(in oklab, var(--signal) 26%, transparent) 360deg)",
                          }}
                        >
                          <span className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-transparent to-[var(--signal)]" />
                        </motion.div>
                      </div>
                    )}
                    <svg viewBox="0 0 340 340" className="absolute inset-0 size-full overflow-visible">
                      {RINGS.map((v, i) => {
                        const d = Math.min(12 + v * PER, R);
                        return <circle key={v} cx={170} cy={170} r={d} fill="none" strokeDasharray={i === RINGS.length - 1 ? undefined : "2 4"} style={{ stroke: "color-mix(in oklab, var(--ink) 13%, transparent)" }} />;
                      })}
                      {CITIES.map((c, k) => {
                        const p = place(c.bearing, values[k]);
                        const loud = values[k] > c.base * 1.5;
                        return (
                          <motion.g key={c.code} initial={false} animate={{ x: p.x, y: p.y }} transition={{ type: "spring", stiffness: 90, damping: 16 }}>
                            <motion.circle
                              key={hits[k]}
                              r={4}
                              fill="none"
                              strokeWidth={1.25}
                              style={{ stroke: "var(--signal)" }}
                              initial={{ scale: 1, opacity: hits[k] ? (loud ? 0.9 : 0.5) : 0 }}
                              animate={{ scale: loud ? 5 : 3.5, opacity: 0 }}
                              transition={{ duration: 1.1, ease: "easeOut" }}
                            />
                            <circle r={loud ? 4.5 : 3.5} style={{ fill: loud ? "var(--signal)" : "color-mix(in oklab, var(--ink) 55%, transparent)" }} className="transition-[r] duration-300" />
                            <text x={"left" in c ? -9 : 9} y={4.5} textAnchor={"left" in c ? "end" : "start"} className={cn("text-[13px] font-medium", loud ? "fill-blue-600 dark:fill-blue-500" : "fill-neutral-400 dark:fill-neutral-500")}>
                              {c.code}
                            </text>
                          </motion.g>
                        );
                      })}
                      <circle cx={170} cy={170} r={9} style={{ fill: "color-mix(in oklab, var(--signal) 16%, transparent)" }} />
                      <circle cx={170} cy={170} r={3.5} style={{ fill: "var(--signal)" }} />
                    </svg>
                  </div>
                </div>

                {/* The mentions: the one big number, then the feed, newest on top */}
                <div className="max-w-[390px] min-w-0 flex-1 px-6 pt-5 pb-10">
                  <div className="flex items-end justify-between gap-6">
                    <div className="min-w-0">
                      <div className="text-[17px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">Mentions</div>
                      <div className="mt-1 truncate text-[13px] text-neutral-500">@northwind · 12 cities</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-neutral-500">Today</div>
                      <div className="mt-0.5 text-[34px] leading-none font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                        <RollingNumber value={count.toLocaleString("en-US")} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-neutral-950/[0.06] dark:border-neutral-50/[0.07]">
                    <AnimatePresence initial={false}>
                      {shownFeed.map((m, i) => (
                        <motion.div
                          key={m.id}
                          layout="position"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                          className="grid grid-cols-[28px_1fr] gap-3 border-b border-neutral-950/[0.06] py-3.5 dark:border-neutral-50/[0.07]"
                        >
                          <span className={cn("grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white", m.tone)}>{initials(m.who)}</span>
                          <div className="min-w-0 text-[13px] leading-[1.35]">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">{m.who}</span>
                              <span className="shrink-0 text-[12px] text-neutral-500">
                                {m.city} · {AGO[i]}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-pretty text-neutral-600 dark:text-neutral-400">{m.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {[0, 1].map((r) => (
                      <div key={r} className="grid grid-cols-[28px_1fr] gap-3 border-b border-neutral-950/[0.06] py-3.5 dark:border-neutral-50/[0.07]">
                        <span className="size-7 rounded-full bg-neutral-950/[0.06] dark:bg-neutral-50/[0.08]" />
                        <div className="space-y-[7px] pt-1">
                          <Filler w={r ? 96 : 120} />
                          <Filler w={r ? 230 : 260} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The payoff: São Paulo trending, over the window's left edge, clear of the scope's centre */}
          <div className="absolute bottom-3 left-4 w-[min(18.5rem,calc(100%-2rem))] sm:bottom-6 lg:top-[340px] lg:bottom-auto lg:-left-28">
            <AnimatePresence>
              {hot && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
                  className="flex items-center gap-3 rounded-[14px] bg-white p-3 pr-4 shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_14px_32px_-8px_rgb(50_50_93/0.24),0_4px_10px_-4px_rgb(0_0_0/0.1)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_14px_32px_-8px_rgb(0_0_0/0.7)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white dark:bg-blue-500 [&_svg]:size-4">
                    <TrendingUp />
                  </span>
                  <div className="min-w-0 flex-1 text-[13px] leading-[1.3]">
                    <div className="truncate font-medium text-neutral-950 dark:text-neutral-50">Trending in São Paulo</div>
                    <div className="mt-0.5 truncate text-neutral-500">340 mentions in 10 minutes</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroSweep />;
}
