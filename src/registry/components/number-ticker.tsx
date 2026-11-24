"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const TRAILS = 3;

type DigitProps = {
  digit: number;
  /** Bumps every time the number changes; a new value starts a new run. */
  run: number;
  /** Whether this column takes part in the run (unchanged leading digits sit still). */
  spin: boolean;
  /** How long this column runs before it locks, in ms. */
  duration: number;
  streak: string;
};

function Digit({ digit, run, spin, duration, streak }: DigitProps) {
  const reduce = useReducedMotion();
  const filterId = `nt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const layer = useRef<HTMLSpanElement>(null);
  const main = useRef<HTMLSpanElement>(null);
  const trails = useRef<(HTMLSpanElement | null)[]>([]);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  // The digit on screen; a new run picks up from wherever the last one was.
  const shown = useRef(run === 0 ? digit : 0);

  useEffect(() => {
    const layerEl = layer.current;
    const mainEl = main.current;
    const text = mainEl?.firstChild;
    if (!layerEl || !mainEl || !text) return;

    const settle = () => {
      shown.current = digit;
      text.nodeValue = String(digit);
      mainEl.style.transform = "";
      mainEl.style.textShadow = "";
      layerEl.style.filter = "";
      blur.current?.setAttribute("stdDeviation", "0 0");
      for (const t of trails.current) if (t) t.style.opacity = "0";
    };

    if (run === 0 || !spin || reduce) {
      settle();
      return;
    }

    // Count up through whole laps before landing, so it flickers through every digit.
    const from = shown.current;
    const laps = Math.max(1, Math.round(duration / 170));
    const steps = laps * 10 + ((digit - from + 10) % 10);
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      // 0 → 1 → 0: how fast the column is moving right now. Drives blur, lean and trails.
      const speed = Math.min(1, t / 0.08) * (1 - t) ** 1.4;
      const n = (from + Math.floor(eased * steps)) % 10;

      shown.current = n;
      text.nodeValue = String(n);
      mainEl.style.transform = `translateX(${0.05 * speed}em) skewX(${-14 * speed}deg)`;
      // A glow that drags behind the digit while it runs.
      mainEl.style.textShadow =
        speed > 0.02
          ? `${(-0.12 * speed).toFixed(3)}em 0 ${(0.3 * speed).toFixed(3)}em ${streak}, 0 0.04em 0.12em rgb(0 0 0 / 0.18)`
          : "";
      layerEl.style.filter = speed > 0.02 ? `url(#${filterId})` : "";
      blur.current?.setAttribute("stdDeviation", `${(0.32 * speed).toFixed(3)} 0`);
      trails.current.forEach((el, i) => {
        if (!el) return;
        const k = i + 1;
        // Afterimages lag a few digits behind and string out to the left.
        el.textContent = String((n - k + 10) % 10);
        el.style.opacity = String(((0.55 / k) * speed).toFixed(3));
        el.style.transform = `translateX(${-0.3 * k * speed}em) skewX(${-14 * speed}deg)`;
      });

      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      settle();
      // The lock: a spark that fades off the landed digit.
      mainEl.animate(
        [
          { textShadow: `0 0 0.2em ${streak}, 0 0 0.5em ${streak}`, offset: 0 },
          { textShadow: `0 0 0 transparent, 0 0 0 transparent` },
        ],
        { duration: 480, easing: "ease-out" },
      );
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, digit, spin, duration, streak, reduce, filterId]);

  return (
    <span className="relative inline-block w-[0.62em] text-center leading-none">
      {/* The invisible zero gives the slot its width and a real text baseline. */}
      <span className="invisible">0</span>
      <span ref={layer} aria-hidden className="absolute inset-0">
        {Array.from({ length: TRAILS }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              trails.current[i] = el;
            }}
            className="absolute inset-0 opacity-0 will-change-transform"
            style={{ color: streak, textShadow: "none" }}
          />
        ))}
        <span ref={main} className="absolute inset-0 will-change-transform">
          {digit}
        </span>
      </span>
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <filter
          id={filterId}
          primitiveUnits="objectBoundingBox"
          x="-150%"
          y="-10%"
          width="400%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Horizontal-only blur: the smear a speedster leaves behind. */}
          <feGaussianBlur ref={blur} stdDeviation="0 0" />
        </filter>
      </svg>
    </span>
  );
}

export function NumberTicker({
  value,
  format,
  locale = "en-US",
  duration = 420,
  stagger = 90,
  streak = "currentColor",
  className,
}: {
  value: number;
  format?: Intl.NumberFormatOptions;
  locale?: string;
  /** How long the first changing digit runs before it locks, in ms. */
  duration?: number;
  /** Extra time each following digit runs, so they lock one at a time, left to right. */
  stagger?: number;
  /** Colour of the afterimages and the spark on landing. */
  streak?: string;
  className?: string;
}) {
  const text = new Intl.NumberFormat(locale, format).format(value);
  const [snap, setSnap] = useState({ text, prev: text, run: 0 });
  if (snap.text !== text) setSnap({ text, prev: snap.text, run: snap.run + 1 });

  const chars = text.split("");
  const prev = snap.prev.split("");
  // Odometer rule: everything from the first changed column (from the left) runs.
  let first = chars.findIndex((c, i) => prev[prev.length - chars.length + i] !== c);
  if (first === -1) first = chars.length;

  let order = 0;
  return (
    <span data-slot="number-ticker" className={cn("inline-flex items-baseline tabular-nums", className)} aria-label={text}>
      {chars.map((c, i) => {
        // key from the right so the ones column stays stable as numbers grow
        const key = chars.length - i;
        if (!/\d/.test(c)) {
          return (
            <span key={key} aria-hidden className="leading-none">
              {c}
            </span>
          );
        }
        const spin = i >= first;
        const d = spin ? duration + stagger * order++ : duration;
        return <Digit key={key} digit={Number(c)} run={snap.run} spin={spin} duration={d} streak={streak} />;
      })}
    </span>
  );
}

export default function Demo() {
  const [value, setValue] = useState(0);

  // Two runs, then it rests: up from zero, then one more climb.
  useEffect(() => {
    const steps = [setTimeout(() => setValue(48290), 500), setTimeout(() => setValue(52817), 2600)];
    return () => steps.forEach(clearTimeout);
  }, []);

  return (
    <NumberTicker
      value={value}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      streak="var(--color-amber-400)"
      className="text-6xl font-semibold tracking-[-0.03em] text-neutral-950 [text-shadow:0_1px_0_rgb(255_255_255/0.6),0_0.04em_0.08em_rgb(0_0_0/0.12),0_0.12em_0.3em_rgb(0_0_0/0.1)] dark:text-neutral-50 dark:[text-shadow:0_0.04em_0.1em_rgb(0_0_0/0.6),0_0.12em_0.35em_rgb(0_0_0/0.5)]"
    />
  );
}
