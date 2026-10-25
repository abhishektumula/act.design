"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Entrance presets. Add your own: `hidden` → `show`. */
export const staggerPresets = {
  blur: {
    hidden: { opacity: 0, y: "0.35em", filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  },
  slide: {
    hidden: { opacity: 0, y: "100%" },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.6 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 22 } },
  },
} satisfies Record<string, Variants>;

export type StaggerPreset = keyof typeof staggerPresets;

export function TextStagger({
  text,
  by = "word",
  preset = "blur",
  as = "span",
  delay = 0,
  stagger,
  once = true,
  className,
  pieceClassName,
}: {
  text: string;
  by?: "word" | "char";
  preset?: StaggerPreset;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  delay?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
  pieceClassName?: string;
}) {
  const Root = motion[as];
  const parts = by === "word" ? text.split(/(\s+)/) : Array.from(text);
  const clip = preset === "slide";

  return (
    <Root
      aria-label={text}
      data-slot="text-stagger"
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger ?? (by === "word" ? 0.06 : 0.02), delayChildren: delay } },
      }}
    >
      {parts.map((part, i) =>
        /^\s+$/.test(part) ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} aria-hidden className={cn("inline-block", clip && "overflow-hidden align-bottom")}>
            <motion.span variants={staggerPresets[preset]} className={cn("inline-block whitespace-pre", pieceClassName)}>
              {part}
            </motion.span>
          </span>
        ),
      )}
    </Root>
  );
}

/** Reveals text token by token, the way a model streams it. */
export function StreamingText({
  text,
  speed = 45,
  className,
  cursorClassName,
}: {
  text: string;
  speed?: number;
  className?: string;
  cursorClassName?: string;
}) {
  const tokens = text.match(/\S+\s*/g) ?? [];
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c >= tokens.length ? c : c + 1)), speed);
    return () => clearInterval(t);
  }, [tokens.length, speed]);

  return (
    <p className={className}>
      {tokens.slice(0, count).map((token, i) => (
        <motion.span key={i} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4 }}>
          {token}
        </motion.span>
      ))}
      {count < tokens.length && (
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className={cn("ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] rounded-full bg-base-300", cursorClassName)}
        />
      )}
    </p>
  );
}

export default function Demo() {
  const [run, setRun] = useState(0);

  return (
    <div key={run} className="relative flex w-full max-w-lg flex-col gap-6">
      <TextStagger as="h3" text="Interfaces that feel alive." className="text-3xl font-semibold tracking-tight text-base-50" />
      <TextStagger
        as="p"
        text="Streaming · 46 tok/s"
        by="char"
        preset="scale"
        delay={0.4}
        className="font-mono text-xs tracking-widest text-base-500 uppercase"
      />
      <StreamingText
        className="text-[15px] leading-7 text-base-400"
        text="Every token arrives with a little blur that settles into focus. It reads calm, keeps the eye on the newest words and never jumps the layout."
      />
      <button
        onClick={() => setRun((r) => r + 1)}
        className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-100"
      >
        <RotateCcw className="size-3" /> Replay
      </button>
    </div>
  );
}
