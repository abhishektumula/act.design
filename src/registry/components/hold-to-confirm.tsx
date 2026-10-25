"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fill = {
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  neutral: "bg-base-100 text-base-950",
};

export const holdVariants = cva(
  "relative overflow-hidden rounded-xl bg-base-900 font-medium text-base-300 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 outline-none select-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500/60 [&_svg]:size-4",
  {
    variants: {
      size: { sm: "h-9 px-4 text-xs", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]" },
    },
    defaultVariants: { size: "md" },
  },
);

export function HoldToConfirm({
  label = "Hold to delete",
  doneLabel = "Deleted",
  icon = <Trash2 />,
  duration = 1.4,
  tone = "danger",
  size,
  className,
  onConfirm,
}: VariantProps<typeof holdVariants> & {
  label?: string;
  doneLabel?: string;
  icon?: ReactNode;
  /** Seconds the user must hold. */
  duration?: number;
  tone?: keyof typeof fill;
  className?: string;
  onConfirm?: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(t);
  }, [done]);

  const content = (
    <>
      {done ? <Check /> : icon}
      {done ? doneLabel : label}
    </>
  );

  return (
    <button
      data-slot="hold-to-confirm"
      onPointerDown={() => !done && setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && !done && setHolding(true)}
      onKeyUp={() => setHolding(false)}
      className={cn(holdVariants({ size }), className)}
    >
      <span className="flex items-center gap-2">{content}</span>
      {/* The fill layer is clipped from the left; text stays perfectly aligned underneath. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ clipPath: holding || done ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={holding ? { duration, ease: "linear" } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (holding) {
            setHolding(false);
            setDone(true);
            onConfirm?.();
          }
        }}
        className={cn("absolute inset-0 flex items-center justify-center gap-2", fill[tone])}
      >
        {content}
      </motion.span>
    </button>
  );
}

export default function Demo() {
  return <HoldToConfirm />;
}
