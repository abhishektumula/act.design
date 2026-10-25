"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** `--glyph` colours the characters; the screen is recessed into the card. */
export const glyphCardVariants = cva(
  "group relative flex w-full max-w-sm flex-col rounded-3xl bg-base-950 p-2 shadow-xl shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
  {
    variants: {
      variant: {
        cobalt: "[--glyph:var(--color-blue-400)] [--screen:var(--color-neutral-950)]",
        phosphor: "[--glyph:var(--color-emerald-400)] [--screen:var(--color-neutral-950)]",
        ember: "[--glyph:var(--color-orange-400)] [--screen:var(--color-stone-950)]",
        ink: "[--glyph:var(--color-blue-100)] [--screen:var(--color-blue-700)]",
      },
    },
    defaultVariants: { variant: "cobalt" },
  },
);

const RAMP = " .·:;=+*%#";
const SCRAMBLE = "!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Ripple = { x: number; y: number; t: number; strength: number };

/**
 * Ambient interference waves rendered as text. Pointer movement leaves a soft
 * wake and clicks drop a stone. Crests spell out `word`.
 */
function GlyphField({ word, cols = 52, rows = 26 }: { word: string; cols?: number; rows?: number }) {
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = pre.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const letters = word.toUpperCase().replace(/\s/g, "") || "#";
    const ripples: Ripple[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let lastWake = 0;

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      if (time - last < 50) return;
      last = time;
      const t = time / 1000;
      while (ripples.length && t - ripples[0].t > 4) ripples.shift();

      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const u = x / cols;
          const v = y / rows;
          // Two slow wave trains crossing each other
          let f = 0.32 * Math.sin(u * 9 + t * 0.9) * Math.sin(v * 7 - t * 0.6) + 0.18 * Math.sin((u + v) * 14 - t * 1.4);
          for (const r of ripples) {
            const age = t - r.t;
            const d = Math.hypot(u - r.x, (v - r.y) * (rows / cols) * 1.9);
            const front = age * 0.35;
            f += Math.sin((d - front) * 40) * Math.exp(-((d - front) ** 2) * 90) * Math.exp(-age * 1.1) * r.strength;
          }
          const a = Math.abs(f);
          out += a > 0.62 ? letters[(x + y * 2) % letters.length] : RAMP[Math.min(RAMP.length - 1, Math.floor(a * 15))];
        }
        out += "\n";
      }
      el.textContent = out;
      if (still) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);

    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    const move = (e: PointerEvent) => {
      const now = performance.now() / 1000;
      if (now - lastWake < 0.12) return;
      lastWake = now;
      ripples.push({ ...at(e), t: now, strength: 0.45 });
    };
    const down = (e: PointerEvent) => ripples.push({ ...at(e), t: performance.now() / 1000, strength: 1.4 });
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerdown", down);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", down);
    };
  }, [word, cols, rows]);

  return (
    <pre
      ref={pre}
      aria-hidden
      className="pointer-events-none mx-auto w-max font-mono text-[10px] leading-[11px] font-semibold text-(--glyph) select-none"
    />
  );
}

/** Text that scrambles and resolves left to right each time `play` flips on. */
function Decode({ text, play }: { text: string; play: boolean }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!play) return;
    let frame = 0;
    const total = text.length;
    const t = setInterval(() => {
      frame++;
      const done = Math.floor(frame * 1.6);
      setShown(
        Array.from(text, (ch, i) =>
          i < done || ch === " " ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)],
        ).join(""),
      );
      if (done >= total) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [play, text]);

  return <span aria-label={text}>{play ? shown : text}</span>;
}

export function GlyphCard({
  title,
  eyebrow,
  children,
  word = "signal",
  variant,
  className,
  classNames,
}: VariantProps<typeof glyphCardVariants> & {
  title: string;
  eyebrow?: ReactNode;
  children?: ReactNode;
  word?: string;
  className?: string;
  classNames?: { screen?: string; content?: string; title?: string };
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-slot="glyph-card"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className={cn(glyphCardVariants({ variant }), className)}
    >
      <div
        className={cn(
          "relative flex h-60 cursor-crosshair items-center justify-center overflow-hidden rounded-[1.25rem] bg-(--screen) ring-1 ring-black/40 inset-shadow-sm inset-shadow-black/60",
          classNames?.screen,
        )}
      >
        <GlyphField word={word} />
        {/* Glass: a faint top sheen and scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/[0.06] to-transparent to-40%" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,var(--color-black)_3px)] opacity-20" />
      </div>
      <div className={cn("px-5 pt-5 pb-4", classNames?.content)}>
        {eyebrow && <p className="font-mono text-[11px] tracking-wider text-(--glyph) uppercase">{eyebrow}</p>}
        <h3 className={cn("mt-2 text-xl font-medium tracking-[-0.02em] text-balance text-base-50", classNames?.title)}>
          <Decode text={title} play={hover} />
        </h3>
        {children && <div className="mt-2 text-sm leading-relaxed text-pretty text-base-500">{children}</div>}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <GlyphCard eyebrow="Research · 04" title="Listening between the words" word="voice">
      Move to leave a wake, click to drop a stone. Crests of the wave spell out what the model hears.
    </GlyphCard>
  );
}
