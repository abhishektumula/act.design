"use client";

import { useRef, useState, type CSSProperties } from "react";
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
  /** Side of the corner handles, in px. */
  handle?: number;
  /** The selection colour: outline, frame and handles. Any CSS colour. */
  color?: string;
  /** Show the hovered letter's size under its frame, as a design tool does. */
  showSize?: boolean;
  className?: string;
};

const CORNERS = ["top-0 left-0 -translate-x-1/2 -translate-y-1/2", "top-0 right-0 translate-x-1/2 -translate-y-1/2", "right-0 bottom-0 translate-x-1/2 translate-y-1/2", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2"];

/**
 * Bold type where every letter is its own layer. Point at one and it turns to an outline
 * and takes a design-tool selection: a hairline frame that snaps onto it and a square
 * handle on each corner.
 */
export function LayerText({
  text,
  size = 120,
  weight = 800,
  tracking = -0.04,
  outline = 2,
  handle = 8,
  color = "var(--signal, var(--color-blue-500))",
  showSize = true,
  className,
}: LayerTextProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = Array.from(text);

  const select = (i: number | null) => {
    setActive(i);
    const el = i === null ? null : letters.current[i];
    setBox(el ? { w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) } : null);
  };

  const style: CSSProperties = {
    fontSize: typeof size === "number" ? `${size}px` : size,
    fontWeight: weight,
    letterSpacing: `${tracking}em`,
  };

  return (
    <span
      aria-label={text}
      role="img"
      onPointerLeave={() => select(null)}
      style={style}
      className={cn("inline-flex flex-wrap justify-center leading-none select-none", className)}
    >
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
            className="relative inline-block px-[0.02em] py-[0.06em] transition-[color,-webkit-text-stroke-color] duration-150"
            style={{
              color: on ? "transparent" : undefined,
              WebkitTextStroke: on ? `${outline}px ${color}` : `${outline}px transparent`,
            }}
          >
            {ch}
            <AnimatePresence>
              {on && (
                <motion.span
                  key="frame"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.14 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ type: "spring", stiffness: 700, damping: 34 }}
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: `inset 0 0 0 1px ${color}` }}
                >
                  {CORNERS.map((at, k) => (
                    <motion.span
                      key={at}
                      initial={reduce ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 900, damping: 26, delay: reduce ? 0 : 0.03 + k * 0.025 }}
                      className={cn("absolute bg-white", at)}
                      style={{ width: handle, height: handle, boxShadow: `inset 0 0 0 1px ${color}` }}
                    />
                  ))}
                  {showSize && box && (
                    <motion.span
                      initial={reduce ? false : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : 0.08, duration: 0.18 }}
                      className="absolute top-full left-1/2 mt-[calc(0.5rem+4px)] -translate-x-1/2 rounded-[3px] px-1 py-px font-mono text-[11px] leading-4 font-normal tracking-normal whitespace-nowrap text-white tabular-nums"
                      // The letter's outline is inherited; the label must not wear it.
                      style={{ background: color, WebkitTextStroke: "0" }}
                    >
                      {box.w} × {box.h}
                    </motion.span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

export default function Demo() {
  return (
    <div className="@container w-full py-8 text-center">
      <LayerText text="ABHISHEK" size="clamp(3rem, 15cqw, 8.5rem)" className="text-neutral-900 dark:text-white" />
      <p className="mt-10 text-sm text-neutral-500">Point at a letter.</p>
    </div>
  );
}
