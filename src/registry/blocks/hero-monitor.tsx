"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ArrowRight, Check, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollingNumber } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ the data */

/** One bar a tick; a loop of the story is LOOP ticks. */
const TICK = 220;
const LOOP = 60;
/** Bars on screen. */
const N = 52;
const ALERT_AT = 60;
/** Each bar's share of the chart's width, in %. */
const PITCH = 100 / N;
/** Bars in a row over the line before sales is told. */
const RUN = 3;

/**
 * Acme's buying intent, 0 to 100, at any tick. One loop is a visit: browsing,
 * a climb into pricing, the whole buying team on the site, then it cools off.
 * Pure, so the server and the browser draw the same chart.
 */
function intent(t: number) {
  const i = ((t % LOOP) + LOOP) % LOOP;
  const noise = Math.sin(t * 1.7) * 3 + Math.sin(t * 0.61) * 2;
  if (i < 18) return Math.round(15 + Math.sin(i * 1.3) * 4 + noise);
  if (i < 26) return Math.round(22 + (i - 18) * 5 + noise);
  if (i < 39) return Math.round(71 + Math.sin(i * 0.9) * 6 + noise);
  return Math.round(52 - ((i - 39) / 20) * 36 + noise);
}

const phaseOf = (t: number) => ((t % LOOP) + LOOP) % LOOP;
/** The beats, as ranges of the loop. */
const calling = (p: number) => p >= 28 && p < 36;
const booked = (p: number) => p >= 36 && p < 47;
const buying = (p: number) => p >= 27 && p < 44;
/** The tick the new activity row lands on, in every loop. */
const VISIT = 27;

const PEOPLE = [
  {
    name: "Jin Park",
    role: "VP Finance",
    did: "Viewed Enterprise pricing",
    tone: "bg-amber-500",
  },
  {
    name: "Sara Ito",
    role: "CFO",
    did: "Compared Team and Business",
    tone: "bg-emerald-600",
  },
  {
    name: "Ola Berg",
    role: "Head of IT",
    did: "Read the SSO docs",
    tone: "bg-sky-600",
  },
];

type Activity = { id: number; person: number };

/** Opens with two earlier visits in the feed; each loop adds the next person on top. */
const FIRST_FEED: Activity[] = [
  { id: -1, person: 2 },
  { id: -2, person: 1 },
];
const AGO = ["Just now", "4 min ago", "12 min ago"];

/** The poster: the payoff left on screen, the call already a meeting. */
const POSTER_TICK = LOOP + 38;
/** The animated loop opens on a calm, browsing frame. */
const START_TICK = LOOP + 4;

/* -------------------------------------------------------------- the pieces */

