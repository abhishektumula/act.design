"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Faq = { q: string; a: string };

const defaultFaqs: Faq[] = [
  { q: "Is there a free plan?", a: "Yes. Hobby is free forever for personal projects, with generous limits and no card required." },
  { q: "Can I bring my own domain?", a: "Any plan can attach custom domains. We provision and renew TLS certificates automatically." },
  { q: "How does billing work for teams?", a: "You pay per active seat. Viewers and guests are free, and unused seats are prorated back each month." },
  { q: "Where is my data stored?", a: "Choose US or EU residency per project. Data is encrypted at rest with AES-256 and never leaves the region." },
  { q: "Can I cancel anytime?", a: "Of course. Downgrade or cancel from settings in two clicks, and export everything as JSON or CSV." },
];

function Item({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn("rounded-2xl transition-colors", open ? "bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5" : "hover:bg-base-950/60")}>
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left">
        <span className={cn("font-medium transition-colors", open ? "text-base-50" : "text-base-300")}>{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full ring-1 transition-colors",
            open ? "bg-base-50 text-base-950 ring-transparent" : "text-base-500 ring-base-50/10",
          )}
        >
          <Plus className="size-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-pretty text-base-400">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ({ faqs = defaultFaqs, className }: { faqs?: Faq[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section data-slot="faq" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">Questions, answered.</h2>
          <p className="mt-4 max-w-sm text-lg leading-8 text-base-400">Can&apos;t find what you&apos;re looking for? Our team replies within the hour.</p>
          <a href="#" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-base-100">
            Talk to us <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="space-y-1">
          {faqs.map((f, i) => (
            <Item key={f.q} faq={f} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <FAQ />;
}
