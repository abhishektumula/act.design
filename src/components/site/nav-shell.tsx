"use client";

import { useState, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/** The top bar: open at the top of the page, a hairline under it once the page scrolls beneath. */
export function NavShell({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-xl transition-colors duration-200 ${
        scrolled ? "border-base-50/[0.08] bg-canvas/85" : "border-transparent bg-canvas/60"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-6">{children}</div>
    </header>
  );
}
