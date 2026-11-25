"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Check, CornerDownLeft, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Each solid tone is built from the same five layers, outside in:
 *   1. a 1px edge in a darker shade of the fill (drawn as a shadow, so it never shifts layout)
 *   2. a tight contact shadow, 1px below
 *   3. a soft, tinted lift shadow
 *   4. an inner highlight along the top edge, where light catches the bevel
 *   5. an inner shade along the bottom edge
 * plus a faint top-to-bottom sheen on the fill. Pressing drops the lift, flattens the
 * bevel into a sunken inner shadow and nudges the face down half a pixel.
 */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium tracking-[-0.006em] whitespace-nowrap outline-none select-none",
    "bg-linear-to-b transition-[background-color,box-shadow,transform,color] duration-150 ease-out",
    "[&:is(:active,[data-pressed=true])]:translate-y-[0.5px] [&:is(:active,[data-pressed=true])]:duration-75",
    "focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50 [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      tone: {
        signal: [
          "bg-blue-600 dark:bg-blue-500 from-white/16 to-white/0 text-white [text-shadow:0_1px_0_rgb(0_0_0/0.18)]",
          "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-600)_72%,black),0_1px_1px_rgb(0_0_0/0.14),0_4px_10px_-4px_color-mix(in_oklab,var(--color-blue-600)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.28),inset_0_-1px_0_rgb(0_0_0/0.14)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-500)_72%,black),0_1px_1px_rgb(0_0_0/0.14),0_4px_10px_-4px_color-mix(in_oklab,var(--color-blue-500)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.28),inset_0_-1px_0_rgb(0_0_0/0.14)]",
          "hover:bg-[color-mix(in_oklab,var(--color-blue-600)_92%,white)] dark:hover:bg-[color-mix(in_oklab,var(--color-blue-500)_92%,white)]",
          "[&:is(:active,[data-pressed=true])]:bg-[color-mix(in_oklab,var(--color-blue-600)_90%,black)] dark:[&:is(:active,[data-pressed=true])]:bg-[color-mix(in_oklab,var(--color-blue-500)_90%,black)] [&:is(:active,[data-pressed=true])]:from-black/6 [&:is(:active,[data-pressed=true])]:to-white/0",
          "[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-600)_65%,black),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.28),inset_0_-1px_0_rgb(255_255_255/0.08)] dark:[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-500)_65%,black),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.28),inset_0_-1px_0_rgb(255_255_255/0.08)]",
        ].join(" "),
        ink: [
          "bg-neutral-950 dark:bg-neutral-50 from-white/12 to-white/0 text-neutral-50 dark:text-neutral-950 dark:from-black/0 dark:to-black/8",
          "shadow-[0_0_0_1px_var(--color-neutral-950),0_1px_1px_rgb(0_0_0/0.2),0_4px_10px_-4px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-1px_0_rgb(0_0_0/0.4)] dark:shadow-[0_0_0_1px_var(--color-neutral-50),0_1px_1px_rgb(0_0_0/0.2),0_4px_10px_-4px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-1px_0_rgb(0_0_0/0.4)]",
          "dark:shadow-[0_0_0_1px_var(--color-neutral-300),0_1px_1px_rgb(0_0_0/0.4),0_4px_10px_-4px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.9),inset_0_-1px_0_rgb(0_0_0/0.14)]",
          "hover:bg-neutral-900 dark:hover:bg-neutral-100",
          "[&:is(:active,[data-pressed=true])]:bg-neutral-800 dark:[&:is(:active,[data-pressed=true])]:bg-neutral-200",
          "[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_var(--color-neutral-950),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.45),inset_0_-1px_0_rgb(255_255_255/0.06)] dark:[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_var(--color-neutral-50),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.45),inset_0_-1px_0_rgb(255_255_255/0.06)]",
          "dark:[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_var(--color-neutral-300),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.22),inset_0_-1px_0_rgb(255_255_255/0.4)]",
        ].join(" "),
        paper: [
          "bg-white from-white to-neutral-50 text-neutral-900 dark:text-neutral-100 dark:bg-neutral-900 dark:from-neutral-800/60 dark:to-neutral-900",
          "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_11%,transparent),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-4px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255),inset_0_-1px_0_color-mix(in_oklab,var(--color-neutral-950)_5%,transparent)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_11%,transparent),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-4px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255),inset_0_-1px_0_color-mix(in_oklab,var(--color-neutral-50)_5%,transparent)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_1px_1px_rgb(0_0_0/0.5),0_4px_10px_-4px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.07),inset_0_-1px_0_rgb(0_0_0/0.25)]",
          "hover:to-neutral-100 hover:text-neutral-950 dark:hover:text-neutral-50 dark:hover:from-neutral-800 dark:hover:to-neutral-900",
          "[&:is(:active,[data-pressed=true])]:from-neutral-50 [&:is(:active,[data-pressed=true])]:to-neutral-50 dark:[&:is(:active,[data-pressed=true])]:from-neutral-900 dark:[&:is(:active,[data-pressed=true])]:to-neutral-900",
          "[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_12%,transparent),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_2px_rgb(0_0_0/0.08),inset_0_-1px_0_rgb(255_255_255/0.6)] dark:[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_12%,transparent),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_2px_rgb(0_0_0/0.08),inset_0_-1px_0_rgb(255_255_255/0.6)]",
          "dark:[&:is(:active,[data-pressed=true])]:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_0_0_transparent,0_0_0_0_transparent,inset_0_1px_3px_rgb(0_0_0/0.5),inset_0_-1px_0_rgb(255_255_255/0.04)]",
        ].join(" "),
        ghost: [
          "text-neutral-700 dark:text-neutral-300 from-transparent to-transparent hover:text-neutral-950 dark:hover:text-neutral-50",
          "hover:bg-neutral-950/[0.045] dark:hover:bg-neutral-50/[0.045] hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_6%,transparent)] dark:hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_6%,transparent)]",
          "[&:is(:active,[data-pressed=true])]:bg-neutral-950/[0.07] dark:[&:is(:active,[data-pressed=true])]:bg-neutral-50/[0.07] [&:is(:active,[data-pressed=true])]:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent),inset_0_1px_2px_rgb(0_0_0/0.08)] dark:[&:is(:active,[data-pressed=true])]:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent),inset_0_1px_2px_rgb(0_0_0/0.08)]",
        ].join(" "),
      },
      size: {
        sm: "h-8 rounded-[10px] px-3 text-[13px]",
        md: "h-10 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-[14px] px-5 text-[15px]",
      },
    },
    defaultVariants: { tone: "paper", size: "md" },
  },
);