function Avatar({
  initials,
  tone,
  className,
}: {
  initials: string;
  tone: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

/** A gray stand-in for words the story doesn't need. */
function Filler({ w, className }: { w: number; className?: string }) {
  return (
    <span
      style={{ width: w }}
      className={cn(
        "block h-[7px] rounded-full bg-neutral-950/[0.07] dark:bg-neutral-50/[0.08]",
        className,
      )}
    />
  );
}

/** A word that rolls up when it changes, never crossfading in place. */
function RollWord({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("relative inline-grid overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "90%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-90%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ---------------------------------------------------------------- the hero */

/**
 * A sales hero shot like a product page: the Ripple account view runs off the
 * page, its intent chart streaming in live. When Acme stays over the alert line
 * the rep's phone rings on a card over the window's edge, and a moment later
 * the call has become a meeting. Reduced motion shows that moment, still.
 */
export function HeroMonitor({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-80px" });
  const playing = inView && !reduce;

  const [tick, setTick] = useState(START_TICK);
  const [feed, setFeed] = useState<Activity[]>(FIRST_FEED);
  const t = reduce ? POSTER_TICK : tick;
  const phase = phaseOf(t);

  // The conveyor. Every bar has a fixed place on an endless track (its tick times
  // the pitch) and only the track moves, driven by one continuous clock. A new
  // bar is simply added past the right edge, so nothing already drawn ever jumps
  // when React catches up with the clock.
  const since = useRef(0);
  const now = useRef(START_TICK);
  const clock = useMotionValue(reduce ? POSTER_TICK : START_TICK);
  const shift = useTransform(clock, (c) => `${-(c - N + 1) * PITCH}%`);
  useAnimationFrame((_, delta) => {
    if (!playing) return;
    since.current += Math.min(delta, 64);
    if (since.current >= TICK) {
      since.current -= TICK;
      const next = ++now.current;
      setTick(next);
      // Each loop, the visit lands in the feed as a new row; the oldest runs off the crop.
      if (phaseOf(next) === VISIT) {
        const loop = Math.floor(next / LOOP);
        setFeed((f) =>
          [{ id: next, person: (loop + 2) % PEOPLE.length }, ...f].slice(0, 3),
        );
      }
    }
    clock.set(now.current + since.current / TICK);
  });

  // One spare bar each side, so the edges are always covered between renders.
  const bars = Array.from({ length: N + 3 }, (_, k) => t - N + k);
  const hot = (x: number) => {
    // Part of a run of RUN or more over the line, looking both ways.
    let a = x;
    let b = x;
    while (intent(a - 1) > ALERT_AT && x - a < RUN) a--;
    while (intent(b + 1) > ALERT_AT && b - x < RUN && b + 1 <= t) b++;
    return intent(x) > ALERT_AT && b - a + 1 >= RUN;
  };
  // The headline number moves every few ticks, not every bar.
  const shown = intent(t - (t % 3));
  const ringing = calling(phase);
  const met = booked(phase);
  const lead =
    PEOPLE[reduce ? 0 : (Math.floor((t - VISIT) / LOOP) + 2) % PEOPLE.length];
  const feedNow = reduce ? [{ id: 0, person: 0 }, ...FIRST_FEED] : feed;

  return (
    <section
      data-slot="hero-monitor"
      className={cn(
        "relative overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 dark:bg-black",
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 sm:text-6xl dark:text-neutral-50">
            Call them{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              while they&apos;re still on your pricing page.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
            Ripple scores every visit from your target accounts as it happens,
            and rings the right rep the moment an account starts to buy.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button tone="signal" size="lg">
              Start scoring free
            </Button>
            <Button size="lg">
              See a live account <ArrowRight />
            </Button>
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            Free for 25 target accounts. No card needed.
          </p>
        </div>

        {/* The stage: the window bleeds off the right and fades out at its foot; the call card straddles its left edge. */}
        <div
          ref={stage}
          aria-hidden
          className="relative h-[440px] sm:h-[500px]"
        >
          {/* The fade lives on a padded wrapper, so it never clips the window's shadow */}
          <div className="absolute -top-12 -right-12 bottom-0 -left-12 p-12 pb-0 [mask-image:linear-gradient(to_bottom,black_62%,transparent)] sm:-right-48 lg:-right-72 lg:left-[-1.5rem]">
            <div className="relative h-full w-full overflow-hidden rounded-t-[14px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_30px_60px_-12px_rgb(50_50_93/0.25),0_18px_36px_-18px_rgb(0_0_0/0.3)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_30px_60px_-12px_rgb(0_0_0/0.6)]">
              {/* Chrome */}
              <div className="flex h-[38px] items-center gap-[6px] border-b border-neutral-950/[0.06] px-[14px] dark:border-neutral-50/[0.07]">
                {["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"].map((c) => (
                  <span key={c} className={cn("size-[10px] rounded-full", c)} />
                ))}
                <span className="ml-5 flex h-[24px] items-center rounded-[7px] bg-neutral-950/[0.04] px-3 text-[12px] text-neutral-500 dark:bg-neutral-50/[0.06]">
                  app.ripple.so/accounts/acme
                </span>
              </div>

              <div className="flex">
                {/* Sidebar: filler, it only says "an app" */}
                <div className="hidden w-[148px] shrink-0 flex-col gap-1 border-r border-neutral-950/[0.06] bg-neutral-50/70 px-3 py-4 sm:flex dark:border-neutral-50/[0.07] dark:bg-neutral-950/40">
                  {[64, 78, 52, 70, 58].map((w, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex h-8 items-center gap-2.5 rounded-[7px] px-2",
                        i === 1 &&
                          "bg-neutral-950/[0.05] dark:bg-neutral-50/[0.07]",
                      )}
                    >
                      <span
                        className={cn(
                          "size-3.5 rounded-[4px]",
                          i === 1
                            ? "bg-neutral-950/25 dark:bg-neutral-50/30"
                            : "bg-neutral-950/[0.09] dark:bg-neutral-50/[0.1]",
                        )}
                      />
                      <Filler
                        w={w}
                        className={cn(
                          i === 1 && "bg-neutral-950/15 dark:bg-neutral-50/20",
                        )}
                      />
                    </span>
                  ))}
                </div>

                <div className="max-w-[560px] min-w-0 flex-1 px-6 pt-5 pb-10">
                  {/* The account, and the one big number */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="text-[17px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">
                        Acme Corp
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[13px] text-neutral-500">
                        <span
                          className={cn(
                            "size-1.5 rounded-full transition-colors duration-500",
                            buying(phase)
                              ? "bg-blue-600 dark:bg-blue-500"
                              : "bg-neutral-400 dark:bg-neutral-600",
                          )}
                        />
                        <RollWord
                          value={buying(phase) ? "Buying now" : "Browsing"}
                          className={cn(
                            "transition-colors duration-300",
                            buying(phase) &&
                              "text-neutral-900 dark:text-neutral-100",
                          )}
                        />
                        <span className="text-neutral-300 dark:text-neutral-700">
                          ·
                        </span>
                        6 people on the site
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-neutral-500">Intent</div>
                      <div className="mt-0.5 text-[34px] leading-none font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                        <RollingNumber value={String(shown)} />
                      </div>
                    </div>
                  </div>

                  {/* The chart, streaming in from the right */}
                  <div className="relative mt-6 h-[132px] [mask-image:linear-gradient(to_right,transparent,black_48px)]">
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div
                        style={{ x: shift }}
                        className="absolute inset-0 will-change-transform"
                      >
                        {bars.map((x) => {
                          const v = intent(x);
                          return (
                            <span
                              key={x}
                              style={{
                                height: `${v}%`,
                                left: `${x * PITCH}%`,
                                width: `calc(${PITCH}% - 3px)`,
                              }}
                              className={cn(
                                "absolute bottom-0 rounded-t-[2px] transition-colors duration-300",
                                hot(x)
                                  ? "bg-blue-600 dark:bg-blue-500"
                                  : v > ALERT_AT
                                    ? "bg-blue-600/35 dark:bg-blue-500/40"
                                    : "bg-neutral-950/[0.12] dark:bg-neutral-50/[0.14]",
                              )}
                            />
                          );
                        })}
                      </motion.div>
                    </div>
                    <div
                      style={{ bottom: `${ALERT_AT}%` }}
                      className="absolute inset-x-0 border-t border-dashed border-blue-600/70 dark:border-blue-500/70"
                    >
                      <span className="absolute right-0 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-blue-600 ring-1 ring-blue-600/25 dark:bg-neutral-900 dark:text-blue-400 dark:ring-blue-500/30">
                        Alert at {ALERT_AT}
                      </span>
                    </div>
                  </div>

                  {/* Who's on the site: real rows on top, the rest runs off the crop */}
                  <div className="mt-6 border-t border-neutral-950/[0.06] dark:border-neutral-50/[0.07]">
                    <AnimatePresence initial={false}>
                      {feedNow.map((a, i) => {
                        const p = PEOPLE[a.person];
                        return (
                          <motion.div
                            key={a.id}
                            layout="position"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.6,
                              ease: [0.25, 0.8, 0.25, 1],
                            }}
                            className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-neutral-950/[0.06] py-3 dark:border-neutral-50/[0.07]"
                          >
                            <Avatar initials={initials(p.name)} tone={p.tone} />
                            <div className="min-w-0 text-[13px] leading-[1.3]">
                              <div className="truncate text-neutral-900 dark:text-neutral-100">
                                <span className="font-medium">{p.name}</span>{" "}
                                <span className="text-neutral-500">
                                  · {p.role}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-neutral-500">
                                {p.did}
                              </div>
                            </div>
                            <span className="text-[12px] text-neutral-500 tabular-nums">
                              {AGO[i]}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {[0, 1].map((r) => (
                      <div
                        key={r}
                        className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-neutral-950/[0.06] py-3 dark:border-neutral-50/[0.07]"
                      >
                        <span className="size-7 rounded-full bg-neutral-950/[0.06] dark:bg-neutral-50/[0.08]" />
                        <div className="space-y-[7px]">
                          <Filler w={r ? 104 : 132} />
                          <Filler w={r ? 150 : 118} />
                        </div>
                        <Filler w={44} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The payoff: the rep's phone, over the window's left edge (its sidebar), never over the chart */}
          <div className="absolute bottom-2 left-4 w-[min(19rem,calc(100%-2rem))] sm:bottom-4 lg:top-[188px] lg:bottom-auto lg:-left-32">
            <AnimatePresence>
              {(ringing || met) && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
                  className="flex items-center gap-3 rounded-[14px] bg-white p-3 pr-3.5 shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_14px_32px_-8px_rgb(50_50_93/0.24),0_4px_10px_-4px_rgb(0_0_0/0.1)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_14px_32px_-8px_rgb(0_0_0/0.7)]"
                >
                  <Avatar
                    initials="MC"
                    tone="bg-rose-500"
                    className="size-9 text-xs"
                  />
                  <div className="min-w-0 flex-1 text-[13px] leading-[1.3]">
                    <div className="truncate font-medium text-neutral-950 dark:text-neutral-50">
                      <RollWord
                        value={met ? "Meeting booked" : "Calling Maria Chen"}
                      />
                    </div>
                    <div className="mt-0.5 truncate text-neutral-500">
                      <RollWord
                        value={
                          met
                            ? `Thursday 10:00 with ${lead.name}`
                            : "Acme is on your pricing page"
                        }
                      />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300 [&_svg]:size-4",
                      met
                        ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-600 text-white dark:bg-blue-500",
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={met ? "met" : "ring"}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {met ? (
                          <Check />
                        ) : (
                          <motion.span
                            className="block"
                            animate={
                              reduce
                                ? undefined
                                : { rotate: [0, -14, 14, -10, 10, 0] }
                            }
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              repeatDelay: 0.6,
                            }}
                          >
                            <PhoneCall />
                          </motion.span>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </span>
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
  return <HeroMonitor />;
}
