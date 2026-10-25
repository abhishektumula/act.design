"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function Reasoning({
  thoughts,
  thinking,
  seconds,
  className,
}: {
  thoughts: string[];
  thinking: boolean;
  seconds: number;
  className?: string;
}) {
  const [open, setOpen] = useState(thinking);
  const [wasThinking, setWasThinking] = useState(thinking);

  // Open while thinking, fold away once the model is done.
  if (wasThinking !== thinking) {
    setWasThinking(thinking);
    setOpen(thinking);
  }

  return (
    <div data-slot="reasoning" className={cn("w-full", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 text-sm text-base-400 transition-colors hover:text-base-100"
        aria-expanded={open}
      >
        <Brain className="size-4" />
        {thinking ? (
          <motion.span
            className="bg-[linear-gradient(110deg,var(--color-base-500)_35%,var(--color-base-50)_50%,var(--color-base-500)_65%)] bg-size-[250%_100%] bg-clip-text text-transparent"
            initial={{ backgroundPosition: "100% 0" }}
            animate={{ backgroundPosition: "0% 0" }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          >
            Thinking for {seconds}s
          </motion.span>
        ) : (
          <span>Thought for {seconds}s</span>
        )}
        <ChevronRight className={`size-3.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="mt-3 ml-2 space-y-2.5 border-l border-base-800 pl-4">
              <AnimatePresence initial={false}>
                {thoughts.map((t, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                    className="text-[13px] leading-relaxed text-base-500"
                  >
                    {t}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const script = [
  "The user wants a pricing page that feels calm, not salesy.",
  "Three tiers reads best. Highlight the middle one with a ring, not a loud colour.",
  "Monthly / yearly toggle should be a segmented control so the price can roll.",
  "Keep the FAQ below the fold with generous spacing.",
];

export default function Demo() {
  const [run, setRun] = useState(0);
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const thinking = count < script.length;

  useEffect(() => {
    if (!thinking) return;
    const step = setInterval(() => setCount((c) => Math.min(c + 1, script.length)), 1100);
    const clock = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(step);
      clearInterval(clock);
    };
  }, [run, thinking]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Reasoning thoughts={script.slice(0, count)} thinking={thinking} seconds={seconds} />
      <AnimatePresence>
        {!thinking && (
          <motion.p
            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[15px] leading-7 text-base-200"
          >
            Here&apos;s a three-tier pricing page with a rolling price toggle and a quiet FAQ.
          </motion.p>
        )}
      </AnimatePresence>
      <button
        onClick={() => {
          setCount(0);
          setSeconds(0);
          setRun((r) => r + 1);
        }}
        className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-100"
      >
        <RotateCcw className="size-3" /> Replay
      </button>
    </div>
  );
}
