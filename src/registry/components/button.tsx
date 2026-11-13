"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Check, CornerDownLeft, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap outline-none transition-[background-color,color,box-shadow] duration-150 select-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      tone: {
        signal:
          "bg-signal text-white shadow-[0_1px_2px_rgb(0_0_0/0.14),inset_0_1px_0_rgb(255_255_255/0.16)] hover:bg-[color-mix(in_oklab,var(--signal)_90%,white)] data-[pressed=true]:bg-[color-mix(in_oklab,var(--signal)_90%,black)]",
        ink: "bg-base-50 text-base-950 shadow-[0_1px_2px_rgb(0_0_0/0.14)] hover:bg-base-200 data-[pressed=true]:bg-base-300",
        paper:
          "bg-base-950 text-base-100 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-base-50/10 hover:bg-base-900 data-[pressed=true]:bg-base-800 dark:bg-base-900 dark:hover:bg-base-800",
        ghost: "text-base-300 hover:bg-base-50/[0.06] hover:text-base-50 data-[pressed=true]:bg-base-50/10",
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
        "-mr-1 inline-grid h-5 min-w-5 place-items-center rounded-md bg-current/10 px-1 font-sans text-[11px] leading-none font-medium opacity-80 [&_svg]:size-3",
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
      <div className="flex items-center gap-2">
        <Button size="sm" hotkey="z">
          Undo
        </Button>
        <Button size="sm" tone="ink" hotkey="s">
          Save
        </Button>
        <Button size="sm" tone="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
