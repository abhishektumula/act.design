"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, AtSign, Check, GitBranch, Hexagon, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultColumns = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
  { title: "Resources", links: ["Docs", "Guides", "API status", "Support"] },
];

export function Footer({
  columns = defaultColumns,
  brand = "Lumen",
  className,
}: {
  columns?: { title: string; links: string[] }[];
  brand?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer data-slot="footer" className={cn("relative overflow-hidden border-t border-base-50/5 bg-canvas px-6 pt-20", className)}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight text-base-50">
            <span className="grid size-7 place-items-center rounded-lg bg-linear-to-b from-blue-500 to-blue-600 text-white inset-shadow-2xs inset-shadow-white/40">
              <Hexagon className="size-4" />
            </span>
            {brand}
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-base-500">One short email a month about what we shipped. No fluff.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setDone(true);
            }}
            className="mt-5 flex max-w-xs items-center gap-1.5 rounded-xl bg-base-950 p-1 pl-3 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/40 focus-within:ring-base-50/25"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-8 min-w-0 flex-1 bg-transparent text-sm text-base-100 outline-none placeholder:text-base-600"
            />
            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label="Subscribe"
              className={cn(
                "grid size-8 place-items-center rounded-lg transition-colors",
                done ? "bg-emerald-500 text-neutral-950" : "bg-base-50 text-base-950",
              )}
            >
              {done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            </motion.button>
          </form>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-medium text-base-200">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="group inline-flex items-center gap-1 text-sm text-base-500 transition-colors hover:text-base-100">
                    {l}
                    <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-base-50/5 py-6 text-xs text-base-500">
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500" />
            <span className="relative size-1.5 rounded-full bg-emerald-500" />
          </span>
          All systems normal
        </span>
        <span>© 2026 {brand}, Inc.</span>
        <div className="flex gap-1">
          {[GitBranch, AtSign, Rss].map((Icon, i) => (
            <a key={i} href="#" className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-base-50/5 hover:text-base-100">
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Oversized wordmark, clipped by the bottom edge */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.2em] text-center text-[clamp(6rem,22vw,18rem)] leading-none font-semibold tracking-[-0.06em] text-transparent bg-linear-to-b from-base-800 to-canvas bg-clip-text select-none"
      >
        {brand.toLowerCase()}
      </p>
    </footer>
  );
}

export default function Block() {
  return <Footer />;
}
