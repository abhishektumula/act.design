"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bar, Button, Icon, Stage, Toggle, Window, clock, useReducedMotion, type Act, type Rect } from "./kit";
import { Crosses } from "./frame";
import { useDark } from "./use-dark";
import "./stage-look.css";
import "./principles.css";

/*
 * The principles, as a ruled bento (Stageshow, references/bento.md; gold: ruled-bento).
 *
 *   Tile     Span   Kind        The one thing                                  Moves
 *   Detents  2 × 1  Hero UI     the speed fader, the only window               dragged to the end; ticks light, the value rolls, the end pushes back
 *   File     1 × 1  Stat        "1 file" per instrument                        still
 *   Spring   1 × 1  Diagram     a spring curve over a linear one               the curve draws in and settles past the target
 *   Quiet    2 × 1  Component   a Sound sheet whose Save button presses flat   one click: Save becomes Saved
 *   Palette  3 × 1  Collection  the neutral scale with one signal chip         the row drifts
 *
 * Two of five tiles are UI and only the hero has window chrome. No kind sits
 * next to itself across or down, and no real string repeats. Every picture is
 * its own Stage at 1:1, pinned to its cell and cropped by it; the copy is page
 * text. Each tile plays once as it scrolls in, a beat after the one before.
 */

const STEP = 110;
const LEAD = 450;

