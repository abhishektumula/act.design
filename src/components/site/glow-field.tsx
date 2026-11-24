"use client";

import { useEffect } from "react";

/** How far from the cursor a card's border can still catch the light, in px. */
const REACH = 260;

/**
 * Lights the borders of every `[data-glow]` card near the cursor, anywhere on the page:
 * the card under the pointer and its neighbours, each lit on the edge facing the cursor.
 * The look lives in globals.css; this only feeds each card the cursor in its own
 * coordinates (--gx/--gy) and whether it is in reach (--glow).
 *
 * Cards inside a `[data-glow-live]` container (a drifting or draggable canvas) move on
 * their own, so while one is on the page it keeps measuring every frame the pointer is
 * in the window, not only when the mouse moves.
 *
 * Mount once, in a layout.
 */
export function GlowField() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = -1e4;
    let y = -1e4;
    let inside = false;
    let frame = 0;
    let lit = new Set<HTMLElement>();

    const paint = () => {
      frame = 0;
      const cards = document.querySelectorAll<HTMLElement>("[data-glow]");
      // Read every rect first, then write, so the style writes never force a layout mid-loop.
      const rects = Array.from(cards, (card) => card.getBoundingClientRect());
      const next = new Set<HTMLElement>();
      cards.forEach((card, i) => {
        const r = rects[i];
        if (x > r.left - REACH && x < r.right + REACH && y > r.top - REACH && y < r.bottom + REACH) {
          next.add(card);
          card.style.setProperty("--glow", "1");
          card.style.setProperty("--gx", `${x - r.left}px`);
          card.style.setProperty("--gy", `${y - r.top}px`);
        }
      });
      for (const card of lit) if (!next.has(card)) card.style.setProperty("--glow", "0");
      lit = next;

      if (inside && document.querySelector("[data-glow-live]")) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      inside = true;
      schedule();
    };
    const leave = () => {
      x = y = -1e4;
      inside = false;
      schedule();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule, { capture: true });
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, []);

  return null;
}
