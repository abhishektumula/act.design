"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock, LoaderCircle, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Trip Search's own look: a bright sky panel with a frosted search bar and a
 * white pill, and results printed as boarding passes, perforated between
 * stub and fare. Big rounded corners, white type, a soft blue cast instead of
 * grey shadows.
 */

/** Four weekends away, each with its usual return fare in dollars. */
const TRIPS = [
  { code: "LIS", city: "Lisbon", base: 168 },
  { code: "RAK", city: "Marrakesh", base: 194 },
  { code: "KEF", city: "Reykjavík", base: 231 },
  { code: "NAP", city: "Naples", base: 142 },
];

/** Airport codes for the cities people most often fly from; anything else gets its first three letters. */
const HOME: Record<string, string> = {
  london: "LHR",
  paris: "CDG",
  berlin: "BER",
  "new york": "JFK",
  amsterdam: "AMS",
  madrid: "MAD",
  dublin: "DUB",
};

/** A stable pseudo-random number from a string, so the same city always reads the same. */
function seed(text: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

type Result = {
  from: string;
  code: string;
  trips: { code: string; city: string; price: number }[];
  heldHours: number;
};

function search(raw: string): Result {
  const key = raw.trim().toLowerCase();
  const from = key.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return {
    from,
    code:
      HOME[key] ??
      key
        .replace(/[^a-z]/g, "")
        .slice(0, 3)
        .toUpperCase(),
    trips: TRIPS.map((t, i) => ({
      ...t,
      price: Math.round(t.base * (0.8 + seed(key, i) * 0.7)),
    })),
    heldHours: 12 + Math.round(seed(key, 9) * 60),
  };
}

const ROUTE = "M -40 470 C 220 520, 360 120, 620 210 S 1020 360, 1240 60";

/**
 * A dashed flight path across the sky with a plane flying it, drawn in SVG.
 * The dashes march toward the plane; with reduced motion the plane rests
 * part-way along.
 */
function FlightPath() {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <path
        d={ROUTE}
        fill="none"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
        className={
          reduce ? undefined : "[animation:tern-dash_1.2s_linear_infinite]"
        }
      />
      <g opacity="0.9">
        {/* lucide's plane, turned so its nose follows the path */}
        <g transform="rotate(45) translate(-12 -12)">
          <path
            d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
            fill="white"
          />
        </g>
        {reduce ? (
          <animateMotion
            dur="1s"
            fill="freeze"
            keyPoints="0.62;0.62"
            keyTimes="0;1"
            calcMode="linear"
            rotate="auto"
            path={ROUTE}
          />
        ) : (
          <animateMotion
            dur="14s"
            repeatCount="indefinite"
            rotate="auto"
            path={ROUTE}
          />
        )}
      </g>
      <style>{`@keyframes tern-dash { to { stroke-dashoffset: -12; } }`}</style>
    </svg>
  );
}

