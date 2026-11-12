"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT = "themechange";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const isDark = () => document.documentElement.classList.contains("dark");

export function setTheme(theme: "light" | "dark") {
  const apply = () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event(EVENT));
  };
  // Cross-fade the whole page when the browser supports view transitions.
  if (document.startViewTransition) document.startViewTransition(apply);
  else apply();
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  return { dark, theme: dark ? "dark" : "light", setTheme } as const;
}

/**
 * A rotary mode selector: a knurled knob between a sun and a moon. The pointer
 * clicks across to the active side with a little overshoot, a lamp lights under
 * the chosen mode, and hovering nudges the pointer toward the other one.
 */
export function ThemeToggle() {
  const { dark } = useTheme();
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const angle = (dark ? 55 : -55) + (hover ? (dark ? -10 : 10) : 0);

  const glyph = (on: boolean) =>
    cn("relative grid size-4 place-items-center transition-colors duration-300 [&_svg]:size-3.5", on ? "text-base-50" : "text-base-500");
  const lamp = (on: boolean) =>
    cn(
      "absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full transition-all duration-300",
      on ? "bg-signal shadow-[0_0_6px_var(--signal)]" : "bg-transparent",
    );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Night mode"
      onClick={() => setTheme(dark ? "light" : "dark")}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      className="flex h-9 items-center gap-1.5 rounded-full bg-base-50/[0.05] px-2 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-base-50/[0.07] outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
    >
      <span className={glyph(!dark)}>
        <Sun />
        <span className={lamp(!dark)} />
      </span>
      <motion.span
        animate={{ scale: pressed ? 0.9 : 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 28 }}
        className="relative size-[26px] rounded-full bg-linear-to-b from-white to-base-800 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.18),0_4px_8px_-3px_rgb(0_0_0/0.3)] ring-1 ring-black/10 dark:from-base-600 dark:to-base-800 dark:shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_2px_6px_rgb(0_0_0/0.5)] dark:ring-white/5"
      >
        <motion.span
          initial={false}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 420, damping: 16, mass: 0.8 }}
          className="absolute inset-0 rounded-full"
        >
          <span className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(rgb(0_0_0/0.08)_0deg_2deg,transparent_2deg_9deg)] [mask-image:radial-gradient(circle,transparent_55%,black_58%)] dark:bg-[repeating-conic-gradient(rgb(255_255_255/0.07)_0deg_2deg,transparent_2deg_9deg)]" />
          <span className="absolute top-[3px] left-1/2 h-[8px] w-[2.5px] -translate-x-1/2 rounded-full bg-signal shadow-[0_0_6px_var(--signal)]" />
        </motion.span>
        <span className="absolute inset-[30%] rounded-full bg-linear-to-b from-base-900 to-white ring-1 ring-black/5 dark:from-base-900 dark:to-base-700 dark:ring-white/5" />
      </motion.span>
      <span className={glyph(dark)}>
        <Moon />
        <span className={lamp(dark)} />
      </span>
    </button>
  );
}
