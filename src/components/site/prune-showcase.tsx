"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import PruneRevealDemo from "@/components/ui/prune-reveal-animation";

/** Mounts the demo once it scrolls into view, so the generating and the burn play where they are seen. */
export function PruneShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });
  return (
    <div ref={ref} className="flex min-h-[38rem] w-full justify-center">
      {seen ? <PruneRevealDemo /> : <div className="aspect-[4/5] w-full max-w-md rounded-2xl bg-neutral-900 ring-1 ring-black/10 dark:ring-white/10" />}
    </div>
  );
}