/** One boarding pass: the route on the stub, the fare past the perforation. */
function Pass({
  from,
  trip,
  index,
}: {
  from: string;
  trip: Result["trips"][number];
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={
        reduce ? false : { opacity: 0, y: 18, rotate: index % 2 ? 1.5 : -1.5 }
      }
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : 0.08 * index,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      className="[filter:drop-shadow(0_16px_24px_rgb(12_60_140/0.35))]"
    >
      {/* The notches are bitten out with a mask, so the sky shows through them whatever its colour */}
      <div
        style={{
          maskImage:
            "radial-gradient(circle 9px at calc(100% - 6rem) 0, transparent 97%, black), radial-gradient(circle 9px at calc(100% - 6rem) 100%, transparent 97%, black)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        className="relative flex rounded-[18px] bg-white text-left text-neutral-950"
      >
        <div className="flex-1 px-5 py-4">
          <div className="text-[11px] font-medium tracking-[0.14em] text-sky-700 uppercase">
            Fri → Sun
          </div>
          <div className="mt-2 flex items-center gap-2.5 text-[26px] leading-none font-semibold tracking-[-0.02em]">
            {from}
            <Plane className="size-4 text-sky-500" />
            {trip.code}
          </div>
          <div className="mt-2 text-[13px] text-neutral-500">{trip.city}</div>
        </div>
        {/* The perforation: a dashed rule with a notch bitten out at each end */}
        <div
          aria-hidden
          className="my-3 border-l-2 border-dashed border-sky-100"
        />
        <div className="flex w-24 flex-col items-center justify-center px-3">
          <span className="text-[11px] text-neutral-500">return</span>
          <span className="relative text-[24px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
            <span className="absolute top-0 right-full text-[14px] font-medium text-neutral-400">
              $
            </span>
            {trip.price}
          </span>
        </div>
      </div>
    </motion.li>
  );
}

/**
 * The view from seat 14A: a cabin window in its bezel with the shade half
 * drawn, looking out over a wing (a photograph, drifting very slowly so the
 * plane feels like it's moving). Photo: Benjamin Lehman on Unsplash.
 */
function Porthole({ image }: { image: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="relative mx-auto w-[240px] sm:w-[270px]">
      <style>{`@keyframes tern-drift { from { transform: scale(1.32) translate(-2%, 1%); } to { transform: scale(1.32) translate(2%, -1%); } }`}</style>
      {/* The cabin wall around the window */}
      <div className="rounded-[140px] bg-gradient-to-b from-white to-sky-50 p-4 shadow-[0_30px_60px_-20px_rgb(3_60_120/0.55),inset_0_-2px_6px_rgb(3_60_120/0.12)]">
        {/* The bezel */}
        <div className="rounded-[124px] bg-gradient-to-b from-neutral-200 to-white p-2.5 shadow-[inset_0_2px_6px_rgb(0_0_0/0.18)]">
          {/* The view */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[114px] bg-sky-700 shadow-[inset_0_0_24px_rgb(0_0_0/0.25)]">
            <Image
              src={image}
              alt=""
              fill
              sizes="270px"
              style={{
                animation: reduce
                  ? undefined
                  : "tern-drift 18s ease-in-out infinite alternate",
                transform: reduce ? "scale(1.32)" : undefined,
              }}
              className="object-cover object-[44%_50%]"
            />
            {/* The shade, half drawn */}
            <div className="absolute inset-x-0 top-0 h-[27%] bg-gradient-to-b from-neutral-100 to-white shadow-[0_6px_12px_-6px_rgb(0_0_0/0.35)]">
              <span className="absolute bottom-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-neutral-300" />
            </div>
            {/* A sheen across the glass, and the inner shadow of the frame */}
            <div className="absolute inset-0 rounded-[114px] bg-[linear-gradient(120deg,transparent_40%,rgb(255_255_255/0.16)_50%,transparent_60%)] shadow-[inset_0_0_18px_rgb(0_0_0/0.3)]" />
          </div>
        </div>
      </div>
      <span className="absolute -right-2 bottom-10 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-sky-700 shadow-[0_10px_24px_-10px_rgb(3_60_120/0.6)]">
        Seat 14A · window
      </span>
    </div>
  );
}

/**
 * A closing call to action for an AI travel agent, on a sky panel: type the
 * city you fly from and four weekends away come back as boarding passes, each
 * with its return fare. It opens on an example search, so it never sits empty.
 */
export function CtaCheck({
  sky = "/blocks/sky-cumulus.jpg",
  view = "/blocks/window-wing.jpg",
  backdrop = "/blocks/sky-altocumulus.jpg",
  className,
}: {
  /** The whole section's ground behind the panel: a soft, bright field of cloud. Photo: Unsplash. */
  backdrop?: string;
  /** The panel's ground: a bright sky, darker at the top so the headline reads. Photo: Rafael Garcin on Unsplash. */
  sky?: string;
  /** What you see from the window seat. */
  view?: string;
  className?: string;
}) {
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(() => search("London"));
  const [sample, setSample] = useState(true);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy || !/\p{L}{2,}/u.test(city)) return;
    setBusy(true);
    setSample(false);
    setTimeout(() => {
      setResult(search(city));
      setBusy(false);
    }, 900);
  };

  return (
    <section
      data-slot="cta-check"
      className={cn(
        "relative overflow-hidden bg-sky-200 px-4 py-16 sm:px-6 sm:py-28",
        className,
      )}
    >
      {/* The section's own sky, behind the panel: a soft field of cloud, shown as it is */}
      <Image src={backdrop} alt="" fill sizes="100vw" className="object-cover" />
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#1e3a8a] px-6 py-16 text-white shadow-[0_40px_80px_-30px_rgb(8_47_100/0.6),0_0_0_1px_rgb(255_255_255/0.25)] sm:px-12 sm:py-20">
        {/* The sky itself: a photograph, shown as it is */}
        <Image
          src={sky}
          alt=""
          fill
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover object-[50%_30%]"
        />
        <FlightPath />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-sky-100">
              Tern, your weekend travel agent
            </p>
            <h2 className="mt-4 text-[38px] leading-[1] font-bold tracking-[-0.04em] text-balance sm:text-[60px]">
              Where can you go this weekend?
            </h2>

            <form
              onSubmit={submit}
              className="mt-10 flex max-w-md items-center gap-2 rounded-full bg-white/20 p-1.5 pl-5 ring-1 ring-white/40 backdrop-blur-md transition focus-within:bg-white/25 focus-within:ring-white/70"
            >
              <Plane className="size-4 shrink-0 text-white/80" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Where do you fly from?"
                aria-label="City you fly from"
                autoComplete="address-level2"
                className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/70"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-sky-700 transition-transform outline-none hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-500 disabled:opacity-80"
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </form>
            <p className="mt-4 text-[14px] text-sky-100">
              {sample
                ? "An example from London. Try your own city."
                : "Free to plan. You only pay for what you book."}
            </p>
          </div>
          <Porthole image={view} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {result && !busy && (
            <motion.div
              key={result.from}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative mt-14"
            >
              <ul className="grid gap-4 sm:grid-cols-2">
                {result.trips.map((t, i) => (
                  <Pass key={t.code} from={result.code} trip={t} index={i} />
                ))}
              </ul>
              {/* The call to action */}
              <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[24px] bg-white/15 p-3 pl-6 ring-1 ring-white/30 backdrop-blur-md sm:flex-row">
                <span className="flex items-center gap-2.5 text-[14px] text-sky-50">
                  <Clock className="size-4 shrink-0" />
                  <span>
                    Fares held for{" "}
                    <span className="font-semibold text-white">
                      {result.heldHours} hours
                    </span>
                    . Tern books flights, a room and a table in one go.
                  </span>
                </span>
                <a
                  href="#"
                  className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white pr-2 pl-6 text-[15px] font-semibold text-sky-700 shadow-[0_12px_28px_-12px_rgb(3_60_120/0.7)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Plan my weekend
                  <span className="grid size-8 place-items-center rounded-full bg-sky-600 text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-4" />
                  </span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function Demo() {
  return <CtaCheck />;
}
