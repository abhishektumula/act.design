"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { LogoMark } from "./logo";

/** A stable 8-digit member number derived from the name. */
function memberNo(name: string) {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const n = String(h % 100000000).padStart(8, "0");
  return `${n.slice(0, 4)} ${n.slice(4)}`;
}

const TICKS = 48;

/**
 * The member's access pass. A black card engraved with a dial scale that is lit
 * as far as the plan reaches. It tilts toward the pointer on a spring and a soft
 * light follows the cursor across the surface.
 */
export function MembershipCard({
  name,
  plan,
  since,
  unlocked = 1,
}: {
  name: string;
  plan: string;
  since: string;
  /** 0–1, how much of the library the plan opens. */
  unlocked?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring);
  const lx = useTransform(px, (v) => `${v * 100}%`);
  const ly = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${lx} ${ly}, rgb(255 255 255 / 0.10), transparent 45%)`;

  const move = (e: PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const lit = Math.round(unlocked * TICKS);

  return (
    <div className="w-full max-w-sm [perspective:1200px] sm:w-[400px]">
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={reduce ? undefined : { rotateX, rotateY }}
        className="relative aspect-[1.586] overflow-hidden rounded-xl bg-neutral-950 text-neutral-100 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_40px_70px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10 [transform-style:preserve-3d]"
      >
        {/* Engraving: dot grid, hairline rules and the dial scale */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] bg-[size:12px_12px] [mask-image:linear-gradient(110deg,black,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-[58%] w-px bg-white/[0.06]" />
        {/* The dial: lit as far as the plan reaches, the plan in its hub */}
        <div className="pointer-events-none absolute top-1/2 right-[5%] aspect-square w-[40%] -translate-y-1/2">
          <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full overflow-visible">
            <circle cx="100" cy="100" r="58" fill="rgb(255 255 255 / 0.02)" stroke="rgb(255 255 255 / 0.08)" />
            <circle cx="100" cy="100" r="44" fill="none" stroke="rgb(255 255 255 / 0.05)" strokeDasharray="1 3" />
            {Array.from({ length: TICKS }, (_, i) => {
              // A 270° sweep starting bottom-left, like the Dial.
              const a = ((135 + (i / (TICKS - 1)) * 270) * Math.PI) / 180;
              const major = i % 6 === 0;
              const r1 = 70;
              const r2 = major ? 88 : 80;
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(a)}
                  y1={100 + r1 * Math.sin(a)}
                  x2={100 + r2 * Math.cos(a)}
                  y2={100 + r2 * Math.sin(a)}
                  stroke={i < lit ? "var(--color-blue-500)" : "rgb(255 255 255 / 0.14)"}
                  strokeWidth={major ? 2.2 : 1.4}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[9px] tracking-[0.2em] text-white/45 uppercase">{plan}</span>
            <span className="mt-0.5 text-xl font-medium tracking-[-0.03em] tabular-nums">{Math.round(unlocked * 100)}%</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-blue-600/25 dark:bg-blue-500/25 blur-3xl" />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay" />
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />

        <div className="relative flex h-full w-[58%] flex-col justify-between p-6">
          <span className="flex items-center gap-2.5">
            <LogoMark className="size-6" />
            <span className="text-sm font-semibold tracking-[-0.02em]">act.design</span>
          </span>

          <p className="font-mono text-[13px] tracking-[0.2em] text-white/70 tabular-nums">{memberNo(name)}</p>

          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] text-white/40 uppercase">Member</p>
            <p className="mt-1 truncate text-lg font-medium tracking-[-0.01em]">{name}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] whitespace-nowrap text-white/40 uppercase">
              <span className="size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_var(--color-blue-600)] dark:shadow-[0_0_8px_var(--color-blue-500)]" />
              Since <span className="text-white/75">{since}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
