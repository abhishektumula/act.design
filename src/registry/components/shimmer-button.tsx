"use client";

import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const beams = {
  sky: "bg-[conic-gradient(from_90deg,transparent_0%,transparent_75%,var(--color-sky-300)_90%,var(--color-white)_100%)]",
  violet: "bg-[conic-gradient(from_90deg,transparent_0%,transparent_75%,var(--color-violet-400)_90%,var(--color-fuchsia-200)_100%)]",
  amber: "bg-[conic-gradient(from_90deg,transparent_0%,transparent_75%,var(--color-amber-400)_90%,var(--color-yellow-100)_100%)]",
  emerald: "bg-[conic-gradient(from_90deg,transparent_0%,transparent_75%,var(--color-emerald-400)_90%,var(--color-lime-100)_100%)]",
};

export const beamButtonVariants = cva(
  "relative inline-flex h-full items-center gap-2 rounded-full bg-base-950 font-medium text-base-100 inset-shadow-2xs inset-shadow-white/10 transition-colors group-hover:bg-base-900",
  {
    variants: {
      size: { sm: "px-4 text-xs", md: "px-6 text-sm", lg: "px-8 text-[15px]" },
    },
    defaultVariants: { size: "md" },
  },
);

const heights = { sm: "h-9", md: "h-11", lg: "h-13" };

/** A light travels around the border. */
export function BorderBeamButton({
  children,
  className,
  beam = "sky",
  size,
  duration = 3,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof beamButtonVariants> & { beam?: keyof typeof beams; duration?: number }) {
  return (
    <button
      data-slot="border-beam-button"
      className={cn(
        "group relative inline-flex overflow-hidden rounded-full p-px outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        heights[size ?? "md"],
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className={cn("absolute inset-[-200%]", beams[beam])}
      />
      <span className={beamButtonVariants({ size })}>{children}</span>
    </button>
  );
}

export const shineButtonVariants = cva(
  "group relative inline-flex items-center gap-2 overflow-hidden rounded-full font-medium outline-none transition-transform active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-blue-500/60",
  {
    variants: {
      variant: {
        dark: "bg-linear-to-b from-base-800 to-base-950 text-base-100 shadow-lg shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15",
        blue: "bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30",
        white: "bg-linear-to-b from-base-50 to-base-200 text-base-950 shadow-lg shadow-base-50/10 ring-1 ring-base-50/60 inset-shadow-2xs inset-shadow-white",
      },
      size: { sm: "h-9 px-4 text-xs", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-[15px]" },
    },
    defaultVariants: { variant: "dark", size: "md" },
  },
);

/** A sheen sweeps across on hover. */
export function ShineButton({
  children,
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof shineButtonVariants>) {
  return (
    <button data-slot="shine-button" className={cn(shineButtonVariants({ variant, size }), className)} {...props}>
      <span
        aria-hidden
        className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-[left] duration-700 ease-out group-hover:left-[150%]"
      />
      {children}
    </button>
  );
}

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <BorderBeamButton>
        <Sparkles className="size-4 text-sky-600 dark:text-sky-300" /> Ask AI
      </BorderBeamButton>
      <ShineButton>
        Get started <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </ShineButton>
    </div>
  );
}
