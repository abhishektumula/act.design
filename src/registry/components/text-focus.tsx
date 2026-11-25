"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type TextFocusProps = {
  text: string;
  /** The element to render, such as "h1", "h2" or "p". */
  as?: ElementType;
  /** How soft the unfocused words are, in em, so it scales with the type. */
  blur?: number;
  /** How faint the unfocused words are, 0 to 1. */
  dim?: number;
  /** `brackets` frames the word in four corner marks, like a viewfinder. `handles` draws a design-tool selection. */
  frame?: "brackets" | "handles";
  /** Words you have already read stay half clear, so you can see your way through. */
  remember?: boolean;
  /** Frame colour. Any CSS colour. */
  color?: string;
  className?: string;
};

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Text you read by pointing. Every word sits blurred until the pointer finds it: that word
 * sharpens and a frame glides over to it, reshaping to fit, so you read it a word at a time.
 * Tab in and use the arrow keys to do the same from the keyboard.
 */
export function TextFocus({
  text,
  as: Tag = "p",
  blur = 0.09,
  dim = 0.45,
  frame = "brackets",
  remember = false,
  color = "var(--color-blue-500)",
  className,
}: TextFocusProps) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const words = text.split(/\s+/).filter(Boolean);

  const rectFor = (i: number): Rect | null => {
    const el = els.current[i];
    const o = root.current;
    if (!el || !o) return null;
    const b = el.getBoundingClientRect();
    const r = o.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const px = fs * 0.14;
    const py = fs * 0.06;
    return { x: b.left - r.left - px, y: b.top - r.top - py, w: b.width + px * 2, h: b.height + py * 2 };
  };

  const focus = (i: number | null) => {
    setActive(i);
    setRect(i === null ? null : rectFor(i));
    if (i !== null && remember) setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };

  // Follow the word when the text reflows.
  useEffect(() => {
    const el = root.current;
    if (!el || active === null) return;
    const ro = new ResizeObserver(() => setRect(rectFor(active)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, text]);

  // New text starts unread.
  const [shownText, setShownText] = useState(text);
  if (shownText !== text) {
    setShownText(text);
    setSeen(new Set());
    setActive(null);
    setRect(null);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const last = words.length - 1;
    const at = active ?? -1;
    const next: Record<string, number | null> = {
      ArrowRight: Math.min(last, at + 1),
      ArrowDown: Math.min(last, at + 1),
      ArrowLeft: Math.max(0, at - 1),
      ArrowUp: Math.max(0, at - 1),
      Home: 0,
      End: last,
      Escape: null,
    };
    if (e.key in next) {
      e.preventDefault();
      focus(next[e.key]);
    }
  };

  const glide = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 460, damping: 38, mass: 0.7 };

  return (
    <Tag
      ref={root}
      tabIndex={0}
      onPointerLeave={(e: PointerEvent) => e.pointerType === "mouse" && focus(null)}
      onKeyDown={onKeyDown}
      onBlur={() => focus(null)}
      className={cn("relative outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-8 focus-visible:ring-offset-transparent dark:focus-visible:ring-blue-500/50", className)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => {
          const on = active === i;
          const half = !on && seen.has(i);
          return (
            <span key={i}>
              <span
                ref={(el) => void (els.current[i] = el)}
                onPointerEnter={() => focus(i)}
                onPointerDown={() => focus(i)}
                style={{
                  filter: `blur(${on ? 0 : half ? blur * 0.4 : blur}em)`,
                  opacity: on ? 1 : half ? (1 + dim) / 2 : dim,
                }}
                className={cn("inline-block cursor-default transition-[filter,opacity]", reduce ? "duration-0" : on ? "duration-200 ease-out" : "duration-500 ease-out")}
              >
                {word}
              </span>
              {i < words.length - 1 && " "}
            </span>
          );
        })}
      </span>

      {/* One frame for the whole text: it glides and reshapes from word to word. */}
      <AnimatePresence>
        {rect && (
          <motion.span
            key="frame"
            aria-hidden
            initial={{ opacity: 0, x: rect.x - 10, y: rect.y - 10, width: rect.w + 20, height: rect.h + 20 }}
            animate={{ opacity: 1, x: rect.x, y: rect.y, width: rect.w, height: rect.h }}
            exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.18 } }}
            transition={{ ...glide, opacity: { duration: 0.15 } }}
            className="pointer-events-none absolute top-0 left-0"
            style={frame === "handles" ? { boxShadow: `inset 0 0 0 1px ${color}` } : undefined}
          >
            {frame === "brackets" ? <Brackets color={color} /> : <Handles color={color} reduce={!!reduce} />}
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  );
}

/** Four corner marks, like a camera finding focus. They scale with the type. */
function Brackets({ color }: { color: string }) {
  const w = "1.5px";
  const corners: CSSProperties[] = [
    { top: 0, left: 0, borderTopWidth: w, borderLeftWidth: w, borderTopLeftRadius: 3 },
    { top: 0, right: 0, borderTopWidth: w, borderRightWidth: w, borderTopRightRadius: 3 },
    { bottom: 0, right: 0, borderBottomWidth: w, borderRightWidth: w, borderBottomRightRadius: 3 },
    { bottom: 0, left: 0, borderBottomWidth: w, borderLeftWidth: w, borderBottomLeftRadius: 3 },
  ];
  return (
    <>
      {corners.map((c, k) => (
        <span key={k} className="absolute size-[clamp(6px,0.22em,14px)] border-0 border-solid" style={{ ...c, borderColor: color }} />
      ))}
    </>
  );
}

/** A hairline selection with a square handle on each corner, as a design tool draws it. */
function Handles({ color, reduce }: { color: string; reduce: boolean }) {
  const corners = ["top-0 left-0 -translate-x-1/2 -translate-y-1/2", "top-0 right-0 translate-x-1/2 -translate-y-1/2", "right-0 bottom-0 translate-x-1/2 translate-y-1/2", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2"];
  return (
    <>
      {corners.map((at, k) => (
        <motion.span
          key={at}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 900, damping: 26, delay: reduce ? 0 : 0.04 + k * 0.025 }}
          className={cn("absolute size-[7px] bg-white", at)}
          style={{ boxShadow: `inset 0 0 0 1px ${color}` }}
        />
      ))}
    </>
  );
}

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-8 py-6 text-center">
      <TextFocus as="h2" text="Text Focus Component" className="text-5xl leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-950 @md:text-6xl dark:text-neutral-50" />
      <TextFocus text="Point at each word, slowly, to read the whole line." remember className="max-w-sm text-lg leading-relaxed text-neutral-600 dark:text-neutral-400" />
    </div>
  );
}
