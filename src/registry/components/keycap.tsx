"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Check, CornerDownLeft, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `--edge` is the colour of the key's side wall, `--lip` its height. The face
 * sinks into the wall on press instead of scaling, like a real key.
 */
export const keycapVariants = cva(
  "group/key relative inline-flex shrink-0 cursor-pointer rounded-[14px] bg-(--edge) pb-(--lip) outline-none transition-[padding,translate,box-shadow] duration-100 ease-out select-none focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950 disabled:pointer-events-none disabled:opacity-50 active:translate-y-(--lip) active:pb-0 data-[pressed=true]:translate-y-(--lip) data-[pressed=true]:pb-0 shadow-[0_10px_18px_-8px_color-mix(in_oklab,var(--color-shade)_70%,transparent)] active:shadow-[0_2px_4px_-2px_color-mix(in_oklab,var(--color-shade)_70%,transparent)] data-[pressed=true]:shadow-[0_2px_4px_-2px_color-mix(in_oklab,var(--color-shade)_70%,transparent)]",
  {
    variants: {
      tone: {
        signal:
          "[--edge:color-mix(in_oklab,var(--signal)_62%,black)] [--face-a:color-mix(in_oklab,var(--signal)_82%,white)] [--face-b:var(--signal)] text-white",
        ink: "[--edge:black] [--face-a:var(--color-base-300)] [--face-b:var(--color-base-50)] text-base-950 dark:[--edge:var(--color-base-500)] dark:[--face-a:white] dark:[--face-b:var(--color-base-200)]",
        paper:
          "[--edge:var(--color-base-700)] [--face-a:white] [--face-b:var(--color-base-900)] text-base-100 dark:[--edge:black] dark:[--face-a:var(--color-base-700)] dark:[--face-b:var(--color-base-800)]",
      },
      size: {
        sm: "[--lip:3px] text-[13px] [&_[data-face]]:h-8 [&_[data-face]]:px-3",
        md: "[--lip:4px] text-sm [&_[data-face]]:h-10 [&_[data-face]]:px-4",
        lg: "[--lip:5px] text-[15px] [&_[data-face]]:h-12 [&_[data-face]]:px-5",
      },
    },
    defaultVariants: { tone: "paper", size: "md" },
  },
);

/**
 * A button that behaves like a physical key. Give it a `hotkey` and pressing
 * that key on the keyboard sinks the button too, then fires onClick.
 */
export function Keycap({
  tone,
  size,
  hotkey,
  legend,
  className,
  children,
  onClick,
  ...props
}: VariantProps<typeof keycapVariants> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** A KeyboardEvent.key, e.g. "Enter" or "k". */
    hotkey?: string;
    /** Small glyph printed in the corner of the face. */
    legend?: ReactNode;
  }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!hotkey) return;
    const target = (e: KeyboardEvent) =>
      e.key.toLowerCase() === hotkey.toLowerCase() &&
      !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (!target(e) || e.repeat || ref.current?.disabled) return;
      // Let a focused button handle its own Enter / Space.
      if (document.activeElement instanceof HTMLButtonElement && (e.key === "Enter" || e.key === " ")) return;
      e.preventDefault();
      setPressed(true);
    };
    const up = (e: KeyboardEvent) => {
      if (!target(e)) return;
      setPressed((was) => {
        if (was) queueMicrotask(() => ref.current?.click());
        return false;
      });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [hotkey]);

  return (
    <button
      ref={ref}
      data-slot="keycap"
      data-pressed={pressed}
      onClick={onClick}
      className={cn(keycapVariants({ tone, size }), className)}
      {...props}
    >
      <span
        data-face
        className="relative flex w-full items-center justify-center gap-2 rounded-[13px] bg-linear-to-b from-(--face-a) to-(--face-b) font-medium whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.45),inset_0_-1px_0_rgb(0_0_0/0.08)] ring-1 ring-black/10 [&_svg]:size-4"
      >
        {children}
        {legend && <span className="ml-1 font-mono text-[10px] opacity-60 [&_svg]:size-3">{legend}</span>}
      </span>
    </button>
  );
}

type State = "idle" | "busy" | "done";

export default function Demo() {
  const [state, setState] = useState<State>("idle");
  const deploy = () => {
    if (state !== "idle") return;
    setState("busy");
    setTimeout(() => setState("done"), 1400);
    setTimeout(() => setState("idle"), 3200);
  };

  const label = {
    idle: { icon: null, text: "Deploy" },
    busy: { icon: <LoaderCircle className="animate-spin" />, text: "Deploying" },
    done: { icon: <Check />, text: "Live" },
  }[state];

  return (
    <div className="flex flex-col items-center gap-8">
      <Keycap tone="signal" size="lg" hotkey="Enter" legend={state === "idle" && <CornerDownLeft />} onClick={deploy} className="min-w-40">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="flex items-center gap-2"
          >
            {label.icon}
            {label.text}
          </motion.span>
        </AnimatePresence>
      </Keycap>
      <div className="flex items-center gap-3">
        <Keycap tone="paper" size="sm" hotkey="z" legend="Z">
          Undo
        </Keycap>
        <Keycap tone="ink" size="sm" hotkey="s" legend="S">
          Save
        </Keycap>
      </div>
    </div>
  );
}
