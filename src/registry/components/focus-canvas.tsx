"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type FocusCanvasProps<T> = {
  /** What fills the canvas. It repeats forever in every direction. */
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  /** Camera scale when one card is in focus. */
  focusScale?: number;
  /** Camera scale at the widest point of a move. */
  overviewScale?: number;
  /** How long it rests on each card, in ms. */
  hold?: number;
  /** How long a move takes, in ms. */
  travel?: number;
  /** How soft the rest of the canvas goes around the card in focus, in px. */
  blur?: number;
  /** Called with the item now in focus. */
  onFocus?: (item: T, index: number) => void;
  className?: string;
};

type Cell = { c: number; r: number };

const mod = (n: number, m: number) => ((n % m) + m) % m;
const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A camera that tours an endless canvas on its own. It rests on one card, sharp and centred while
 * everything around it goes soft, then pulls back, crosses the canvas and closes in on the next.
 * The blur and the sharpening follow the zoom, so they always happen together.
 */
export function FocusCanvas<T>({
  items,
  renderItem,
  itemWidth = 320,
  itemHeight = 240,
  gap = 24,
  focusScale = 1.1,
  overviewScale = 0.7,
  hold = 2800,
  travel = 2600,
  blur = 7,
  onFocus,
  className,
}: FocusCanvasProps<T>) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const sx = itemWidth + gap;
  const sy = itemHeight + gap;
  const n = items.length;
  const skip = Math.floor(n / 2) + 1;
  const indexAt = (c: number, r: number) => mod(c + r * skip, Math.max(1, n));
  /** Bricks: odd rows sit half a card along. */
  const centre = (c: number, r: number) => ({ x: c * sx + (mod(r, 2) ? sx / 2 : 0) + itemWidth / 2, y: r * sy + itemHeight / 2 });

  const [focus, setFocus] = useState<Cell>({ c: 0, r: 0 });
  const [win, setWin] = useState({ c0: -4, c1: 4, r0: -2, r1: 2 });

  const camX = useMotionValue(centre(0, 0).x);
  const camY = useMotionValue(centre(0, 0).y);
  const zoom = useMotionValue(reduce ? overviewScale : focusScale);
  const frameW = useMotionValue(0);
  const frameH = useMotionValue(0);
  const x = useTransform(() => frameW.get() / 2 - camX.get() * zoom.get());
  const y = useTransform(() => frameH.get() / 2 - camY.get() * zoom.get());
  const soft = useTransform(zoom, [overviewScale + 0.08, focusScale], ["blur(0px) brightness(1)", `blur(${blur}px) brightness(0.5)`]);
  const sharp = useTransform(zoom, [overviewScale + 0.08, focusScale], [0, 1]);

  /* Props the tour reads without restarting. */
  const latest = useRef({ onFocus, items, centre, indexAt });
  useEffect(() => {
    latest.current = { onFocus, items, centre, indexAt };
  });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      frameW.set(el.clientWidth);
      frameH.set(el.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameW, frameH]);

  useEffect(() => {
    if (reduce || n === 0) return;
    const el = box.current!;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    let stopped = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      let at: Cell = { c: 0, r: 0 };
      while (!stopped) {
        await wait(hold);
        while (!visible && !stopped) await wait(250);
        if (stopped) return;
        let next: Cell;
        do {
          next = { c: at.c + Math.round((Math.random() * 2 - 1) * 2), r: at.r + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 0) };
        } while (next.c === at.c && next.r === at.r);
        setWin({ c0: Math.min(at.c, next.c) - 4, c1: Math.max(at.c, next.c) + 4, r0: Math.min(at.r, next.r) - 2, r1: Math.max(at.r, next.r) + 2 });
        const to = latest.current.centre(next.c, next.r);
        const T = travel / 1000;
        // One arc: out while it starts across, back in as it arrives. The sharp card swaps at the widest point.
        const swap = window.setTimeout(() => setFocus(next), travel / 2);
        await Promise.all([
          animate(zoom, [focusScale, overviewScale, focusScale], { duration: T, times: [0, 0.5, 1], ease: ["easeInOut", "easeInOut"] }),
          animate(camX, to.x, { duration: T, ease: EASE }),
          animate(camY, to.y, { duration: T, ease: EASE }),
        ]);
        window.clearTimeout(swap);
        setFocus(next);
        at = next;
        const i = latest.current.indexAt(next.c, next.r);
        latest.current.onFocus?.(latest.current.items[i], i);
      }
    })();
    return () => {
      stopped = true;
      io.disconnect();
    };
  }, [reduce, n, hold, travel, focusScale, overviewScale, camX, camY, zoom]);

  if (n === 0) return null;
  const cells: Cell[] = [];
  for (let r = win.r0; r <= win.r1; r++) for (let c = win.c0; c <= win.c1; c++) cells.push({ c, r });
  const fi = indexAt(focus.c, focus.r);
  const fp = centre(focus.c, focus.r);

  return (
    <div
      ref={box}
      className={cn(
        "relative isolate h-[32rem] w-full overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent),linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]",
        className,
      )}
    >
      <motion.div className="absolute top-0 left-0 origin-top-left will-change-transform" style={{ x, y, scale: zoom, filter: reduce ? undefined : soft }}>
        {cells.map(({ c, r }) => {
          const p = centre(c, r);
          const i = indexAt(c, r);
          return (
            <div key={`${c}:${r}`} className="absolute" style={{ left: p.x - itemWidth / 2, top: p.y - itemHeight / 2, width: itemWidth, height: itemHeight }}>
              {renderItem(items[i], i)}
            </div>
          );
        })}
      </motion.div>

      {/* The card in focus, sharp, in a second layer that moves exactly with the canvas */}
      {!reduce && (
        <motion.div className="pointer-events-none absolute top-0 left-0 z-10 origin-top-left will-change-transform" style={{ x, y, scale: zoom }}>
          <motion.div className="absolute" style={{ left: fp.x - itemWidth / 2, top: fp.y - itemHeight / 2, width: itemWidth, height: itemHeight, opacity: sharp }}>
            {renderItem(items[fi], fi)}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A city skyline at dusk" },
  { src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "Palms around a lagoon at sunset" },
  { src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A breakwater in a stormy sea" },
];

export default function Demo() {
  return (
    <FocusCanvas
      items={PHOTOS}
      itemWidth={260}
      itemHeight={320}
      className="h-[30rem] rounded-2xl bg-neutral-950"
      renderItem={(p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} draggable={false} className="size-full rounded-2xl object-cover shadow-[0_24px_48px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10" />
      )}
    />
  );
}
