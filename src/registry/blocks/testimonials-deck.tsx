"use client";

import { Star } from "lucide-react";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";

const quotes = [
  {
    id: "1",
    quote: "Beacon flagged our wildcard certificate nine days before it expired. That one email paid for the year.",
    name: "Priya Raman",
    outcome: "9 days",
    outcomeNote: "of warning before the certificate expired",
    role: "Platform Lead, Ledgerly",
    tone: "paper",
  },
  {
    id: "2",
    quote: "We moved 140 monitors over in an afternoon. The 30-second checks found a flaky region our old tool had been averaging away.",
    name: "Tom Becker",
    outcome: "140",
    outcomeNote: "monitors moved over in one afternoon",
    role: "SRE, Parcelbay",
    tone: "signal",
  },
  {
    id: "3",
    quote: "On-call used to mean a group chat at 3 a.m. Now one person gets a phone call and everyone else sleeps.",
    name: "Ana Ruiz",
    outcome: "1 person",
    outcomeNote: "woken up per incident, not the whole team",
    role: "CTO, Fieldkit",
    tone: "ink",
  },
  {
    id: "4",
    quote: "Our status page went from an afterthought to the first thing customers check. Support tickets during incidents dropped by half.",
    name: "Daniel Okafor",
    outcome: "50%",
    outcomeNote: "fewer support tickets during incidents",
    role: "Head of Support, Tandem",
    tone: "paper",
  },
];

const tones = {
  paper: "bg-linear-to-b from-orange-50 to-neutral-200 text-neutral-800",
  signal: "bg-linear-to-b from-[color-mix(in_oklab,var(--color-blue-600)_78%,white)] dark:from-[color-mix(in_oklab,var(--color-blue-500)_78%,white)] to-[color-mix(in_oklab,var(--color-blue-600)_88%,black)] dark:to-[color-mix(in_oklab,var(--color-blue-500)_88%,black)] text-white",
  ink: "bg-linear-to-b from-neutral-800 to-neutral-900 text-neutral-100",
} as const;

/**
 * Testimonials dealt as a deck. Visitors fling through the quotes; the score
 * and logos stay put beside them.
 */
export function TestimonialsDeck({ className }: { className?: string }) {
  return (
    <section data-slot="testimonials-deck" className={cn("overflow-hidden bg-white dark:bg-black px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_24rem]">
        <div>
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-6xl">
            Fewer pages. <span className="font-serif font-normal tracking-[-0.01em] italic">Better sleep.</span>
          </h2>
          <div className="mt-10 flex items-center gap-5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-5 fill-blue-600 dark:fill-blue-500 text-blue-600 dark:text-blue-500" />
              ))}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-950 dark:text-neutral-50">4.8</span> on G2 from 640 reviews
            </p>
          </div>
          <p className="mt-12 text-sm text-neutral-500">Watching production for</p>
          <ul className="mt-3 flex max-w-md flex-wrap gap-x-7 gap-y-2">
            {["Ledgerly", "Parcelbay", "Fieldkit", "Tandem", "Northwind", "Kiln"].map((l) => (
              <li key={l} className="text-lg font-semibold tracking-[-0.02em] text-neutral-600 dark:text-neutral-400">
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[23rem]">
          <CardStack
            items={quotes}
            aspectRatio="6 / 7"
            className="max-w-none"
            renderItem={(q) => (
              <figure
                className={cn(
                  "flex size-full flex-col overflow-hidden rounded-[24px] p-7 shadow-[0_1px_0_rgb(255_255_255/0.4)_inset,0_30px_50px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/10 select-none",
                  tones[q.tone as keyof typeof tones],
                )}
              >
                {/* The outcome leads; the quote explains it */}
                <p className="text-6xl leading-none font-semibold tracking-[-0.05em] whitespace-nowrap">{q.outcome}</p>
                <p className="mt-2 text-sm leading-5 opacity-70">{q.outcomeNote}</p>
                <blockquote className="mt-auto text-xl leading-snug font-medium tracking-[-0.01em] text-pretty">&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-current/15 pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-current/10 text-[11px] font-semibold ring-1 ring-current/15">
                    {q.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{q.name}</span>
                    <span className="block text-xs opacity-70">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          />
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <TestimonialsDeck />;
}
