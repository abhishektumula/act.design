"use client";

import { useSyncExternalStore } from "react";

/** Accent presets. `signal` means "use the theme's own --signal". */
export const accents = {
  signal: "var(--color-orange-600)",
  cobalt: "var(--color-blue-600)",
  moss: "var(--color-emerald-600)",
  violet: "var(--color-violet-500)",
} as const;

export type Accent = keyof typeof accents;

const KEY = "accent";
const EVENT = "accentchange";

function read(): Accent {
  try {
    const v = localStorage.getItem(KEY);
    return v && v in accents ? (v as Accent) : "signal";
  } catch {
    return "signal";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Sets the accent on <html> for the whole site and remembers it. Block iframes follow via the storage event. */
export function setAccent(accent: Accent) {
  const root = document.documentElement.style;
  if (accent === "signal") root.removeProperty("--signal");
  else root.setProperty("--signal", accents[accent]);
  try {
    if (accent === "signal") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, accent);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useAccent() {
  return useSyncExternalStore(subscribe, read, () => "signal" as Accent);
}