/** The small printed key shown inside a button, e.g. ⏎ or K. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "-mr-1 inline-grid h-5 min-w-5 place-items-center rounded-[6px] bg-current/10 px-1 font-sans text-[11px] leading-none font-medium opacity-85 [text-shadow:none] shadow-[inset_0_1px_1.5px_rgb(0_0_0/0.14),0_1px_0_rgb(255_255_255/0.1)] [&_svg]:size-3",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * A quiet button. Give it a `hotkey` and that key on the keyboard clicks it too;
 * the key is printed inside the button so people can find it.
 */
export function Button({
  tone,
  size,
  hotkey,
  kbd,
  className,
  children,
  ...props
}: VariantProps<typeof buttonVariants> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** A KeyboardEvent.key, e.g. "Enter" or "k". */
    hotkey?: string;
    /** What to print for the hotkey. Defaults to the key itself. */
    kbd?: ReactNode;
  }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!hotkey) return;
    const matches = (e: KeyboardEvent) =>
      e.key.toLowerCase() === hotkey.toLowerCase() &&
      !e.metaKey &&
      !e.ctrlKey &&
      !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (!matches(e) || e.repeat || ref.current?.disabled) return;
      // A focused button handles its own Enter and Space.
      if (document.activeElement instanceof HTMLButtonElement && (e.key === "Enter" || e.key === " ")) return;
      e.preventDefault();
      setPressed(true);
    };
    const up = (e: KeyboardEvent) => {
      if (!matches(e)) return;
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

  const printed = kbd ?? (hotkey === "Enter" ? <CornerDownLeft /> : hotkey?.toUpperCase());

  return (
    <button ref={ref} data-slot="button" data-pressed={pressed} className={cn(buttonVariants({ tone, size }), className)} {...props}>
      {children}
      {hotkey && <Kbd>{printed}</Kbd>}
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
    done: { icon: <Check />, text: "Deployed" },
  }[state];

  return (
    <div className="flex flex-col items-center gap-6">
      <Button tone="signal" size="lg" hotkey="Enter" onClick={deploy} className="min-w-40">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2"
          >
            {label.icon}
            {label.text}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}
