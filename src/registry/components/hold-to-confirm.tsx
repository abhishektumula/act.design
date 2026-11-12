"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, animate, motion, useAnimate, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const holdVariants = cva(
  "relative inline-flex h-12 cursor-pointer items-center overflow-hidden rounded-full bg-base-950 px-6 text-sm font-medium text-base-100 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.1),0_8px_20px_-10px_var(--color-shade)] ring-1 ring-base-50/10 outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950 dark:bg-base-900 dark:shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  {
    variants: {
      tone: {
        signal: "[--fill:var(--signal)] focus-visible:ring-signal/60",
        danger: "[--fill:oklch(0.56_0.17_29)] focus-visible:ring-red-500/60",
      },
    },
    defaultVariants: { tone: "danger" },
  },
);

function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap [&_svg]:size-4">
      {icon}
      {children}
    </span>
  );
}

/**
 * For actions that deserve intent. Press and hold: a fill sweeps across and the
 * label inverts beneath it. Let go early and it springs back with a shake.
 * Works with Space / Enter held down too.
 */
export function HoldToConfirm({
  children = "Hold to delete",
  icon = <Trash2 />,
  doneLabel = "Deleted",
  duration = 1.4,
  onConfirm,
  tone,
  className,
}: VariantProps<typeof holdVariants> & {
  children?: ReactNode;
  icon?: ReactNode;
  doneLabel?: ReactNode;
  /** Seconds of holding needed. */
  duration?: number;
  onConfirm?: () => void;
  className?: string;
}) {
  const [scope, animateScope] = useAnimate();
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (p) => `inset(0 ${100 - p * 100}% 0 0)`);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);

  const begin = () => {
    if (done || run.current) return;
    setHint(false);
    run.current = animate(progress, 1, {
      duration: (1 - progress.get()) * duration,
      ease: "linear",
      onComplete: () => {
        run.current = null;
        navigator.vibrate?.(20);
        setDone(true);
        onConfirm?.();
      },
    });
  };

  const cancel = () => {
    if (!run.current) return;
    run.current.stop();
    run.current = null;
    if (progress.get() < 1) {
      animate(progress, 0, { type: "spring", stiffness: 300, damping: 26 });
      animateScope(scope.current, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.35 });
      setHint(true);
    }
  };

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      setDone(false);
      progress.set(0);
    }, 2400);
    return () => clearTimeout(t);
  }, [done, progress]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        ref={scope}
        type="button"
        layout
        transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
        data-slot="hold-to-confirm"
        aria-label={typeof children === "string" ? children : undefined}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            begin();
          }
        }}
        onKeyUp={(e) => (e.key === " " || e.key === "Enter") && cancel()}
        onContextMenu={(e) => e.preventDefault()}
        whileTap={{ scale: 0.97 }}
        className={cn(holdVariants({ tone }), done && "bg-(--fill) text-white dark:bg-(--fill)", className)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Label icon={<Check />}>{doneLabel}</Label>
            </motion.span>
          ) : (
            <motion.span key="idle" exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }} className="relative">
              <Label icon={icon}>{children}</Label>
              {/* Filled copy, revealed by the sweep */}
              <motion.span
                aria-hidden
                style={{ clipPath: clip }}
                className="absolute -inset-y-4 -left-6 -right-6 flex items-center bg-(--fill) px-6 text-white"
              >
                <Label icon={icon}>{children}</Label>
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {hint && !done && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-base-500"
          >
            Keep holding
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Demo() {
  return <HoldToConfirm>Hold to delete project</HoldToConfirm>;
}
