"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Bold, Code2, Italic, Link2, List, Quote, Strikethrough, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const tooltipVariants = cva(
  "pointer-events-none absolute z-20 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg shadow-shade/40",
  {
    variants: {
      side: {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
      },
      tone: {
        dark: "bg-base-800 text-base-100 ring-1 ring-base-50/10",
        light: "bg-base-50 text-base-900 ring-1 ring-black/5 [&_kbd]:text-base-500",
      },
    },
    defaultVariants: { side: "top", tone: "dark" },
  },
);

type Tool = { label: string; icon: LucideIcon; kbd?: string };

/**
 * A toolbar whose tooltip waits before appearing the first time,
 * then glides between buttons while you keep hovering.
 */
export function TooltipToolbar({
  tools,
  delay = 400,
  side,
  tone,
  className,
  tooltipClassName,
}: VariantProps<typeof tooltipVariants> & {
  tools: Tool[];
  delay?: number;
  className?: string;
  tooltipClassName?: string;
}) {
  const id = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const enter = (i: number) => {
    setHovered(i);
    if (!visible) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(true), delay);
    }
  };

  const leave = () => {
    clearTimeout(timer.current);
    setHovered(null);
    setVisible(false);
  };

  return (
    <div
      data-slot="tooltip-toolbar"
      onPointerLeave={leave}
      className={cn(
        "flex items-center gap-0.5 rounded-xl bg-base-900 p-1 shadow-xl shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
        className,
      )}
    >
      {tools.map((tool, i) => (
        <button
          key={tool.label}
          aria-label={tool.label}
          onPointerEnter={() => enter(i)}
          onFocus={() => {
            setHovered(i);
            setVisible(true);
          }}
          onBlur={leave}
          className="relative grid size-8 place-items-center rounded-lg text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100"
        >
          <tool.icon className="size-4" />
          <AnimatePresence>
            {visible && hovered === i && (
              <motion.span
                layoutId={`${id}-tip`}
                initial={{ opacity: 0, y: side === "bottom" ? -4 : 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                className={cn(tooltipVariants({ side, tone }), tooltipClassName)}
              >
                <motion.span layout="position">{tool.label}</motion.span>
                {tool.kbd && <kbd className="font-mono text-[10px] text-base-500">{tool.kbd}</kbd>}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}

const tools: Tool[] = [
  { label: "Bold", icon: Bold, kbd: "⌘B" },
  { label: "Italic", icon: Italic, kbd: "⌘I" },
  { label: "Strikethrough", icon: Strikethrough },
  { label: "Link", icon: Link2, kbd: "⌘K" },
  { label: "Quote", icon: Quote },
  { label: "List", icon: List },
  { label: "Code", icon: Code2, kbd: "⌘E" },
];

export default function Demo() {
  return (
    <div className="py-12">
      <TooltipToolbar tools={tools} />
    </div>
  );
}
