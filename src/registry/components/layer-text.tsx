"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type LayerTextProps = {
  text: string;
  /** Font size: a number of px, or any CSS length such as "clamp(3rem, 12vw, 9rem)". */
  size?: number | string;
  weight?: number;
  /** Letter spacing in em. */
  tracking?: number;
  /** Width of the outline a hovered letter turns into, in px. */
  outline?: number;
  /** Space between the letter's ink and its frame, in px. Defaults to a tenth of the font size. */
  padding?: number;
  /** Side of the corner handles, in px. */
  handle?: number;
  /** The selection colour: outline, frame and handles. Any CSS colour. */
  color?: string;
  /** Show the selected letter's size under its frame, as a design tool does. */
  showSize?: boolean;
  className?: string;
};

type Rect = { x: number; y: number; w: number; h: number };

const CORNERS = ["top-0 left-0 -translate-x-1/2 -translate-y-1/2", "top-0 right-0 translate-x-1/2 -translate-y-1/2", "right-0 bottom-0 translate-x-1/2 translate-y-1/2", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2"];

let measurer: CanvasRenderingContext2D | null = null;

/** Where a letter's ink actually sits inside its box, so the frame hugs the glyph rather than the line. */
function ink(el: HTMLElement, ch: string, origin: HTMLElement): Rect {
  const cs = getComputedStyle(el);
  measurer ??= document.createElement("canvas").getContext("2d");
  const ctx = measurer!;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(ch);
  const box = el.getBoundingClientRect();
  const o = origin.getBoundingClientRect();
  const padL = parseFloat(cs.paddingLeft);
  const padT = parseFloat(cs.paddingTop);
  const lineH = box.height - padT - parseFloat(cs.paddingBottom);
  // The baseline: the font's own ascent and descent, centred in the line box
  const baseline = padT + (lineH - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
  return {
    x: box.left - o.left + padL - m.actualBoundingBoxLeft,
    y: box.top - o.top + baseline - m.actualBoundingBoxAscent,
    w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
  };
}

/**
 * Bold type where every letter is its own layer. Point at one and it turns to an outline and
 * takes a design-tool selection: a hairline frame with a square handle on each corner. Move
 * along the word and the frame glides from letter to letter, reshaping to fit each one.
 */
export function LayerText({
  text,
  size = 120,
  weight = 800,
  tracking = -0.04,
  outline = 2,
  padding,
  handle = 8,
  color = "var(--signal, var(--color-blue-500))",
  showSize = true,
  className,
}: LayerTextProps) {
  const reduce = useReducedMotion();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef<HTMLSpanElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const chars = Array.from(text);

  const frameFor = (i: number): Rect | null => {
    const el = letters.current[i];
    const origin = root.current;
    if (!el || !origin) return null;
    const r = ink(el, chars[i], origin);
    const pad = padding ?? parseFloat(getComputedStyle(el).fontSize) * 0.1;
    return { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
  };

  const select = (i: number | null) => {
    setActive(i);
    setRect(i === null ? null : frameFor(i));
  };

  // Keep the frame on its letter when the type reflows: a resize, or new values.
  useEffect(() => {
    const el = root.current;
    if (!el || active === null) return;
    const ro = new ResizeObserver(() => setRect(frameFor(active)));
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, size, weight, tracking, padding, text]);

  const style: CSSProperties = {
    fontSize: typeof size === "number" ? `${size}px` : size,
    fontWeight: weight,
    letterSpacing: `${tracking}em`,
  };
  const glide = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 42, mass: 0.8 };

  return (
    <span
      ref={root}
      aria-label={text}
      role="img"
      onPointerLeave={() => select(null)}
      style={style}
      className={cn("relative inline-flex flex-wrap justify-center leading-none select-none", className)}
    >
      {/* The outline: the letter's silhouette grown and shrunk by half the width, keeping only the ring
          between. Overlapping strokes inside a glyph merge first, so there are no inner lines. */}
      <svg aria-hidden className="absolute size-0">
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={outline / 2} result="out" />
          <feMorphology in="SourceAlpha" operator="erode" radius={outline / 2} result="in" />
          <feComposite in="out" in2="in" operator="out" result="ring" />
          <feFlood style={{ floodColor: color }} />
          <feComposite in2="ring" operator="in" />
        </filter>
      </svg>

      {chars.map((ch, i) => {
        if (ch === " ") return <span key={i} aria-hidden className="w-[0.28em]" />;
        const on = active === i;
        return (
          <span
            key={i}
            ref={(el) => void (letters.current[i] = el)}
            aria-hidden
            onPointerEnter={() => select(i)}
            onPointerDown={() => select(i)}
            className="relative inline-block py-[0.12em]"
          >
            <span className={cn("transition-opacity duration-150", on && "opacity-0")}>{ch}</span>
            <span
              aria-hidden
              className={cn("absolute inset-0 py-[0.12em] transition-opacity duration-150", on ? "opacity-100" : "opacity-0")}
              style={{ filter: `url(#${id})` }}
            >
              {ch}
            </span>
          </span>
        );
      })}

      {/* One frame for the whole word: it glides and reshapes from letter to letter */}
      <AnimatePresence>
        {rect && (
          <motion.span
            key="frame"
            aria-hidden
            initial={{ opacity: 0, x: rect.x - 8, y: rect.y - 8, width: rect.w + 16, height: rect.h + 16 }}
            animate={{ opacity: 1, x: rect.x, y: rect.y, width: rect.w, height: rect.h }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ ...glide, opacity: { duration: 0.12 } }}
            className="pointer-events-none absolute top-0 left-0"
            style={{ boxShadow: `inset 0 0 0 1px ${color}` }}
          >
            {CORNERS.map((at, k) => (
              <motion.span
                key={at}
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 900, damping: 26, delay: reduce ? 0 : 0.04 + k * 0.025 }}
                className={cn("absolute bg-white", at)}
                style={{ width: handle, height: handle, boxShadow: `inset 0 0 0 1px ${color}` }}
              />
            ))}
            {showSize && (
              <span
                className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2 rounded-[3px] px-1 py-px font-mono text-[11px] leading-4 font-normal tracking-normal whitespace-nowrap text-white tabular-nums"
                style={{ background: color }}
              >
                {Math.round(rect.w)} × {Math.round(rect.h)}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function Demo() {
  return (
    <div className="@container w-full py-8 text-center">
      <LayerText text="ABHISHEK" size="clamp(3rem, 15cqw, 8.5rem)" className="text-neutral-900 dark:text-white" />
      <p className="mt-10 text-sm text-neutral-500">Point at a letter, then move along the word.</p>
    </div>
  );
}
