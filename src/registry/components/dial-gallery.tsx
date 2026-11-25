"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export type DialGalleryItem = {
  /** The name on the dial. One or two words read best. */
  label: string;
  src: string;
  alt?: string;
  /** A small line over the image, like a place or a date. */
  caption?: string;
};

export type DialGalleryReveal = "iris" | "wipe" | "fade";

export type DialGalleryProps = {
  items: DialGalleryItem[];
  /** The selected index, when you control it. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /** Which side the image sits on. The dial always points its chosen name at it. */
  side?: "left" | "right";
  /** Radius of the curve the names sit on, in px. Larger is flatter. Fitted to the space when left out. */
  radius?: number;
  /** Distance between two names, in multiples of the text size. */
  spacing?: number;
  /** How a new image arrives: an iris opening from the dial, a wipe in the direction you turn, or a soft fade. */
  reveal?: DialGalleryReveal;
  /** Wrap the chosen name in [ brackets ]. */
  brackets?: boolean;
  /** How quickly names blur as they turn away from the pointer. 0 keeps them all sharp. */
  depth?: number;
  /** Bracket colour. Any CSS colour. */
  accent?: string;
  className?: string;
  "aria-label"?: string;
};

const INSET = 8;
const EASE = [0.22, 1, 0.36, 1] as const;

const wrap = (v: number, n: number) => ((v % n) + n) % n;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** How many items `i` sits from the dial position `p`, the short way round. */
const offsetOf = (i: number, p: number, n: number) => wrap(i - p + n / 2, n) - n / 2;

/**
 * Fits the names beside the image. They sit on a wide, invisible circle whose centre lies
 * off to the far side, so the column curves gently away above and below the chosen name.
 */
function fit(w: number, h: number, side: "left" | "right", perPx: number, spacing: number, radius?: number) {
  const panelW = Math.round(w * (w < 560 ? 0.4 : 0.44));
  const areaW = w - panelW - INSET * 3;
  const pad = w < 560 ? 20 : 32;
  const font = clamp(Math.min(h * 0.065, perPx ? (areaW - pad * 2) / perPx : 99), 14, 36);
  const R = radius ?? Math.max(h * 0.8, 200);
  // The names start at the circle, `pad` in from the edge, and read toward the image.
  const cx = side === "right" ? INSET + pad - R : w - INSET - pad + R;
  const step = ((font * spacing) / R) * (180 / Math.PI);
  return { panelW, R, cx, cy: h / 2, font, step };
}

type Edge = { dir: number; edge: string };
const reveals = {
  iris: {
    enter: ({ edge }: Edge) => ({ clipPath: `circle(0% at ${edge} 50%)`, scale: 1.22, filter: "blur(14px) brightness(1.25)" }),
    show: ({ edge }: Edge) => ({ clipPath: `circle(145% at ${edge} 50%)`, scale: 1, filter: "blur(0px) brightness(1)" }),
  },
  wipe: {
    enter: ({ dir }: Edge) => ({ clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: 1.18, filter: "blur(8px) brightness(1.15)" }),
    show: () => ({ clipPath: "inset(0% 0% 0% 0%)", scale: 1, filter: "blur(0px) brightness(1)" }),
  },
  fade: {
    enter: () => ({ opacity: 0, scale: 1.06, filter: "blur(10px) brightness(1)" }),
    show: () => ({ opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }),
  },
};

/**
 * A wheel of names beside an image, with no dial drawn: just the names, set on a gentle curve.
 * Turn it by scrolling, dragging, the arrow keys, or click a name to bring it round. Names
 * away from the chosen one fade and blur, like a drum seen edge on. Each change pops the frame and the new picture opens
 * over the old one, from the dial's side.
 */
