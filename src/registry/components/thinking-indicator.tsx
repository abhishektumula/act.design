"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Globe, PenLine, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShimmerText({ children, className, duration = 1.8 }: { children: ReactNode; className?: string; duration?: number }) {
  return (
    <motion.span
      className={cn(
        "bg-[linear-gradient(110deg,var(--color-base-500)_35%,var(--color-base-50)_50%,var(--color-base-500)_65%)] bg-size-[250%_100%] bg-clip-text text-transparent",
        className,
      )}
      initial={{ backgroundPosition: "100% 0" }}
      animate={{ backgroundPosition: "0% 0" }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

type Step = { label: string; icon: LucideIcon };

const defaultSteps: Step[] = [
  { label: "Thinking", icon: Sparkles },
  { label: "Searching the web", icon: Globe },
  { label: "Reading 4 sources", icon: BookOpen },
  { label: "Writing a reply", icon: PenLine },
];

export function ThinkingIndicator({
  steps = defaultSteps,
  interval = 2200,
  className,
}: {
  steps?: Step[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % steps.length), interval);
    return () => clearInterval(t);
  }, [steps.length, interval]);

  const { label, icon: Icon } = steps[index];

  return (
    <div data-slot="thinking-indicator" className={cn("flex h-6 items-center gap-2 text-sm", className)} role="status" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon className="size-4 text-base-500" />
          <ShimmerText>{label}…</ShimmerText>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function TypingDots({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-1", className)} aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn("size-1.5 rounded-full bg-base-400", dotClassName)}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="rounded-2xl bg-base-900/60 px-4 py-3.5 ring-1 ring-base-50/5">
        <ThinkingIndicator />
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-base-900/60 px-4 py-3.5 ring-1 ring-base-50/5">
        <ShimmerText className="text-sm">Generating component…</ShimmerText>
        <span className="font-mono text-xs text-base-600">12s</span>
      </div>
      <div className="w-fit rounded-2xl rounded-bl-md bg-base-800 px-4 py-3.5">
        <TypingDots />
      </div>
    </div>
  );
}
