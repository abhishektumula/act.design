"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Preview } from "@/registry/previews";
import { getItem } from "@/registry/meta";
import { Fit } from "./fit";

/* Light, self-contained demos only: nothing fixed to the viewport, no shaders, no global shortcuts. */
const ITEMS = ["layer-text", "dial", "compare-slider", "card-stack", "fader", "trash-bin", "segmented-control", "stepper", "folder-card", "hold-to-confirm", "code-input"];

const CW = 360; // card size in world px
const CH = 300;
const GAP = 28;
const SX = CW + GAP;
const SY = CH + GAP;
const FOCUS = 1.12; // camera scale on one card
const WIDE = 0.7; // camera scale for the overview
const EASE = [0.65, 0, 0.35, 1] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const SKIP = Math.floor(ITEMS.length / 2) + 1;
const slugAt = (c: number, r: number) => ITEMS[mod(c + r * SKIP, ITEMS.length)];
/** Bricks: odd rows sit half a card along. */
const centre = (c: number, r: number) => ({ x: c * SX + (mod(r, 2) ? SX / 2 : 0) + CW / 2, y: r * SY + CH / 2 });

type Cell = { c: number; r: number };
type Window = { c0: number; c1: number; r0: number; r1: number };

/** A card: a live demo near the focus, a quiet placeholder face further out where it is only ever seen small. */
function Card({ slug, live = true }: { slug: string; live?: boolean }) {
  const item = getItem(slug)!;
  return (
    <div data-glow className="flex size-full flex-col rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-2 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08]">
      <div inert className="pointer-events-none relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white dark:bg-black p-4 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
        {live ? (
          <Fit>
            <Preview slug={slug} />
          </Fit>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3">
            <span className="h-3 w-1/3 rounded-full bg-neutral-950/10 dark:bg-neutral-50/10" />
            <span className="h-2 w-1/2 rounded-full bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
            <span className="h-2 w-2/5 rounded-full bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          </div>
        )}
      </div>
      <span className="flex items-center justify-between px-2 pt-2.5 pb-1 text-sm">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</span>
        <span className="text-neutral-500">{item.category}</span>
      </span>
    </div>
  );
}

/** Covers both ends of a move, with room for the overview to fill the frame. */
const span = (a: Cell, b: Cell): Window => ({
  c0: Math.min(a.c, b.c) - 4,
  c1: Math.max(a.c, b.c) + 4,
  r0: Math.min(a.r, b.r) - 2,
  r1: Math.max(a.r, b.r) + 2,
});

function Field() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<Cell>({ c: 0, r: 0 });
  const [win, setWin] = useState<Window>(span({ c: 0, r: 0 }, { c: 0, r: 0 }));
  const [target, setTarget] = useState<Cell>({ c: 0, r: 0 });

  /* The camera: the world point at the centre of the frame, and the zoom. */
  const camX = useMotionValue(centre(0, 0).x);
  const camY = useMotionValue(centre(0, 0).y);
  const zoom = useMotionValue(reduce ? WIDE : FOCUS);
  const frameW = useMotionValue(0);
  const frameH = useMotionValue(0);
  const x = useTransform(() => frameW.get() / 2 - camX.get() * zoom.get());
  const y = useTransform(() => frameH.get() / 2 - camY.get() * zoom.get());
  /* Both follow the zoom, so they happen together: as the camera closes in, the field goes soft
     and dim while the card in focus comes up sharp; as it pulls back, the reverse. */
  const blur = useTransform(zoom, [WIDE + 0.08, FOCUS], ["blur(0px) brightness(1)", "blur(7px) brightness(0.5)"]);
  const sharpness = useTransform(zoom, [WIDE + 0.08, FOCUS], [0, 1]);
  const clickable = useTransform(sharpness, (v) => (v > 0.7 ? "auto" : "none"));

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
    if (reduce) return;
    const el = box.current!;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    let stopped = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const until = async () => {
      while (!visible && !stopped) await wait(250);
    };

    (async () => {
      let at: Cell = { c: 0, r: 0 };
      while (!stopped) {
        await wait(2800);
        await until();
        if (stopped) return;
        // Pick the next card: one or two steps away, any direction
        let next: Cell;
        do {
          next = { c: at.c + Math.round((Math.random() * 2 - 1) * 2), r: at.r + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 0) };
        } while (next.c === at.c && next.r === at.r);
        setWin(span(at, next));
        setTarget(next);
        const to = centre(next.c, next.r);
        // One continuous move: the camera eases out while it starts across, and eases back in as it
        // arrives, so the path is a single arc. The sharp card swaps at the widest point, unseen.
        const T = 2.6;
        const swap = window.setTimeout(() => setFocus(next), T * 500);
        await Promise.all([
          animate(zoom, [FOCUS, WIDE, FOCUS], { duration: T, times: [0, 0.5, 1], ease: ["easeInOut", "easeInOut"] }),
          animate(camX, to.x, { duration: T, ease: EASE }),
          animate(camY, to.y, { duration: T, ease: EASE }),
        ]);
        window.clearTimeout(swap);
        setFocus(next);
        at = next;
      }
    })();
    return () => {
      stopped = true;
      io.disconnect();
    };
  }, [reduce, camX, camY, zoom]);

  const cells: Cell[] = [];
  for (let r = win.r0; r <= win.r1; r++) for (let c = win.c0; c <= win.c1; c++) cells.push({ c, r });
  const focusSlug = slugAt(focus.c, focus.r);
  const focusAt = centre(focus.c, focus.r);
  // Live demos only where the camera can see them up close: around where it is and where it is going
  const near = (c: number, r: number) =>
    [focus, target].some((f) => Math.abs(c - f.c) <= 2 && Math.abs(r - f.r) <= 1);

  return (
    <div
      ref={box}
      className="absolute inset-0 overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent),linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]"
    >
      <motion.div className="absolute top-0 left-0 origin-top-left will-change-transform" style={{ x, y, scale: zoom, filter: reduce ? undefined : blur }}>
        {cells.map(({ c, r }) => {
          const p = centre(c, r);
          return (
            <div key={`${c}:${r}`} className="absolute" style={{ left: p.x - CW / 2, top: p.y - CH / 2, width: CW, height: CH }}>
              <Card slug={slugAt(c, r)} live={near(c, r)} />
            </div>
          );
        })}
      </motion.div>

      {/* The card in focus, sharp, in a second layer that moves exactly with the field */}
      {!reduce && (
        <motion.div className="pointer-events-none absolute top-0 left-0 z-10 origin-top-left will-change-transform" style={{ x, y, scale: zoom }}>
          <motion.div
            className="absolute"
            style={{ left: focusAt.x - CW / 2, top: focusAt.y - CH / 2, width: CW, height: CH, opacity: sharpness, pointerEvents: clickable }}
          >
            <Link
              href={`/components/${focusSlug}`}
              aria-label={`Open ${getItem(focusSlug)?.name}`}
              className="block size-full rounded-2xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-blue-600/40 dark:ring-blue-500/40 transition-shadow hover:ring-blue-600 dark:hover:ring-blue-500"
            >
              <Card key={`${focus.c}:${focus.r}`} slug={focusSlug} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/** Mounts the tour once it nears the viewport, so its demos never load with the page. */
export function Tour() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px 0px" });
  return (
    <div ref={ref} data-glow-live className="absolute inset-0">
      {near && <Field />}
    </div>
  );
}
