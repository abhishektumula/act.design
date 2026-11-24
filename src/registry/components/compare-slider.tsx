"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CompareSliderProps = {
  /** Shown on the left of the divider. Anything: an image, a screenshot, a component. */
  before: ReactNode;
  /** Shown on the right of the divider. */
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Where the divider starts, 0 to 100. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  "aria-label"?: string;
};

/**
 * Two views of one thing, split by a divider you drag. The divider bends with the speed
 * you move it and springs straight when you stop, and the edge of the top view bends with it.
 * The views smear sideways while they move and glitch for a moment when you let go.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  defaultValue = 50,
  onValueChange,
  className,
  "aria-label": label = "Compare",
}: CompareSliderProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(defaultValue);

  /* 0 to 1 across the frame. */
  const pos = useMotionValue(defaultValue / 100);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const x = useTransform(() => pos.get() * width.get());
  /* How hard the divider is being moved, in px/s, mapped to how far it bows. Every change of
     position (drag, click, keys) feeds it; it falls back to zero a moment after movement stops. */
  const kick = useMotionValue(0);
  const bend = useSpring(kick, { stiffness: 320, damping: 16 });
  const last = useRef({ p: defaultValue / 100, t: 0 });
  const settle = useRef(0);
  useMotionValueEvent(pos, "change", (p) => {
    travelled.current += Math.abs(p - last.current.p);
    const now = performance.now();
    const dt = Math.max(8, now - last.current.t);
    const v = ((p - last.current.p) * width.get() * 1000) / dt;
    last.current = { p, t: now };
    if (reduce) return;
    kick.set(Math.max(-70, Math.min(70, v * 0.028)));
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => kick.set(0), 60);
  });

  /* ---- Motion blur while it moves, a glitch when you let go ----
     One SVG filter does both: horizontal bands torn sideways, a sideways-only blur, and the red
     channel pulled apart from the rest. It is only switched on while one of them is visible. */
  const fid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const content = useRef<HTMLDivElement>(null);
  const fe = useRef<{ blur?: SVGFEGaussianBlurElement | null; tear?: SVGFEDisplacementMapElement | null; noise?: SVGFETurbulenceElement | null; red?: SVGFEOffsetElement | null; rest?: SVGFEOffsetElement | null }>({});
  const fx = useRef({ blur: 0, split: 0, tear: 0 });
  const travelled = useRef(0);
  /* The odometer reading when the current press began. */
  const pressedAt = useRef(0);
  const glitch = useRef<{ stop: () => void } | null>(null);

  const paint = (seed?: number) => {
    const { blur, split, tear } = fx.current;
    const f = fe.current;
    f.blur?.setAttribute("stdDeviation", `${blur.toFixed(2)} 0`);
    f.red?.setAttribute("dx", split.toFixed(2));
    f.rest?.setAttribute("dx", (-split / 2).toFixed(2));
    f.tear?.setAttribute("scale", tear.toFixed(2));
    if (seed !== undefined) f.noise?.setAttribute("seed", String(seed));
    const on = blur > 0.05 || Math.abs(split) > 0.05 || tear > 0.05;
    if (content.current) content.current.style.filter = on ? `url(#${fid})` : "none";
  };

  useMotionValueEvent(bend, "change", (b) => {
    if (reduce || glitch.current) return;
    const k = Math.min(1, Math.abs(b) / 70);
    fx.current = { blur: k * 9, split: Math.sign(b) * k * 2.5, tear: 0 };
    paint();
  });

  const release = () => {
    if (reduce || travelled.current - pressedAt.current < 0.04) return;
    glitch.current?.stop();
    glitch.current = animate(0, 1, {
      duration: 0.38,
      ease: "linear",
      onUpdate: (t) => {
        const fade = 1 - t;
        // Flicker: some frames tear hard, some barely
        const hard = Math.random() > 0.35;
        fx.current = {
          blur: fx.current.blur * 0.7,
          split: (Math.random() > 0.5 ? 1 : -1) * 7 * fade * (hard ? 1 : 0.3),
          tear: 34 * fade * (hard ? 1 : 0.15),
        };
        paint(Math.floor(Math.random() * 1000));
      },
      onComplete: () => {
        glitch.current = null;
        fx.current = { blur: 0, split: 0, tear: 0 };
        paint();
      },
    });
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      width.set(el.clientWidth);
      height.set(el.clientHeight);
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const clip = useTransform(() => {
    const [x0, b, h] = [x.get(), bend.get(), height.get()];
    return `path("M0 0 L${x0} 0 Q${x0 + b} ${h / 2} ${x0} ${h} L0 ${h} Z")`;
  });
  const line = useTransform(() => {
    const [x0, b, h] = [x.get(), bend.get(), height.get()];
    return `M${x0} 0 Q${x0 + b} ${h / 2} ${x0} ${h}`;
  });
  /* The handle rides the curve's midpoint. */
  const handleX = useTransform(() => x.get() + bend.get() / 2);

  const commit = (p: number) => {
    const v = Math.round(Math.min(1, Math.max(0, p)) * 1000) / 10;
    setValue(v);
    onValueChange?.(v);
  };

  const fromPointer = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    pressedAt.current = travelled.current;
    const p = Math.min(1, Math.max(0, fromPointer(e)));
    // A click away from the divider glides there; then it follows the pointer exactly.
    animate(pos, p, reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 });
    commit(p);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const p = Math.min(1, Math.max(0, fromPointer(e)));
    pos.set(p);
    commit(p);
  };
  const up = () => {
    if (!dragging) return;
    setDragging(false);
    release();
  };

  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const to: Record<string, number> = { ArrowLeft: pos.get() - step, ArrowRight: pos.get() + step, Home: 0, End: 1 };
    if (!(e.key in to)) return;
    e.preventDefault();
    const p = Math.min(1, Math.max(0, to[e.key]));
    animate(pos, p, reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 });
    commit(p);
  };

  return (
    <div
      ref={ref}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cn(
        "relative isolate aspect-[16/10] w-full touch-none overflow-hidden rounded-2xl bg-neutral-900 select-none ring-1 ring-black/10 dark:ring-white/10",
        dragging ? "cursor-grabbing" : "cursor-ew-resize",
        className,
      )}
    >
      <svg aria-hidden className="absolute size-0">
        <filter id={fid} x="-4%" y="0" width="108%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={(n) => void (fe.current.noise = n)} type="fractalNoise" baseFrequency="0.0001 0.05" numOctaves={1} seed={1} result="noise" />
          {/* Hard-edged bands; blue held at the middle so nothing moves vertically */}
          <feComponentTransfer in="noise" result="bands">
            <feFuncR type="discrete" tableValues="0 0.5 1 0.5 0.2 0.8 0.5" />
            <feFuncB type="discrete" tableValues="0.5" />
          </feComponentTransfer>
          <feDisplacementMap ref={(n) => void (fe.current.tear = n)} in="SourceGraphic" in2="bands" scale={0} xChannelSelector="R" yChannelSelector="B" result="torn" />
          <feGaussianBlur ref={(n) => void (fe.current.blur = n)} in="torn" stdDeviation="0 0" result="smear" />
          <feColorMatrix in="smear" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset ref={(n) => void (fe.current.red = n)} in="r" dx={0} result="rShift" />
          <feColorMatrix in="smear" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feOffset ref={(n) => void (fe.current.rest = n)} in="gb" dx={0} result="gbShift" />
          <feBlend in="rShift" in2="gbShift" mode="screen" />
        </filter>
      </svg>

      <div ref={content} className="absolute inset-0">
        <div className="absolute inset-0">{after}</div>
        <motion.div className="absolute inset-0" style={{ clipPath: size.w ? clip : `inset(0 ${100 - defaultValue}% 0 0)` }}>
          {before}
        </motion.div>
      </div>

      <Label side="left" text={beforeLabel} hidden={value < 14} />
      <Label side="right" text={afterLabel} hidden={value > 86} />

      {size.w > 0 && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <motion.path d={line} fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={6} />
          <motion.path d={line} fill="none" stroke="white" strokeWidth={2} />
        </svg>
      )}

      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${Math.round(value)}% ${beforeLabel}`}
        onKeyDown={key}
        style={{ x: handleX }}
        animate={{ scale: dragging ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="absolute top-1/2 left-0 grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-white text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0/0.3)] ring-1 ring-black/5 outline-none focus-visible:ring-4 focus-visible:ring-blue-500/60"
      >
        <span className="flex -space-x-1">
          <ChevronLeft className="size-4" />
          <ChevronRight className="size-4" />
        </span>
      </motion.div>
    </div>
  );
}

function Label({ side, text, hidden }: { side: "left" | "right"; text: string; hidden: boolean }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 rounded-md bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur transition-opacity duration-200",
        side === "left" ? "left-3" : "right-3",
        hidden && "opacity-0",
      )}
    >
      {text}
    </span>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const PHOTO = "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";

export default function Demo() {
  const photo = "absolute inset-0 size-full object-cover";
  return (
    <div className="w-full max-w-xl">
      <CompareSlider
        className="aspect-[4/3]"
        /* eslint-disable-next-line @next/next/no-img-element */
        before={<img src={PHOTO} alt="" draggable={false} className={`${photo} grayscale`} />}
        /* eslint-disable-next-line @next/next/no-img-element */
        after={<img src={PHOTO} alt="" draggable={false} className={photo} />}
        beforeLabel="Black and white"
        afterLabel="Colour"
        aria-label="A city skyline at dusk, in black and white and in colour"
      />
    </div>
  );
}