export function DialGallery({
  items,
  value,
  defaultValue = 0,
  onValueChange,
  side = "right",
  radius,
  spacing = 2,
  reveal = "iris",
  brackets = true,
  depth = 1,
  accent = "var(--color-blue-500)",
  className,
  "aria-label": ariaLabel = "Gallery",
}: DialGalleryProps) {
  const n = items.length;
  const id = useId();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<ReturnType<typeof fit> | null>(null);

  /* The angle the chosen name points along, toward the image, and which way "next" turns. */
  const home = side === "right" ? 0 : 180;
  const sense = side === "right" ? 1 : -1;

  const start = clamp(value ?? defaultValue, 0, Math.max(0, n - 1));
  /* `pos` is where the dial is headed, in items; `turn` follows it on a spring so it has weight. */
  const pos = useMotionValue(start);
  const turn = useSpring(pos, reduce ? { stiffness: 900, damping: 60 } : { stiffness: 230, damping: 28, mass: 0.9 });
  const [shown, setShown] = useState({ index: start, seq: 0, dir: 1 });
  const raw = useRef(start);
  const latest = useRef({ value, onValueChange, n });
  useEffect(() => {
    latest.current = { value, onValueChange, n };
  });

  /* The frame dips and springs back on every change: an impulse, so quick turns stack. */
  const pop = useMotionValue(1);

  useMotionValueEvent(pos, "change", (p) => {
    const r = Math.round(p);
    if (r === raw.current) return;
    const dir = Math.sign(r - raw.current);
    raw.current = r;
    const index = wrap(r, latest.current.n);
    setShown((s) => (s.index === index ? s : { index, seq: s.seq + 1, dir }));
    navigator.vibrate?.(4);
    if (!reduce) animate(pop, 1, { type: "spring", velocity: -0.6, stiffness: 420, damping: 15 });
    if (latest.current.value !== index) latest.current.onValueChange?.(index);
  });

  /* Controlled: bring the dial round to `value` the short way. */
  useEffect(() => {
    if (value === undefined || n === 0) return;
    const base = Math.round(pos.get());
    if (wrap(base, n) !== value) pos.set(base + offsetOf(value, base, n));
  }, [value, n, pos]);

  /* Images load ahead so a reveal never opens onto an empty frame. */
  useEffect(() => {
    items.forEach((it) => {
      const img = new Image();
      img.src = it.src;
    });
  }, [items]);

  /* Measure the box and the longest name, and fit the dial to them. */
  const opts = useRef({ side, radius, spacing });
  useEffect(() => {
    opts.current = { side, radius, spacing };
  });
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      // Width per px of font size, so the font can be solved for directly.
      let perPx = 0;
      el.querySelectorAll<HTMLElement>("[data-name]").forEach((l) => {
        const fs = parseFloat(getComputedStyle(l).fontSize) || 16;
        perPx = Math.max(perPx, l.offsetWidth / fs);
      });
      setGeo(fit(el.clientWidth, el.clientHeight, opts.current.side, perPx, opts.current.spacing, opts.current.radius));
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items, side, radius, spacing, brackets]);

  const go = (delta: number) => pos.set(Math.round(pos.get()) + delta);
  const pick = (i: number) => {
    const base = Math.round(pos.get());
    pos.set(base + offsetOf(i, base, n));
  };

  /* ---- Wheel: a mouse notch is one name; a trackpad turns it freely and it settles on the nearest. ---- */
  const idle = useRef(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const d = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) || e.deltaX;
      if (!d || latest.current.n < 2) return;
      e.preventDefault();
      const p = pos.get();
      const notch = Math.abs(d) >= 50 && Number.isInteger(d);
      pos.set(notch ? Math.round(p) + Math.sign(d) : p + d / 110);
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => pos.set(Math.round(pos.get())), 130);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(idle.current);
    };
  }, [pos]);

  /* ---- Drag: the names follow the angle of your pointer about the curve's centre, which
     for a wide curve is simply up and down. A press that doesn't move picks the name under it. ---- */
  const drag = useRef<{ x: number; y: number; angle: number; moved: boolean; target: number | null } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const angleAt = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - box.top - (geo?.cy ?? 0), e.clientX - box.left - (geo?.cx ?? 0)) * 180) / Math.PI;
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    drag.current = { x: e.clientX, y: e.clientY, angle: angleAt(e), moved: false, target: hit ? Number(hit.dataset.index) : null };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrabbing(true);
    }
    const a = angleAt(e);
    const delta = wrap(a - d.angle + 180, 360) - 180;
    d.angle = a;
    if (geo) pos.set(pos.get() - (sense * delta) / geo.step);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setGrabbing(false);
    if (!d) return;
    if (!d.moved) {
      if (d.target !== null) pick(d.target);
      return;
    }
    // Carry on a little with the flick, then settle on a name.
    pos.set(Math.round(pos.get() + clamp(pos.getVelocity() * 0.12, -3, 3)));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      ArrowDown: () => go(1),
      ArrowRight: () => go(1),
      ArrowUp: () => go(-1),
      ArrowLeft: () => go(-1),
      Home: () => pick(0),
      End: () => pick(n - 1),
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]();
    }
  };

  const current = items[Math.min(shown.index, n - 1)];
  const mode = reduce ? "fade" : reveal;
  const edge = side === "right" ? "0%" : "100%";
  const variants = {
    enter: reveals[mode].enter,
    show: reveals[mode].show,
    leave: { scale: 0.96, filter: "blur(0px) brightness(0.55)" },
  };

  if (!current) return null;

  return (
    <div
      ref={root}
      data-slot="dial-gallery"
      className={cn(
        "relative isolate h-[30rem] w-full overflow-hidden rounded-[28px] bg-neutral-50 shadow-[0_1px_0_white_inset,0_20px_40px_-20px_color-mix(in_oklab,var(--color-neutral-600)_60%,transparent)] ring-1 ring-neutral-950/10 select-none dark:bg-neutral-950 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_20px_40px_-20px_black] dark:ring-neutral-50/10",
        className,
      )}
    >
      {/* Dial */}
      <div
        role="listbox"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-activedescendant={`${id}-${shown.index}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "absolute inset-0 touch-none rounded-[inherit] outline-none [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)] focus-visible:ring-2 focus-visible:ring-blue-600/60 focus-visible:ring-inset dark:focus-visible:ring-blue-500/60",
          grabbing ? "cursor-grabbing" : "cursor-grab",
          !geo && "invisible",
        )}
      >
        <div className="absolute size-0" style={{ left: geo?.cx ?? 0, top: geo?.cy ?? 0, fontSize: geo?.font ?? 16 }}>
          {items.map((item, i) => (
            <Name
              key={i}
              id={`${id}-${i}`}
              index={i}
              n={n}
              turn={turn}
              step={geo?.step ?? 10}
              home={home}
              sense={sense}
              reach={geo?.R ?? 0}
              depth={reduce ? 0 : depth}
              label={item.label}
              active={i === shown.index}
              brackets={brackets}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Image */}
      <motion.div
        onClick={() => go(1)}
        style={{ width: geo?.panelW ?? "44%", scale: pop, top: INSET, bottom: INSET, [side]: INSET }}
        className="absolute z-10 cursor-pointer overflow-hidden rounded-[20px] bg-neutral-900 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55),0_2px_6px_rgb(0_0_0/0.12)] ring-1 ring-neutral-950/10 dark:ring-white/10"
      >
        <div className="absolute inset-0 isolate">
          <AnimatePresence initial={false} custom={{ dir: shown.dir, edge }}>
            <motion.img
              key={shown.seq}
              src={current.src}
              alt={current.alt ?? current.label}
              draggable={false}
              custom={{ dir: shown.dir, edge }}
              variants={variants}
              initial="enter"
              animate="show"
              exit="leave"
              transition={{ duration: reduce ? 0.3 : 0.95, ease: EASE }}
              style={{ zIndex: shown.seq }}
              className="absolute inset-0 size-full object-cover will-change-[clip-path,transform,filter]"
            />
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/55 via-black/15 to-transparent p-4 pt-16 text-white sm:p-5 sm:pt-20">
          <div className="relative min-w-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={shown.seq}
                initial={{ y: shown.dir > 0 ? "110%" : "-110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: shown.dir > 0 ? "-110%" : "110%", opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="flex flex-col gap-1"
              >
                {current.caption && <span className="truncate font-mono text-[10px] tracking-[0.14em] text-white/65 uppercase">{current.caption}</span>}
                <span className="truncate text-xl font-medium tracking-tight">{current.label}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-white/65 tabular-nums">
            {String(shown.index + 1).padStart(2, "0")}
            <span className="text-white/35"> / {String(n).padStart(2, "0")}</span>
          </span>
        </div>
      </motion.div>

      <span aria-live="polite" className="sr-only">
        {current.label}
      </span>
    </div>
  );
}

/**
 * One name on its spoke. It starts on the curve and reads outward; with the image on the left
 * it turns over so it still reads left to right. The further it is from the chosen name, the
 * fainter and softer it gets.
 */
function Name({
  id,
  index,
  n,
  turn,
  step,
  home,
  sense,
  reach,
  depth,
  label,
  active,
  brackets,
  accent,
}: {
  id: string;
  index: number;
  n: number;
  turn: MotionValue<number>;
  step: number;
  home: number;
  sense: number;
  reach: number;
  depth: number;
  label: string;
  active: boolean;
  brackets: boolean;
  accent: string;
}) {
  const away = useTransform(turn, (p) => offsetOf(index, p, n));
  const angle = useTransform(away, (d) => home + sense * d * step);
  const flip = useTransform(angle, (a) => (Math.cos((a * Math.PI) / 180) < 0 ? 180 : 0));
  // The chosen name, three a side clearly, a fourth just showing, then nothing.
  const opacity = useTransform(away, (d) => {
    const x = Math.abs(d);
    return x < 1 ? 1 - x * 0.5 : Math.max(0, 0.5 - (x - 1) * 0.12 - Math.max(0, x - 4) * 0.4);
  });
  const hidden = useTransform(opacity, (o) => (o <= 0 ? "hidden" : "visible"));
  const filter = useTransform(away, (d) => {
    const x = Math.abs(d);
    const b = depth * (x < 1 ? x * 0.4 : 0.4 + (x - 1) * 1.1);
    return `blur(${Math.min(6, b).toFixed(2)}px)`;
  });

  return (
    <motion.div style={{ rotate: angle, visibility: hidden }} className="absolute top-0 left-0 size-0">
      {/* The name starts on the curve and reads outward, toward the image. */}
      <div className="absolute top-0" style={{ left: reach }}>
        <motion.div
          id={id}
          role="option"
          aria-selected={active}
          data-index={index}
          data-name=""
          style={{ rotate: flip, opacity, filter }}
          className="flex -translate-y-1/2 items-center gap-[0.35em] leading-none whitespace-nowrap"
        >
          {brackets && <Bracket side="[" active={active} accent={accent} />}
          <motion.span
            initial={false}
            animate={{ scale: active ? 1 : 0.92 }}
            transition={{ type: "spring", stiffness: 460, damping: 16 }}
            className={cn(
              "font-medium tracking-[-0.02em] transition-colors duration-300",
              active ? "text-neutral-950 dark:text-white" : "text-neutral-500 dark:text-neutral-400",
            )}
          >
            {label}
          </motion.span>
          {brackets && <Bracket side="]" active={active} accent={accent} />}
        </motion.div>
      </div>
    </motion.div>
  );
}

/** The brackets only show on the chosen name: they slide in from either side and take the accent. */
function Bracket({ side, active, accent }: { side: "[" | "]"; active: boolean; accent: string }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ opacity: active ? 1 : 0, x: active ? 0 : side === "[" ? 5 : -5 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      style={{ color: accent }}
      className="font-mono text-[0.72em] leading-none"
    >
      {side}
    </motion.span>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const PHOTOS: DialGalleryItem[] = [
  { label: "Moonrise", caption: "Open water", src: "https://images.unsplash.com/photo-1792802992164-c43f3b404891?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A rocky shore under a pale evening sky with the moon overhead" },
  { label: "Spire", caption: "Manhattan", src: "https://images.unsplash.com/photo-1795337259685-2865d38f0e44?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A lit skyscraper spire against an orange dusk" },
  { label: "Haze", caption: "Bangkok", src: "https://images.unsplash.com/photo-1795412288110-4669a977d984?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "High-rises fading into a warm afternoon haze" },
  { label: "Waterfall", caption: "Columbia Gorge", src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=987&auto=format&fit=crop", alt: "A tall waterfall falling through a mossy gorge under a stone bridge" },
  { label: "Summit", caption: "Swiss Alps", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop", alt: "Snowy peaks over a sea of cloud at sunset" },
  { label: "Angles", caption: "Cleveland", src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1200&auto=format&fit=crop", alt: "A white building of sharp angles and glass" },
  { label: "Highlands", caption: "Isle of Skye", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop", alt: "Green highland ridges in low cloud as the sun rises" },
  { label: "Towers", caption: "City centre", src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop", alt: "Glass towers seen from below under a grey sky" },
];

export default function Demo() {
  // Height follows the width it is given, so it fills a small tile at full size and stands tall on a wide page.
  return <DialGallery items={PHOTOS} defaultValue={1} className="h-[clamp(17rem,calc(75cqw-10rem),30rem)] max-w-3xl" />;
}
