"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "motion/react";
import { cn } from "@/lib/utils";

/*
 * A headline that is made in front of you, the way a designer would set it:
 *   1. the words are typed in behind a blinking caret
 *   2. a cursor glides in and clicks them: a design-tool selection draws on
 *   3. it takes the bottom-right handle and drags the text up to full size,
 *      with the scale read out beside it
 *   4. it lets go and slips away, leaving the selection behind
 *
 * Plays once, when it scrolls into view. Remount it (change its `key`) to play again.
 * With reduced motion it simply shows the finished, selected headline.
 */

const ease = [0.22, 1, 0.36, 1] as const;
const easeInOut = [0.65, 0, 0.35, 1] as const;
const pop = [0.34, 1.56, 0.64, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The selection box's overhang past the text, in px (matches -inset-x-4 / -inset-y-3). */
const PAD_X = 16;
const PAD_Y = 12;

type Phase = "idle" | "typing" | "pointing" | "selected" | "resizing" | "done";
type Char = { ch: string; hl: boolean };

/** Splits the text into lines of characters, marking the ones inside `highlight`. */
function parse(text: string, highlight?: string): Char[][] {
  return text.split("\n").map((line) => {
    const at = highlight ? line.indexOf(highlight) : -1;
    return [...line].map((ch, i) => ({ ch, hl: at >= 0 && i >= at && i < at + highlight!.length }));
  });
}

/** Design-tool selection marks: a hairline box with a square handle on each corner. */
function Selection({ show, animated }: { show: boolean; animated: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.985 }}
      transition={{ duration: animated ? 0.22 : 0, ease }}
      className="pointer-events-none absolute -inset-x-4 -inset-y-3 border border-[var(--typeset-color)]/60"
    >
      {["-top-[4px] -left-[4px]", "-top-[4px] -right-[4px]", "-bottom-[4px] -left-[4px]", "-right-[4px] -bottom-[4px]"].map((p, i) => (
        <motion.span
          key={p}
          initial={false}
          animate={{ scale: show ? 1 : 0 }}
          transition={{ duration: animated ? 0.26 : 0, delay: animated && show ? 0.06 + i * 0.035 : 0, ease: pop }}
          className={`absolute size-[7px] border border-[var(--typeset-color)] bg-[var(--typeset-handle)] ${p}`}
        />
      ))}
    </motion.span>
  );
}

/**
 * A blinking text caret. It hangs off the edge of a letter (absolute, no width of its
 * own), so it can never wrap onto a line of its own or nudge the words around it.
 */
function Caret({ side }: { side: "before" | "after" }) {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, times: [0, 0.5, 0.55, 1], repeat: Infinity }}
      className={cn(
        "absolute top-[0.12em] bottom-[0.06em] w-[0.05em] rounded-full bg-[var(--typeset-color)]",
        side === "after" ? "left-full ml-[0.03em]" : "right-full mr-[0.03em]",
      )}
    />
  );
}

