"use client";

import { useSyncExternalStore } from "react";
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

/**
 * Switches the theme in a single frame. Transitions are paused for the swap,
 * so hundreds of `transition-colors` elements don't each fade on their own
 * and the page doesn't drag behind the click.
 */
export function setTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  const pause = document.createElement("style");
  pause.textContent = ":not([data-theme-icon]),::before,::after{transition:none!important}";
  document.head.appendChild(pause);

  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  window.dispatchEvent(new Event(EVENT));

  // Force a style flush with transitions off, then hand them back.
  void getComputedStyle(root).color;
  requestAnimationFrame(() => pause.remove());
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);
  return { dark, theme: dark ? "dark" : "light", setTheme } as const;
}

/** An icon button: the sun turns away as the moon turns in. */
export function ThemeToggle() {
  const { dark } = useTheme();
  const icon = "absolute size-4 transition-[rotate,scale,opacity] duration-200 ease-out";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative grid size-8 place-items-center rounded-md text-neutral-600 dark:text-neutral-400 transition-colors outline-none hover:bg-neutral-950/[0.05] dark:hover:bg-neutral-50/[0.05] hover:text-neutral-950 dark:hover:text-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60"
    >
      <Sun data-theme-icon className={cn(icon, dark ? "scale-50 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} />
      <Moon data-theme-icon className={cn(icon, dark ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0")} />
    </button>
  );
}
