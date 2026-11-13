"use client";

import { Fragment, useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Entrance presets. Add your own: `hidden` → `show`. */
export const staggerPresets = {
  blur: {
    hidden: { opacity: 0, y: "0.25em", filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  },
  rise: {
    hidden: { y: "105%" },
    show: { y: 0, transition: { duration: 0.7, ease } },
  },
} satisfies Record<string, Variants>;

export type StaggerPreset = keyof typeof staggerPresets;

/**
 * Text that arrives a word (or letter) at a time. Words never break mid-way,
 * so it wraps naturally at any width, and screen readers get the plain sentence.
 */
export function TextStagger({
  text,
  by = "word",
  preset = "blur",
  as = "span",
  delay = 0,
  stagger,
  once = true,
  className,
}: {
  text: string;
  by?: "word" | "char";
  preset?: StaggerPreset;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  delay?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
}) {
  const Root = motion[as];
  const words = text.split(/\s+/).filter(Boolean);
  const clip = preset === "rise";
  const piece = (content: string, key: string | number) => (
    <span key={key} className={cn("inline-block", clip && "overflow-hidden pb-[0.12em] align-top")}>
      <motion.span variants={staggerPresets[preset]} className="inline-block">
        {content}
      </motion.span>
    </span>
  );

  return (
    <Root
      data-slot="text-stagger"
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger ?? (by === "word" ? 0.07 : 0.018), delayChildren: delay } } }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={i}>
            {by === "word" ? (
              piece(word, i)
            ) : (
              // Letters of one word stay together on one line.
              <span className="inline-block whitespace-nowrap">{Array.from(word).map((c, j) => piece(c, j))}</span>
            )}
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Root>
  );
}

/** Reveals text token by token, the way a model streams it. */
export function StreamingText({
  text,
  speed = 45,
  className,
}: {
  text: string;
  /** Milliseconds per token. */
  speed?: number;
  className?: string;
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
        <motion.span key={i} initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.35 }}>
          {token}
        </motion.span>
      ))}
      {count < tokens.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse rounded-full bg-signal" />}
    </p>
  );
}

export default function Demo() {
  const [run, setRun] = useState(0);

  return (
    <div key={run} className="flex w-full max-w-md flex-col">
      <TextStagger
        as="h3"
        preset="rise"
        text="Ship the update without the all-nighter."
        className="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-base-50 @md:text-4xl"
      />
      <StreamingText
        className="mt-5 text-[15px] leading-7 text-pretty text-base-400"
        text="Release notes write themselves from your merged pull requests. Each one lands as a short, plain sentence your customers can actually read."
      />
      <button
        onClick={() => setRun((r) => r + 1)}
        className="mt-6 flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-base-500 transition-colors hover:bg-base-50/5 hover:text-base-100"
      >
        <RotateCcw className="size-3" /> Replay
      </button>
    </div>
  );
}
