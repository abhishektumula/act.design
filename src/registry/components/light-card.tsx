"use client";

import { useRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** `--ray` tints the beams and the glow at their source. */
export const lightCardVariants = cva(
  "group relative isolate flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-base-950 shadow-xl shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
  {
    variants: {
      tone: {
        amber: "[--ray:var(--color-amber-400)]",
        sky: "[--ray:var(--color-sky-400)]",
        violet: "[--ray:var(--color-violet-400)]",
        emerald: "[--ray:var(--color-emerald-400)]",
        rose: "[--ray:var(--color-rose-400)]",
      },
      size: {
        md: "min-h-[26rem]",
        lg: "min-h-[32rem]",
      },
    },
    defaultVariants: { tone: "amber", size: "md" },
  },
);

const grain =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")]";

/**
 * A card lit from a single point. The source rests below the bottom edge and
 * drifts after the pointer, so the beams sweep across the surface. It never
 * rises past `ceiling` (a 0 to 1 fraction of the height), which keeps the copy clean.
 */
export function LightCard({
  icon,
  eyebrow,
  title,
  children,
  footer,
  tone,
  size,
  ceiling = 0.6,
  className,
  classNames,
}: VariantProps<typeof lightCardVariants> & {
  icon?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  ceiling?: number;
  className?: string;
  classNames?: { content?: string; title?: string; body?: string; footer?: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(78);
  const y = useMotionValue(112);
  const sx = useSpring(x, { stiffness: 50, damping: 16 });
  const sy = useSpring(y, { stiffness: 50, damping: 16 });
  const lx = useTransform(sx, (v) => `${v}%`);
  const ly = useTransform(sy, (v) => `${v}%`);

  return (
    <motion.div
      ref={ref}
      data-slot="light-card"
      style={{ "--lx": lx, "--ly": ly } as Record<string, unknown>}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width) * 100);
        y.set(Math.max(ceiling, (e.clientY - r.top) / r.height) * 100 + 18);
      }}
      onPointerLeave={() => {
        x.set(78);
        y.set(112);
      }}
      className={cn(lightCardVariants({ tone, size }), className)}
    >
      {/* Glow at the source */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_var(--lx)_var(--ly),color-mix(in_oklab,var(--ray)_55%,transparent),transparent_55%)]" />
      {/* Beams: fine conic lines, faded with distance from the source */}
      <div className="absolute inset-0 -z-10 bg-[repeating-conic-gradient(from_0deg_at_var(--lx)_var(--ly),transparent_0deg_2.2deg,color-mix(in_oklab,var(--ray)_70%,transparent)_2.2deg_2.5deg)] [mask-image:radial-gradient(circle_at_var(--lx)_var(--ly),black,transparent_75%)] opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
      {/* Keep the top calm */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-base-950 from-25% via-base-950/40 via-50% to-transparent" />
      <div className={cn("pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay", grain)} />

      <div className={cn("flex flex-1 flex-col p-7", classNames?.content)}>
        <div className="flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-xl bg-base-900 text-(--ray) ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 shadow-md shadow-shade/30 [&_svg]:size-[18px]">
            {icon ?? <Sun />}
          </span>
          {eyebrow && <span className="text-xs font-medium text-base-500">{eyebrow}</span>}
        </div>
        <h3 className={cn("mt-8 text-xl font-medium tracking-[-0.02em] text-balance text-base-50", classNames?.title)}>{title}</h3>
        {children && <div className={cn("mt-2 leading-relaxed text-pretty text-base-400", classNames?.body)}>{children}</div>}
        {footer && (
          <div
            className={cn(
              "mt-auto flex items-center justify-between rounded-2xl bg-base-950/60 px-4 py-3 text-sm text-base-200 ring-1 ring-base-50/10 backdrop-blur-md",
              classNames?.footer,
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Demo() {
  return (
    <LightCard
      eyebrow="Rendering"
      title="Light that follows your hand"
      footer={
        <>
          <span>
            <span className="text-base-500">Ray tracing</span> · 4.2ms / frame
          </span>
          <ArrowUpRight className="size-4 text-base-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </>
      }
    >
      Move across the card. The source drifts after you and the beams sweep with it, but never over the words.
    </LightCard>
  );
}