function Arrow() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]">
      <path
        d="M3 2.2v16.9c0 .6.7.9 1.1.5l4.1-4.2 2.8 6.3c.2.4.7.6 1.1.4l2-.9c.4-.2.6-.7.4-1.1l-2.8-6.2h5.8c.6 0 .9-.7.5-1.1L4.1 1.6C3.7 1.2 3 1.5 3 2.2z"
        fill="var(--typeset-color)"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Resize() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]">
      <path d="M4 4h6.2L8 6.2l7.8 7.8 2.2-2.2V18h-6.2l2.2-2.2L6.2 8 4 10.2z" fill="white" stroke="black" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Typeset({
  text,
  highlight,
  highlightClassName = "text-[var(--typeset-color)]",
  as = "h2",
  color = "var(--signal)",
  startScale = 0.86,
  speed = 45,
  delay = 0.3,
  onDone,
  className,
  style,
}: {
  /** The headline. Use "\n" for a line break. */
  text: string;
  /** A phrase inside `text` to set apart, e.g. the last word. */
  highlight?: string;
  highlightClassName?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Caret, cursor and selection colour. */
  color?: string;
  /** How small the text is typed before it is dragged up to size. */
  startScale?: number;
  /** Milliseconds per character, before a little human jitter. */
  speed?: number;
  /** Seconds to wait once in view before typing starts. */
  delay?: number;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const Root = motion[as];
  const lines = parse(text, highlight);
  const total = lines.reduce((n, l) => n + l.length, 0);

  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLElement>(null);
  const inView = useInView(wrap, { once: true, amount: 0.6 });

  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
  const [cursor, setCursor] = useState<"arrow" | "resize">("arrow");

  const k = useMotionValue(startScale);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const press = useMotionValue(1);
  const shown = useMotionValue(0);
  const badge = useMotionValue(0);
  const pct = useTransform(k, (v) => `${Math.round(v * 100)}%`);

  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    if (!inView || reduce) return;
    // A token per run, so a remount (Strict Mode, fast refresh) can't leave two runs playing.
    const token = { dead: false };
    const running: AnimationPlaybackControls[] = [];
    const run = (a: AnimationPlaybackControls) => (running.push(a), a);

    (async () => {
      const node = el.current;
      const box = wrap.current;
      if (!node || !box) return;
      k.set(startScale);

      // 1. Type it in: a beat longer at each line break, a touch of jitter so it reads as a hand.
      await wait(delay * 1000);
      if (token.dead) return;
      setPhase("typing");
      const breaks = new Set(lines.reduce<number[]>((acc, l) => [...acc, (acc.at(-1) ?? 0) + l.length], []));
      for (let i = 1; i <= total; i++) {
        if (token.dead) return;
        setTyped(i);
        await wait(breaks.has(i) ? speed * 6 : speed * 0.85 + ((i * 37) % Math.max(1, Math.round(speed * 0.7))));
      }
      await wait(600);
      if (token.dead) return;

      // Geometry at full size (transforms don't change offset sizes), anchored at the text's top-left.
      const ox = node.offsetLeft;
      const oy = node.offsetTop;
      const corner = (s: number) => ({ x: ox + s * (node.offsetWidth + PAD_X), y: oy + s * (node.offsetHeight + PAD_Y) });

      // 2. A cursor glides in from the right and lands on the words. X and Y ease differently: a gentle arc.
      setPhase("pointing");
      cx.set(box.clientWidth + 120);
      cy.set(oy + node.offsetHeight * 1.4);
      const land = { x: ox + node.offsetWidth * startScale * 0.55, y: oy + node.offsetHeight * startScale * 0.62 };
      run(animate(shown, 1, { duration: 0.25 }));
      await Promise.all([run(animate(cx, land.x, { duration: 0.95, ease })), run(animate(cy, land.y, { duration: 0.95, ease: [0.4, 0, 0.2, 1] }))]);
      if (token.dead) return;

      // Click: press, and the selection draws on.
      await run(animate(press, 0.82, { duration: 0.09 }));
      setPhase("selected");
      await run(animate(press, 1, { type: "spring", stiffness: 600, damping: 22 }));
      await wait(380);
      if (token.dead) return;

      // 3. Over to the bottom-right handle; the pointer turns into a resize cursor.
      const from = corner(startScale);
      await Promise.all([run(animate(cx, from.x, { duration: 0.6, ease })), run(animate(cy, from.y, { duration: 0.6, ease: [0.4, 0, 0.2, 1] }))]);
      if (token.dead) return;
      setCursor("resize");
      await wait(140);
      await run(animate(press, 0.88, { duration: 0.1 }));

      // Drag: text, handle and cursor move as one, with the scale read out beside the cursor.
      setPhase("resizing");
      const to = corner(1);
      run(animate(badge, 1, { duration: 0.18 }));
      await Promise.all([
        run(animate(k, 1, { duration: 1.05, ease: easeInOut })),
        run(animate(cx, to.x, { duration: 1.05, ease: easeInOut })),
        run(animate(cy, to.y, { duration: 1.05, ease: easeInOut })),
      ]);
      if (token.dead) return;

      // 4. Let go and slip away.
      run(animate(press, 1, { type: "spring", stiffness: 600, damping: 22 }));
      await wait(260);
      run(animate(badge, 0, { duration: 0.2 }));
      setCursor("arrow");
      run(animate(cx, to.x + 70, { duration: 0.7, ease }));
      run(animate(cy, to.y + 46, { duration: 0.7, ease }));
      await run(animate(shown, 0, { duration: 0.45, delay: 0.15 }));
      if (token.dead) return;
      setPhase("done");
      done.current?.();
    })();

    return () => {
      token.dead = true;
      running.forEach((a) => a.stop());
    };
    // Runs once per mount; remount to replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const over = !!reduce || phase === "done";
  const shownTyped = over ? total : typed;
  const typing = !over && (phase === "idle" || phase === "typing") && inView;

  let index = 0;
  return (
    <div ref={wrap} data-slot="typeset" className="relative w-fit" style={{ ["--typeset-color" as string]: color, ["--typeset-handle" as string]: "var(--color-canvas, white)" }}>
      <Root
        // The tag is chosen at runtime; the ref only needs an HTMLElement.
        ref={el as React.Ref<never>}
        aria-label={text.replace(/\n/g, " ")}
        style={{ ...style, scale: over ? 1 : k, transformOrigin: "0 0" }}
        className={cn("relative block w-fit", className)}
      >
        <Selection show={over || phase === "selected" || phase === "resizing"} animated={!over} />
        {lines.map((line, l) => (
          <span key={l} aria-hidden className="block">
            {line.map((c, i) => {
              const n = index++;
              return (
                <span key={i} className={cn("relative", c.hl && highlightClassName)}>
                  <span className={n < shownTyped ? undefined : "opacity-0"}>{c.ch}</span>
                  {typing && n === 0 && shownTyped === 0 && <Caret side="before" />}
                  {typing && shownTyped === n + 1 && <Caret side="after" />}
                </span>
              );
            })}
          </span>
        ))}
      </Root>

      {/* The cursor, in the wrapper's coordinates so it isn't scaled with the text. */}
      {!over && phase !== "idle" && phase !== "typing" && (
        <motion.div aria-hidden style={{ x: cx, y: cy, opacity: shown }} className="pointer-events-none absolute top-0 left-0 z-10">
          <motion.div style={{ scale: press }} className={cursor === "arrow" ? "origin-[3px_2px]" : "-translate-x-1/2 -translate-y-1/2"}>
            {cursor === "arrow" ? <Arrow /> : <Resize />}
          </motion.div>
          <motion.span
            style={{ opacity: badge }}
            className="absolute top-4 left-4 rounded-[5px] bg-[var(--typeset-color)] px-1.5 py-0.5 font-mono text-[11px] leading-4 font-medium text-white tabular-nums shadow-[0_2px_6px_rgb(0_0_0/0.3)]"
          >
            {pct}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

export default function Demo() {
  return (
    <div className="px-6">
      <Typeset text={"Interfaces\nthat act."} highlight="act." className="text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-base-50 @md:text-6xl" />
    </div>
  );
}
