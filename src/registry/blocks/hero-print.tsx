"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const INK = "#1f40b0";

/**
 * A quiet, centred hero over a two-colour engraving, shown as printed: no
 * overlay, no tint. The type is set in the same blue ink as the print and
 * sits in the open sky; the landscape holds the bottom of the page and eases
 * down a little as you scroll past.
 */
export function HeroPrint({ image = "/blocks/fresco.jpg", className }: { image?: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section ref={ref} data-slot="hero-print" className={cn("relative isolate flex min-h-[760px] flex-col overflow-hidden bg-[#f7a76a] sm:min-h-[900px]", className)} style={{ color: INK }}>
      <motion.div aria-hidden className="absolute inset-0 -z-10" style={reduce ? undefined : { y: sink }}>
        <motion.div className="relative size-full" initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}>
          <Image src={image} alt="" fill loading="eager" sizes="100vw" className="object-cover object-bottom" />
        </motion.div>
      </motion.div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 pt-5 text-sm font-medium">
        <a href="#" className="text-[15px] font-semibold tracking-[-0.02em]">
          Atlas Press
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {["Issues", "Printing", "Stockists", "About"].map((l) => (
            <a key={l} href="#" className="opacity-80 transition-opacity hover:opacity-100">
              {l}
            </a>
          ))}
        </nav>
        <a href="#" className="rounded-full px-4 py-2 text-[#fbe4cf] transition-opacity hover:opacity-90" style={{ background: INK }}>
          Subscribe
        </a>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-20 text-center sm:pt-24">
        <motion.p {...rise(0)} className="text-xs font-medium tracking-[0.08em] uppercase">
          No. 07 · The Peloponnese
        </motion.p>
        <motion.h1 {...rise(0.08)} className="mt-5 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-[68px]">
          Slow guides for old places.
        </motion.h1>
        <motion.p {...rise(0.16)} className="mt-5 max-w-md text-base leading-7 text-pretty opacity-80 sm:text-lg">
          Printed by hand in two inks, one region at a time, for people who take the long way round.
        </motion.p>
        <motion.div {...rise(0.24)} className="mt-9 flex items-center gap-3 text-sm font-medium">
          <a href="#" className="rounded-full px-5 py-3 text-[#fbe4cf] transition-transform hover:-translate-y-px" style={{ background: INK }}>
            Order No. 07 · €24
          </a>
          <a href="#" className="rounded-full px-5 py-3 shadow-[inset_0_0_0_1.5px_currentColor] transition-colors hover:bg-[#1f40b0]/[0.07]">
            Back issues
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroPrint />;
}
