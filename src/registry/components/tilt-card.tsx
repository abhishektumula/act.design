"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";

export function TiltCard({
  children,
  max = 14,
  glare = true,
  className,
}: {
  children: ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  glare?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, var(--color-white), transparent 50%)`;

  return (
    <div data-slot="tilt-card" className={className} style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative"
      >
        {children}
        {glare && <motion.div
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-40"
        />}
      </motion.div>
    </div>
  );
}

export default function Demo() {
  return (
    <TiltCard>
      <div className="relative aspect-[1.586] w-80 overflow-hidden rounded-2xl bg-linear-to-br from-neutral-800 via-neutral-900 to-black p-6 shadow-2xl shadow-black ring-1 ring-white/15 inset-shadow-2xs inset-shadow-white/20">
        <div className="absolute -top-24 -right-16 size-56 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 size-44 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-neutral-300">Component Lib</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.2em] text-neutral-50 ring-1 ring-white/20 inset-shadow-2xs inset-shadow-white/20">
              MAX
            </span>
          </div>
          <div className="h-8 w-11 rounded-md bg-linear-to-br from-amber-200 via-amber-400 to-amber-600 ring-1 ring-amber-900/40 inset-shadow-2xs inset-shadow-white/50" />
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] tracking-widest text-neutral-500 uppercase">Member</p>
              <p className="text-[15px] font-medium text-neutral-100">Abhishek Tumula</p>
            </div>
            <p className="font-mono text-sm text-neutral-400">•••• 2026</p>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
