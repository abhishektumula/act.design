"use client";

import { useRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const magneticVariants = cva("relative rounded-full font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500", {
  variants: {
    variant: {
      white: "bg-linear-to-b from-base-50 to-base-200 text-base-950 shadow-xl shadow-base-50/10 ring-1 ring-base-50/60 inset-shadow-2xs inset-shadow-white",
      dark: "bg-linear-to-b from-base-800 to-base-900 text-base-100 shadow-xl shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15",
      blue: "bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-600/30 ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30",
    },
    size: {
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-[15px]",
    },
  },
  defaultVariants: { variant: "white", size: "lg" },
});

export function MagneticButton({
  children,
  strength = 0.35,
  variant,
  size,
  className,
  onClick,
}: VariantProps<typeof magneticVariants> & {
  children: ReactNode;
  /** How far the button follows the cursor, 0–1. */
  strength?: number;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  // The label travels a little further than the button for a parallax feel.
  const lx = useTransform(sx, (v) => v * 0.5);
  const ly = useTransform(sy, (v) => v * 0.5);

  return (
    <motion.button
      ref={ref}
      data-slot="magnetic-button"
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.95 }}
      className={cn(magneticVariants({ variant, size }), className)}
    >
      <motion.span style={{ x: lx, y: ly }} className="flex items-center gap-2">
        {children}
      </motion.span>
    </motion.button>
  );
}

export default function Demo() {
  return (
    <div className="flex h-64 items-center justify-center">
      <MagneticButton>
        Let&apos;s talk <ArrowUpRight className="size-4" />
      </MagneticButton>
    </div>
  );
}
