"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";

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
  const dark = useSyncExternalStore(subscribe, isDark, () => true);
  return { dark, theme: dark ? "dark" : "light", setTheme } as const;
}

export function ThemeToggle() {
  const { dark } = useTheme();

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid size-9 place-items-center overflow-hidden rounded-xl text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-50"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}
        >
          {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
