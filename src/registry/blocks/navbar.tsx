"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Hexagon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultLinks = ["Product", "Solutions", "Pricing", "Changelog", "Docs"];

export function Navbar({ links = defaultLinks, className }: { links?: string[]; className?: string }) {
  const id = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <header data-slot="navbar" className={cn("relative z-10 px-4 pt-4", className)}>
      <nav className="mx-auto flex h-14 max-w-5xl items-center gap-6 rounded-2xl bg-base-950/80 pr-2 pl-4 shadow-lg shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 backdrop-blur-xl">
        <a href="#" className="flex items-center gap-2 font-semibold tracking-tight text-base-50">
          <span className="grid size-7 place-items-center rounded-lg bg-linear-to-b from-blue-500 to-blue-600 text-white inset-shadow-2xs inset-shadow-white/40">
            <Hexagon className="size-4" />
          </span>
          Lumen
        </a>

        <ul className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {links.map((l) => (
            <li key={l}>
              <a
                href="#"
                onMouseEnter={() => setHovered(l)}
                className="relative block px-3.5 py-1.5 text-sm text-base-400 transition-colors hover:text-base-50"
              >
                {hovered === l && (
                  <motion.span
                    layoutId={`${id}-hover`}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    className="absolute inset-0 rounded-lg bg-base-50/[0.06]"
                  />
                )}
                <span className="relative">{l}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5">
          <a href="#" className="hidden h-9 items-center rounded-xl px-3 text-sm text-base-400 transition-colors hover:text-base-50 sm:inline-flex">
            Sign in
          </a>
          <a
            href="#"
            className="group hidden h-9 items-center gap-1.5 rounded-xl bg-base-50 px-3.5 text-sm font-medium text-base-950 shadow-md shadow-shade/30 transition-transform active:scale-[0.97] sm:inline-flex"
          >
            Get started <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-xl text-base-300 ring-1 ring-base-50/10 md:hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={open ? "x" : "menu"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
            className="mx-auto mt-2 max-w-5xl origin-top rounded-2xl bg-base-950 p-2 shadow-xl shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 md:hidden"
          >
            {links.map((l, i) => (
              <motion.a
                key={l}
                href="#"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="block rounded-xl px-3 py-2.5 text-[15px] text-base-200 hover:bg-base-50/5"
              >
                {l}
              </motion.a>
            ))}
            <a href="#" className="mt-2 flex h-11 items-center justify-center rounded-xl bg-base-50 text-sm font-medium text-base-950">
              Get started
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function Block() {
  return (
    <div className="bg-canvas pb-40">
      <Navbar />
      <div className="mx-auto mt-24 max-w-5xl space-y-3 px-8">
        <div className="h-8 w-2/3 rounded-lg bg-base-950 ring-1 ring-base-50/5" />
        <div className="h-4 w-1/2 rounded bg-base-950 ring-1 ring-base-50/5" />
      </div>
    </div>
  );
}