/** Measure the picture slot, not the page: a wide page can still hold a narrow tile, and copy wraps to a different height at every width. */
function useSlot(fallback: { width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fallback);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setSize({ width: Math.round(node.clientWidth), height: Math.round(node.clientHeight) });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function useTheme() {
  return useDark() ? "dark" : "light";
}

function Tile({ area, lead, children, picture }: { area: string; lead: string; children: ReactNode; picture?: ReactNode }) {
  return (
    <article className={`pr-cell pr-cell--${area}`}>
      <p className="relative z-10 max-w-[28rem] shrink-0 px-(--pad) pt-7 text-[17px] leading-6 tracking-[-0.012em] text-pretty text-base-500">
        <b className="font-semibold text-base-50">{lead}</b> {children}
      </p>
      {picture}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Detents (hero): the fader, dragged to its end                       */
/* ------------------------------------------------------------------ */

const MIN = 0.5;
const MAX = 2;
const STEPS = 30; // 0.05 a step

type Fader = { v: number; over: number; held: boolean };
const faderStart: Fader = { v: 1, over: 0, held: false };
const faderEnd: Fader = { v: 2, over: 0, held: false };

const frac = (v: number) => (v - MIN) / (MAX - MIN);

function faderAt(x: number, track: Rect): Partial<Fader> {
  const f = Math.min(1, Math.max(0, (x - track.x) / track.width));
  const v = MIN + (Math.round(f * STEPS) / STEPS) * (MAX - MIN);
  // Past the end the knob gives a little, against a stiff spring
  const past = Math.max(0, x - (track.x + track.width));
  return { v: Math.round(v * 100) / 100, over: Math.min(10, past * 0.18) };
}

async function detents(a: Act<Fader>) {
  await a.wait(LEAD);
  await a.move("knob");
  await a.wait(120);
  const track = a.rect("track");
  const knob = a.center("knob");
  await a.drag({ x: track.x + track.width + 70, y: knob.y }, (at) => a.put({ ...faderAt(at.x, track), held: true }), { duration: 1500 });
  a.mark("release");
  await a.set({ over: 0, held: false });
  await a.wait(500);
  await a.move({ x: track.x + track.width * 0.62, y: knob.y + 74 });
}

function Detents() {
  const [ref, { width, height }] = useSlot({ width: 640, height: 290 });
  const theme = useTheme();
  return (
    <Tile
      area="hero"
      lead="Values click into place."
      picture={
        <div ref={ref} className="pr-picture pr-picture--hero">
          <Stage<Fader>
            width={width}
            height={height}
            theme={theme}
            initial={faderStart}
            poster={faderEnd}
            play="once"
            script={detents}
            cursor={{ at: { x: width - 48, y: height - 28 } }}
            className="pr-stage look-act"
          >
            {(s) => {
              const f = frac(s.v);
              return (
                <Window
                  title="Playback"
                  className="pr-window"
                  body={{ className: "pr-window__body" }}
                  toolbar={<Button variant="ghost" size="small" icon={<Icon name="more" size={16} />} aria-label="More" />}
                >
                  <div className="pr-fader">
                    <div className="pr-fader__head">
                      <span className="pr-fader__label">Speed</span>
                      {/* Steps with the detents, as a hardware readout does */}
                      <span className="pr-fader__value" data-snap>
                        {s.v.toFixed(2)}×
                      </span>
                    </div>
                    <div className="pr-fader__track" data-target="track">
                      {Array.from({ length: STEPS + 1 }, (_, i) => (
                        <span key={i} className="pr-tick" data-major={i % 10 === 0 || undefined} data-lit={i / STEPS <= f + 1e-6 || undefined} />
                      ))}
                      <span
                        className="pr-knob"
                        data-target="knob"
                        data-snap
                        data-held={s.held || undefined}
                        style={{ left: `${f * 100}%`, translate: `${s.over}px 0` }}
                      />
                    </div>
                    <div className="pr-fader__scale">
                      <span>0.5×</span>
                      <span>2×</span>
                    </div>
                  </div>
                  {/* Filler: the panel's next setting, cut by the tile */}
                  <div className="pr-fader pr-fader--filler" aria-hidden>
                    <div className="pr-fader__head">
                      <Bar w={44} tone={3} />
                      <Bar w={36} tone={2} />
                    </div>
                    <Bar w="100%" h={4} tone={2} r={2} />
                  </div>
                </Window>
              );
            }}
          </Stage>
        </div>
      }
    >
      Ticks light up detent by detent, and the end of the track pushes back instead of going quiet.
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/* File (stat)                                                         */
/* ------------------------------------------------------------------ */

function File() {
  return (
    <article className="pr-cell pr-cell--stat">
      <div className="flex h-full flex-col justify-center px-(--pad) py-8">
        <span className="text-[17px] leading-6 font-semibold tracking-[-0.012em] text-base-50">Every instrument is</span>
        <span className="mt-3 flex items-baseline gap-3 whitespace-nowrap">
          <span className="text-[144px] leading-[0.82] font-semibold tracking-[-0.06em] text-base-50 tabular-nums">1</span>
          <span className="text-[56px] leading-none font-medium tracking-[-0.03em] text-base-400">file</span>
        </span>
        <span className="mt-5 max-w-[17rem] text-[15px] leading-[21px] text-pretty text-base-500">
          Paste it in and it’s yours. No package to pin, nothing to fight.
        </span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Spring (diagram)                                                    */
/* ------------------------------------------------------------------ */

type Beat = { on: boolean };
const off: Beat = { on: false };
const on: Beat = { on: true };
const beat = (i: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD + i * STEP);
  await a.set({ on: true });
};

/** A damped spring from 0 to 1: stiffness and damping close to the site's own (260, 26). */
function spring(t: number) {
  const zeta = 0.32;
  const omega = 2 * Math.PI * 1.15;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
}

const DRAW_MS = 1700;

/** Draws the curve with a dot on its tip, on the stage's clock, once `on` turns true. */
function useDraw(on: boolean) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!on) return;
    let start = 0;
    let id = 0;
    const tick = () => {
      const now = clock.now();
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DRAW_MS);
      setP(1 - Math.pow(1 - t, 2.2));
      if (t < 1) id = clock.raf(tick);
    };
    id = clock.raf(tick);
    return () => clock.cancelRaf(id);
  }, [on]);
  return reduced ? (on ? 1 : 0) : p;
}

function SpringPlot({ on, width, height }: { on: boolean; width: number; height: number }) {
  const left = 28;
  const right = width - 28;
  const top = 28;
  const bottom = height - 40;
  const peak = 1.42;
  const y = (v: number) => bottom - (v / peak) * (bottom - top);
  const end = 2.4;
  const path = useMemo(() => {
    const n = 90;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * end;
      d += `${i ? "L" : "M"}${(left + (t / end) * (right - left)).toFixed(1)} ${y(spring(t)).toFixed(1)}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);
  const linearEnd = left + 0.55 * (right - left);
  const p = useDraw(on);
  const line = useRef<SVGPathElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const el = line.current;
    if (!el) return;
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(len * p);
    setTip({ x: pt.x, y: pt.y });
  }, [p, path]);

  return (
    <svg className="pr-plot" width={width} height={height} aria-hidden>
      <line x1={left} x2={right} y1={y(1)} y2={y(1)} className="pr-plot__target" />
      <path d={`M${left} ${y(0)} L${linearEnd} ${y(1)} L${right} ${y(1)}`} className="pr-plot__linear" />
      <text x={linearEnd - 10} y={y(0.5) + 14} className="pr-plot__label" textAnchor="start">
        linear
      </text>
      <path ref={line} d={path} pathLength={1} className="pr-plot__spring" style={{ strokeDashoffset: 1 - p }} />
      {tip && p > 0 && (
        <g transform={`translate(${tip.x} ${tip.y})`} data-lead>
          <circle r={8} className="pr-plot__halo" />
          <circle r={4.5} className="pr-plot__dot" />
        </g>
      )}
    </svg>
  );
}

function Spring() {
  const [ref, { width, height }] = useSlot({ width: 640, height: 230 });
  const theme = useTheme();
  return (
    <Tile
      area="spring"
      lead="Springs, not tweens."
      picture={
        <div ref={ref} className="pr-picture pr-picture--spring">
          <Stage<Beat> width={width} height={height} theme={theme} initial={off} poster={on} play="once" script={beat(2)} className="pr-stage look-act">
            {(s) => <SpringPlot on={s.on} width={width} height={height} />}
          </Stage>
        </div>
      }
    >
      Every move overshoots a touch and settles, so it feels like it has mass.
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/* Quiet (component): a sheet whose button presses flat                */
/* ------------------------------------------------------------------ */

type Sheet = { saved: boolean };
const unsaved: Sheet = { saved: false };
const saved: Sheet = { saved: true };

async function quiet(a: Act<Sheet>) {
  await a.wait(LEAD + 3 * STEP + 300);
  // Aim at the button's padding, so the hand never covers its label as it presses
  const target = { at: "save", x: 0.86, y: 0.7 };
  await a.move(target);
  await a.click(target);
  await a.set({ saved: true });
  await a.wait(400);
  const save = a.rect("save");
  await a.move({ x: save.x - 90, y: save.y + 120 });
}

function Quiet() {
  const [ref, { width, height }] = useSlot({ width: 380, height: 250 });
  const theme = useTheme();
  return (
    <Tile
      area="quiet"
      lead="Motion where it means something."
      picture={
        <div ref={ref} className="pr-picture pr-picture--quiet">
          <Stage<Sheet>
            width={width}
            height={height}
            theme={theme}
            initial={unsaved}
            poster={saved}
            play="once"
            script={quiet}
            cursor={{ at: { x: width - 70, y: height - 24 } }}
            className="pr-stage look-act"
          >
            {(s) => (
              <div className="pr-sheet">
                <div className="pr-sheet__head">
                  <span className="pr-sheet__title">Sound</span>
                  <Button variant="primary" data-target="save" data-cursor="pointer" icon={s.saved ? <Icon name="check" size={14} stroke={2} /> : undefined}>
                    {s.saved ? "Saved" : "Save"}
                  </Button>
                </div>
                <div className="pr-sheet__row">
                  <span className="pr-sheet__label">Volume</span>
                  <span className="pr-slider" aria-hidden>
                    <span className="pr-slider__fill" />
                    <span className="pr-slider__knob" />
                  </span>
                </div>
                <div className="pr-sheet__row">
                  <span className="pr-sheet__label">Haptics</span>
                  <Toggle on />
                </div>
                <div className="pr-sheet__row">
                  <Bar w={64} tone={3} />
                  <Bar w={28} h={16} r={8} tone={2} />
                </div>
                <div className="pr-sheet__row">
                  <Bar w={52} tone={3} />
                  <Bar w={96} tone={2} />
                </div>
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Buttons don’t bounce. Movement is saved for the things you drag, turn and fling.
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/* Palette (collection)                                                */
/* ------------------------------------------------------------------ */

const SCALE = ["50", "100", "200", "300", "400", "500", "signal", "600", "700", "800", "900", "950"] as const;

/** Swatches fill in from the light end, a step at a time. */
const swatches = async (a: Act<Beat>) => {
  await a.wait(LEAD + 4 * STEP);
  await a.set({ on: true });
};

function Palette() {
  const [ref, { width, height }] = useSlot({ width: 1300, height: 140 });
  const theme = useTheme();
  // Twelve across while each chip keeps a readable label; two rows of six below that
  const columns = width >= 900 ? 12 : 6;
  return (
    <Tile
      area="palette"
      lead="Neutral greys, one accent."
      picture={
        <div ref={ref} className="pr-picture pr-picture--palette">
          <Stage<Beat> width={width} height={height} theme={theme} initial={off} poster={on} play="once" script={swatches} className="pr-stage look-act">
            {(s) => (
              <div className="pr-chips" data-on={s.on || undefined} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {SCALE.map((step, i) => (
                  <span key={step} className="pr-chip" data-signal={step === "signal" || undefined} style={{ ["--i" as string]: i }}>
                    <span className="pr-chip__swatch" style={{ background: step === "signal" ? "var(--signal)" : `var(--color-neutral-${step})` }} />
                    <span className="pr-chip__name">{step}</span>
                  </span>
                ))}
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Tailwind’s neutral scale does the work. A single signal colour marks what’s live.
    </Tile>
  );
}

export function Features() {
  return (
    <div className="relative mt-16">
      <Crosses />
      <div className="principles">
        <Detents />
        <File />
        <Spring />
        <Quiet />
        <Palette />
      </div>
    </div>
  );
}
